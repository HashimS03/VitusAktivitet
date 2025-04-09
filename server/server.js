const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { sql, poolPromise } = require("./db");
const bcrypt = require("bcrypt");
require("dotenv").config();

console.log("Starting server...");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT || 4000);
console.log("Current working directory:", process.cwd());

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors({
  origin: "*", // Replace with your frontend's URL
  credentials: true
}));

// Use SESSION_SECRET for session management
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

// Add this before your other routes
app.get("/test", (req, res) => {
  res.json({ message: "API connection successful!" });
});

// Also add a root route
app.get("/", (req, res) => {
  res.send("VitusAktivitet API is running. Use /events to access events.");
});

// 🔹 Route to Register a User
app.post("/register", async (req, res) => {
  console.log("Register request received:", req.body); // Debug log
  try {
    const { name, email, password, avatar } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const pool = await poolPromise;

    await pool
      .request()
      .input("name", sql.NVarChar, name || null) // Allow null based on schema
      .input("email", sql.NVarChar, email || null) // Allow null based on schema
      .input("password", sql.VarChar, hashedPassword) // Updated to VarChar
      .input("avatar", sql.Image, avatar || null) // Updated to Image type
      .query(`
        INSERT INTO [USER] ([name], [email], [password], [avatar], [created_at], [last_login])
        VALUES (@name, @email, @password, @avatar, GETDATE(), NULL)
      `);

    console.log("User registered successfully:", { name, email });
    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err); // Debug error
    if (err.number === 2627) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔹 Route to Login
app.post("/login", async (req, res) => {
  console.log("Login request received:", req.body); // Debug log
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

// 🔹 Route to Create an Event
app.post("/events", async (req, res) => {
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
    const result = await pool.request()

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
      .query(`
        INSERT INTO events 
        (title, description, activity, goal, start_date, end_date, location, event_type, total_participants, team_count, members_per_team)
        OUTPUT INSERTED.id
        VALUES 
        (@title, @description, @activity, @goal, @start_date, @end_date, @location, @event_type, @total_participants, @team_count, @members_per_team)
      `);

    // Return the ID of the newly created event
    const eventId = result.recordset[0].id;
    
    res.status(201).json({ 
      success: true, 
      message: "Event created successfully", 
      eventId: eventId 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔹 Route to Fetch All Events
app.get("/events", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM events");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Test endpoint: ${process.env.WEBSITE_HOSTNAME || 'localhost'}/test`);
  console.log(`Events endpoint: ${process.env.WEBSITE_HOSTNAME || 'localhost'}/events`);
  console.log("Available environment variables:", Object.keys(process.env));
});