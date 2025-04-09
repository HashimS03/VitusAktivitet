console.log("LOOK FOR ME IN THE LOGS");

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { sql, poolPromise } = require("./db");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
  })
);

// Middleware to check if user is authenticated
const authenticateUser = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  next();
};

// 🔹 Route to Register a User
app.post("/register", async (req, res) => {
  console.log("Register request received:", req.body);
  try {
    const { name, email, password, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const pool = await poolPromise;
    await pool
      .request()
      .input("name", sql.NVarChar, name || null)
      .input("email", sql.NVarChar, email || null)
      .input("password", sql.VarChar, hashedPassword)
      .input("avatar", sql.Image, avatar || null)
      .query(`
        INSERT INTO [USER] ([name], [email], [password], [avatar], [created_at], [last_login])
        VALUES (@name, @email, @password, @avatar, GETDATE(), NULL)
      `);

    console.log("User registered successfully:", { name, email });
    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    if (err.number === 2627) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔹 Route to Login
app.post("/login", async (req, res) => {
  console.log("Login request received:", req.body);
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("SELECT [Id], [password] FROM [USER] WHERE [email] = @email");

    if (result.recordset.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const user = result.recordset[0];
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      await pool
        .request()
        .input("id", sql.Int, user.Id)
        .query("UPDATE [USER] SET [last_login] = GETDATE() WHERE [Id] = @id");

      req.session.userId = user.Id;
      res.json({ success: true, message: "Login successful", userId: user.Id });
    } else {
      res.status(401).json({ success: false, message: "Invalid email or password" });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔹 Route to Logout
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Logout failed" });
    }
    res.json({ success: true, message: "Logged out successfully" });
  });
});

// 🔹 Route to Fetch User Data
app.get("/user", authenticateUser, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, req.session.userId)
      .query("SELECT [Id], [name], [email], [avatar], [created_at], [last_login] FROM [USER] WHERE [Id] = @id");

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user: result.recordset[0] });
  } catch (err) {
    console.error("User fetch error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔹 Route to Create or Update Step Activity
app.post("/step-activity", authenticateUser, async (req, res) => {
  console.log("Step activity request received:", req.body);
  console.log("Session userId:", req.session.userId); // Debug userId
  try {
    const { stepCount, distance, timestamp } = req.body;
    const userId = req.session.userId;

    if (!stepCount && stepCount !== 0) {
      return res.status(400).json({ success: false, message: "stepCount is required" });
    }

    // Validate userId exists in [USER] table
    const pool = await poolPromise;
    const userCheck = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query("SELECT Id FROM [USER] WHERE Id = @userId");
    if (userCheck.recordset.length === 0) {
      return res.status(400).json({ success: false, message: `Invalid userId: ${userId} not found in [USER]` });
    }
    console.log("UserId validated:", userId);

    const existingRecord = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query("SELECT TOP 1 Id FROM [STEPACTIVITY] WHERE userId = @userId ORDER BY timestamp DESC");
    console.log("Existing record check result:", existingRecord.recordset);

    if (existingRecord.recordset.length > 0) {
      const recordId = existingRecord.recordset[0].Id;
      console.log("Updating existing record with Id:", recordId);
      await pool
        .request()
        .input("id", sql.Int, recordId)
        .input("stepCount", sql.Int, stepCount)
        .input("distance", sql.Float, distance || null)
        .input("timestamp", sql.DateTime, timestamp || new Date())
        .query(`
          UPDATE [STEPACTIVITY]
          SET step_count = @stepCount, distance = @distance, timestamp = @timestamp
          WHERE Id = @id
        `);
      console.log("Update query executed for Id:", recordId);
    } else {
      console.log("Inserting new record for userId:", userId);
      await pool
        .request()
        .input("userId", sql.Int, userId)
        .input("stepCount", sql.Int, stepCount)
        .input("distance", sql.Float, distance || null)
        .input("timestamp", sql.DateTime, timestamp || new Date())
        .query(`
          INSERT INTO [STEPACTIVITY] (userId, step_count, distance, timestamp)
          VALUES (@userId, @stepCount, @distance, @timestamp)
        `);
      console.log("Insert query executed for userId:", userId);
    }

    res.status(201).json({ success: true, message: "Step activity saved successfully" });
  } catch (err) {
    console.error("Step activity error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔹 Route to Fetch Step Activity for User
app.get("/step-activity", authenticateUser, async (req, res) => {
  try {
    const pool = await poolPromise;
    const userId = req.session.userId;
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query("SELECT * FROM [STEPACTIVITY] WHERE userId = @userId ORDER BY [timestamp] DESC");

    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error("Step activity fetch error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔹 Route to Create an Event
app.post("/events", authenticateUser, async (req, res) => {
  try {
    const {
      title,
      description,
      activity,
      goal,
      start_date,
      end_date,
      location,
      event_type,
      total_participants,
      team_count,
      members_per_team,
    } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input("title", sql.NVarChar, title)
      .input("description", sql.NVarChar, description)
      .input("activity", sql.NVarChar, activity)
      .input("goal", sql.Int, goal)
      .input("start_date", sql.DateTime, start_date)
      .input("end_date", sql.DateTime, end_date)
      .input("location", sql.NVarChar, location)
      .input("event_type", sql.NVarChar, event_type)
      .input("total_participants", sql.Int, total_participants)
      .input("team_count", sql.Int, team_count)
      .input("members_per_team", sql.Int, members_per_team)
      .input("userId", sql.Int, req.session.userId)
      .query(`
        INSERT INTO events 
        (title, description, activity, goal, start_date, end_date, location, event_type, total_participants, team_count, members_per_team, user_id)
        VALUES 
        (@title, @description, @activity, @goal, @start_date, @end_date, @location, @event_type, @total_participants, @team_count, @members_per_team, @userId)
      `);

    res.status(201).json({ success: true, message: "Event created successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔹 Route to Fetch All Events for a User
app.get("/events", authenticateUser, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("userId", sql.Int, req.session.userId)
      .query("SELECT * FROM events WHERE user_id = @userId");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("API is running ✅");
});


// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
