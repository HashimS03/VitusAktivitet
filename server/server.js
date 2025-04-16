const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { sql, poolPromise } = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "vitus-aktivitet-secret-key-2023";

app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
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

// Add this near your other endpoints
const recentLogs = [];
const MAX_LOGS = 100;

// Custom logging function
function serverLog(type, message, details = null) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type,
    message,
    details: details ? (typeof details === 'object' ? JSON.stringify(details) : details) : null
  };
  
  // Store in memory buffer
  recentLogs.unshift(logEntry);
  if (recentLogs.length > MAX_LOGS) {
    recentLogs.pop();
  }
  
  // Also send to console
  console[type](message, details || '');
}

// Update the authenticateJWT middleware with better logging
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  serverLog("log", "Auth header received:", authHeader ? "Present" : "Missing");

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    serverLog("log", "Token extracted:", token ? token.substring(0, 10) + "..." : "Invalid format");
    
    // Check if JWT_SECRET is available
    if (!JWT_SECRET) {
      serverLog("error", "JWT_SECRET is not defined in environment variables");
      return res.status(500).json({ 
        success: false, 
        message: "Server configuration error" 
      });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        serverLog("log", "JWT verification failed:", err.message);
        // More specific error messages
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ 
            success: false, 
            message: "Token expired, please log in again" 
          });
        } else if (err.name === "JsonWebTokenError") {
          return res.status(403).json({ 
            success: false, 
            message: "Invalid token" 
          });
        }
        return res.status(403).json({ success: false, message: "Invalid or expired token" });
      }

      serverLog("log", "JWT verified successfully for user:", user.id);
      req.session.userId = user.id; 
      next();
    });
  } else {
    // Fall back to session-based auth
    serverLog("log", "No Authorization header, falling back to session auth");
    authenticateUser(req, res, next);
  }
};

// 🔹 Route to Register a User
app.post("/register", async (req, res) => {
  serverLog("log", "Register request received:", req.body);
  try {
    const { name, email, password, avatar } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const pool = await poolPromise;
    // Sett inn ny bruker i [USER]-tabellen
    const userResult = await pool
      .request()
      .input("name", sql.NVarChar, name || null)
      .input("email", sql.NVarChar, email || null)
      .input("password", sql.VarChar, hashedPassword)
      .input("avatar", sql.Image, avatar || null).query(`
        INSERT INTO [USER] ([name], [email], [password], [avatar], [created_at], [last_login])
        OUTPUT INSERTED.Id
        VALUES (@name, @email, @password, @avatar, GETDATE(), NULL)
      `);

    const newUserId = userResult.recordset[0].Id;

    // Sett inn ny bruker i [LEADERBOARD]-tabellen
    await pool
      .request()
      .input("userId", sql.Int, newUserId)
      .input("steps", sql.Int, 0)
      .input("timestamp", sql.DateTime, new Date()).query(`
        INSERT INTO [LEADERBOARD] (user_id, steps, timestamp)
        VALUES (@userId, @steps, @timestamp)
      `);

    serverLog("log", "User registered successfully:", { name, email });
    res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (err) {
    serverLog("error", "Registration error:", err);
    const errorDetails = {
      message: err.message,
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
      code: err.code,
      number: err.number,
    };
    serverLog("error", "Error details:", errorDetails);

    if (err.number === 2627) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }
    res
      .status(500)
      .json({ success: false, message: `Registration failed: ${err.message}` });
  }
});

// 🔹 Route to Login
app.post("/login", async (req, res) => {
  serverLog("log", "Login request received:", req.body);
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("SELECT [Id], [password] FROM [USER] WHERE [email] = @email");

    if (result.recordset.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const user = result.recordset[0];
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      await pool
        .request()
        .input("id", sql.Int, user.Id)
        .query("UPDATE [USER] SET [last_login] = GETDATE() WHERE [Id] = @id");

      // Create JWT token
      const token = jwt.sign(
        { id: user.Id, email: email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Still set the session for backward compatibility
      req.session.userId = user.Id;
      
      res.json({
        success: true,
        message: "Login successful",
        userId: user.Id,
        token: token // Send the token to the client
      });
    } else {
      res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
  } catch (err) {
    serverLog("error", "Login error:", err);
    const errorDetails = {
      message: err.message,
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
      code: err.code,
      errno: err.errno,
    };
    serverLog("error", "Error details:", errorDetails);
    res
      .status(500)
      .json({ success: false, message: `Login failed: ${err.message}` });
  }
});

// 🔹 Route to Fetch Leaderboard Data (original endpoint)
app.get("/leaderboard", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        u.Id AS userId,
        u.name,
        u.avatar,
        l.steps,
        l.timestamp
      FROM [USER] u
      LEFT JOIN [LEADERBOARD] l ON u.Id = l.user_id
      ORDER BY l.steps DESC
    `);

    const leaderboardData = result.recordset.map((row, index) => ({
      id: row.userId.toString(),
      name: row.name || "Ukjent bruker",
      points: row.steps || 0,
      department: "Ukjent avdeling",
      avatar:
        row.avatar && Buffer.isBuffer(row.avatar)
          ? `data:image/jpeg;base64,${Buffer.from(row.avatar).toString(
              "base64"
            )}`
          : null,
      change: 0,
    }));

    res.json({ success: true, data: leaderboardData });
  } catch (err) {
    serverLog("error", "Leaderboard fetch error:", err.stack);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/leaderboard", async (req, res) => {
  serverLog("log", "Leaderboard request received");
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        u.Id AS userId,
        u.name,
        u.avatar,
        l.steps,
        l.timestamp
      FROM [USER] u
      LEFT JOIN [LEADERBOARD] l ON u.Id = l.user_id
      ORDER BY l.steps DESC
    `);

    const leaderboardData = result.recordset.map((row, index) => ({
      id: row.userId.toString(),
      name: row.name || "Ukjent bruker",
      points: row.steps || 0,
      department: "Ukjent avdeling",
      avatar:
        row.avatar && Buffer.isBuffer(row.avatar)
          ? `data:image/jpeg;base64,${Buffer.from(row.avatar).toString(
              "base64"
            )}`
          : null,
      change: 0,
    }));

    serverLog("log", `Returning ${leaderboardData.length} leaderboard entries`);
    res.json({ success: true, data: leaderboardData });
  } catch (err) {
    serverLog("error", "Leaderboard fetch error:", err.stack);
    res.status(500).json({
      success: false,
      message: "Kunne ikke hente ledertavle. Prøv igjen senere.",
      error: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
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
app.get("/user", authenticateJWT, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, req.session.userId)
      .query(
        "SELECT [Id], [name], [email], [avatar], [created_at], [last_login] FROM [USER] WHERE [Id] = @id"
      );

    if (result.recordset.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user: result.recordset[0] });
  } catch (err) {
    serverLog("error", "User fetch error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔹 Route to Create or Update Step Activity
app.post("/step-activity", authenticateJWT, async (req, res) => {
  serverLog("log", "Step activity request received:", req.body);
  serverLog("log", "Session userId:", req.session.userId);
  try {
    const { stepCount, distance, timestamp } = req.body;
    const userId = req.session.userId;

    if (!stepCount && stepCount !== 0) {
      return res
        .status(400)
        .json({ success: false, message: "stepCount is required" });
    }

    const pool = await poolPromise;
    const userCheck = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query("SELECT Id FROM [USER] WHERE Id = @userId");
    if (userCheck.recordset.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid userId: ${userId} not found in [USER]`,
      });
    }
    serverLog("log", "UserId validated:", userId);

    const existingRecord = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query(
        "SELECT TOP 1 Id FROM [STEPACTIVITY] WHERE userId = @userId ORDER BY timestamp DESC"
      );
    serverLog("log", "Existing record check result:", existingRecord.recordset);

    if (existingRecord.recordset.length > 0) {
      const recordId = existingRecord.recordset[0].Id;
      serverLog("log", "Updating existing record with Id:", recordId);
      await pool
        .request()
        .input("id", sql.Int, recordId)
        .input("stepCount", sql.Int, stepCount)
        .input("distance", sql.Float, distance || null)
        .input("timestamp", sql.DateTime, timestamp || new Date()).query(`
          UPDATE [STEPACTIVITY]
          SET step_count = @stepCount, distance = @distance, timestamp = @timestamp
          WHERE Id = @id
        `);
      serverLog("log", "Update query executed for Id:", recordId);
    } else {
      serverLog("log", "Inserting new record for userId:", userId);
      await pool
        .request()
        .input("userId", sql.Int, userId)
        .input("stepCount", sql.Int, stepCount)
        .input("distance", sql.Float, distance || null)
        .input("timestamp", sql.DateTime, timestamp || new Date()).query(`
          INSERT INTO [STEPACTIVITY] (userId, step_count, distance, timestamp)
          VALUES (@userId, @stepCount, @distance, @timestamp)
        `);
      serverLog("log", "Insert query executed for userId:", userId);
    }

    // Oppdater [LEADERBOARD]
    const existingLeaderboard = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query("SELECT Id FROM [LEADERBOARD] WHERE user_id = @userId");

    if (existingLeaderboard.recordset.length > 0) {
      await pool
        .request()
        .input("userId", sql.Int, userId)
        .input("steps", sql.Int, stepCount)
        .input("timestamp", sql.DateTime, timestamp || new Date()).query(`
          UPDATE [LEADERBOARD]
          SET steps = @steps, timestamp = @timestamp
          WHERE user_id = @userId
        `);
    } else {
      await pool
        .request()
        .input("userId", sql.Int, userId)
        .input("steps", sql.Int, stepCount)
        .input("timestamp", sql.DateTime, timestamp || new Date()).query(`
          INSERT INTO [LEADERBOARD] (user_id, steps, timestamp)
          VALUES (@userId, @steps, @timestamp)
        `);
    }

    res
      .status(201)
      .json({ success: true, message: "Step activity saved successfully" });
  } catch (err) {
    serverLog("error", "Step activity error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔹 Route to Fetch Step Activity for User
app.get("/step-activity", authenticateJWT, async (req, res) => {
  try {
    const pool = await poolPromise;
    const userId = req.session.userId;
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query(
        "SELECT * FROM [STEPACTIVITY] WHERE userId = @userId ORDER BY [timestamp] DESC"
      );

    res.json({ success: true, data: result.recordset });
  } catch (err) {
    serverLog("error", "Step activity fetch error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔹 Route to Create an Event
app.post("/events", authenticateJWT, async (req, res) => {
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
    const result = await pool
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
        OUTPUT INSERTED.id
        VALUES 
        (@title, @description, @activity, @goal, @start_date, @end_date, @location, @event_type, @total_participants, @team_count, @members_per_team, @userId)
      `);
    
    // Get the ID of the newly created event
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

// 🔹 Route to Fetch All Events for a User
app.get("/events", authenticateJWT, async (req, res) => {
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

// 🔹 Route to Update an Event
app.put("/events/:id", authenticateJWT, async (req, res) => {
  try {
    const eventId = req.params.id;
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
    const result = await pool
      .request()
      .input("eventId", sql.Int, eventId)
      .input("userId", sql.Int, req.session.userId)
      .query("SELECT * FROM events WHERE id = @eventId AND user_id = @userId");

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    await pool
      .request()
      .input("eventId", sql.Int, eventId)
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
        UPDATE events
        SET title = @title,
            description = @description,
            activity = @activity,
            goal = @goal,
            start_date = @start_date,
            end_date = @end_date,
            location = @location,
            event_type = @event_type,
            total_participants = @total_participants,
            team_count = @team_count,
            members_per_team = @members_per_team
        WHERE id = @eventId AND user_id = @userId
      `);

    res.json({ success: true, message: "Event updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔹 Route to Delete an Event
app.delete("/events/:id", authenticateJWT, async (req, res) => {
  try {
    const eventId = req.params.id;

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("eventId", sql.Int, eventId)
      .input("userId", sql.Int, req.session.userId)
      .query("DELETE FROM events WHERE id = @eventId AND user_id = @userId");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.json({ success: true, message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Basic test endpoint
app.get("/test", (req, res) => {
  res.json({ message: "API is working!", timestamp: new Date().toISOString() });
});

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    // Test DB connection
    let dbStatus = "unknown";
    let dbError = null;

    try {
      const pool = await poolPromise;
      const result = await pool.request().query("SELECT 1 as test");
      dbStatus = result.recordset[0].test === 1 ? "connected" : "error";
    } catch (err) {
      dbStatus = "error";
      dbError = err.message;
    }

    res.json({
      status: "up",
      database: dbStatus,
      dbError: dbError,
      environment: process.env.NODE_ENV || "unknown",
      bcryptLoaded: typeof bcrypt !== "undefined",
      time: new Date().toISOString(),
      env_vars: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        DB_CONFIG_EXISTS: !!process.env.MSSQL_USER,
        SESSION_SECRET_EXISTS: !!process.env.SESSION_SECRET,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// NEW API status endpoint for debugging
app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
});

// Add an endpoint to view logs
app.get("/logs", (req, res) => {
  res.json(recentLogs);
});

app.get("/", (req, res) => {
  res.send("API is running ✅");
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
