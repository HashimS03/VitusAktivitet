const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { sql, poolPromise } = require("./db");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

session({
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
});

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

    console.log("User registered successfully:", { name, email });
    res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    const errorDetails = {
      message: err.message,
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
      code: err.code,
      number: err.number,
    };
    console.error("Error details:", errorDetails);

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
  console.log("Login request received:", req.body);
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

      req.session.userId = user.Id;
      res.json({ success: true, message: "Login successful", userId: user.Id });
    } else {
      res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
  } catch (err) {
    console.error("Login error:", err);
    const errorDetails = {
      message: err.message,
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
      code: err.code,
      errno: err.errno,
    };
    console.error("Error details:", errorDetails);
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
    console.error("Leaderboard fetch error:", err.stack);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/leaderboard", async (req, res) => {
  console.log("Leaderboard request received");
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

    console.log(`Returning ${leaderboardData.length} leaderboard entries`);
    res.json({ success: true, data: leaderboardData });
  } catch (err) {
    console.error("Leaderboard fetch error:", err.stack);
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
app.get("/user", authenticateUser, async (req, res) => {
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
    console.error("User fetch error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔹 Route to Create or Update Step Activity
// 🔹 Route to Create or Update Step Activity
app.post("/step-activity", authenticateUser, async (req, res) => {
  console.log("Step activity request received:", req.body);
  console.log("Session userId:", req.session.userId);
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
      .query(
        "SELECT Id, daily_goal, timestamp FROM [dbo].[USER] WHERE Id = @userId"
      );
    if (userCheck.recordset.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid userId: ${userId} not found in [USER]`,
      });
    }
    console.log("UserId validated:", userId);

    const user = userCheck.recordset[0];
    const dailyGoal = user.daily_goal || 10000; // Default to 10,000 if not set
    const userTimestamp = user.timestamp
      ? new Date(user.timestamp)
      : new Date();

    // Convert timestamp to Norwegian time (Europe/Oslo)
    const providedTimestamp = timestamp ? new Date(timestamp) : new Date();
    const norwegianDate = new Date(
      providedTimestamp.toLocaleString("en-US", { timeZone: "Europe/Oslo" })
    );
    const dateString = norwegianDate.toISOString().split("T")[0]; // YYYY-MM-DD format

    // Check if a record exists for this user on this day
    const historyCheck = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("dateString", sql.NVarChar, dateString).query(`
        SELECT * FROM [dbo].[USER_HISTORY]
        WHERE userId = @userId
        AND CAST(timestamp AS DATE) = @dateString
      `);

    let streak = 0;
    if (historyCheck.recordset.length > 0) {
      // Update existing record
      const existingRecord = historyCheck.recordset[0];
      streak = existingRecord.streak || 0;
      await pool
        .request()
        .input("id", sql.Int, existingRecord.id)
        .input("total_steps", sql.Int, stepCount)
        .input("timestamp", sql.DateTime, norwegianDate).query(`
          UPDATE [dbo].[USER_HISTORY]
          SET total_steps = @total_steps, timestamp = @timestamp
          WHERE id = @id
        `);
    } else {
      // Check if the user met their daily goal yesterday to calculate streak
      const yesterday = new Date(norwegianDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split("T")[0];

      const yesterdayCheck = await pool
        .request()
        .input("userId", sql.Int, userId)
        .input("yesterdayString", sql.NVarChar, yesterdayString).query(`
          SELECT total_steps FROM [dbo].[USER_HISTORY]
          WHERE userId = @userId
          AND CAST(timestamp AS DATE) = @yesterdayString
        `);

      if (
        yesterdayCheck.recordset.length > 0 &&
        yesterdayCheck.recordset[0].total_steps >= dailyGoal
      ) {
        const previousRecord = await pool
          .request()
          .input("userId", sql.Int, userId)
          .input("yesterdayString", sql.NVarChar, yesterdayString).query(`
            SELECT streak FROM [dbo].[USER_HISTORY]
            WHERE userId = @userId
            AND CAST(timestamp AS DATE) = @yesterdayString
          `);
        streak = (previousRecord.recordset[0].streak || 0) + 1;
      } else {
        streak = stepCount >= dailyGoal ? 1 : 0;
      }

      // Insert new record
      await pool
        .request()
        .input("userId", sql.Int, userId)
        .input("total_steps", sql.Int, stepCount)
        .input("total_conversions", sql.Int, 0) // Placeholder, update if needed
        .input("streak", sql.Int, streak)
        .input("timestamp", sql.DateTime, norwegianDate).query(`
          INSERT INTO [dbo].[USER_HISTORY] (userId, total_steps, total_conversions, streak, timestamp)
          VALUES (@userId, @total_steps, @total_conversions, @streak, @timestamp)
        `);
    }

    // Update STEPACTIVITY (existing logic)
    const existingRecord = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query(
        "SELECT TOP 1 Id FROM [dbo].[STEPACTIVITY] WHERE userId = @userId ORDER BY timestamp DESC"
      );

    if (existingRecord.recordset.length > 0) {
      const recordId = existingRecord.recordset[0].Id;
      await pool
        .request()
        .input("id", sql.Int, recordId)
        .input("stepCount", sql.Int, stepCount)
        .input("distance", sql.Float, distance || null)
        .input("timestamp", sql.DateTime, norwegianDate).query(`
          UPDATE [dbo].[STEPACTIVITY]
          SET step_count = @stepCount, distance = @distance, timestamp = @timestamp
          WHERE Id = @id
        `);
    } else {
      await pool
        .request()
        .input("userId", sql.Int, userId)
        .input("stepCount", sql.Int, stepCount)
        .input("distance", sql.Float, distance || null)
        .input("timestamp", sql.DateTime, norwegianDate).query(`
          INSERT INTO [dbo].[STEPACTIVITY] (userId, step_count, distance, timestamp)
          VALUES (@userId, @stepCount, @distance, @timestamp)
        `);
    }

    // Update LEADERBOARD (existing logic)
    const existingLeaderboard = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query("SELECT Id FROM [dbo].[LEADERBOARD] WHERE user_id = @userId");

    if (existingLeaderboard.recordset.length > 0) {
      await pool
        .request()
        .input("userId", sql.Int, userId)
        .input("steps", sql.Int, stepCount)
        .input("timestamp", sql.DateTime, norwegianDate).query(`
          UPDATE [dbo].[LEADERBOARD]
          SET steps = @steps, timestamp = @timestamp
          WHERE user_id = @userId
        `);
    } else {
      await pool
        .request()
        .input("userId", sql.Int, userId)
        .input("steps", sql.Int, stepCount)
        .input("timestamp", sql.DateTime, norwegianDate).query(`
          INSERT INTO [dbo].[LEADERBOARD] (user_id, steps, timestamp)
          VALUES (@userId, @steps, @timestamp)
        `);
    }

    // Update user's timestamp
    await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("timestamp", sql.DateTime, norwegianDate).query(`
        UPDATE [dbo].[USER]
        SET timestamp = @timestamp
        WHERE Id = @userId
      `);

    res.status(201).json({
      success: true,
      message: "Step activity saved successfully",
      streak,
    });
  } catch (err) {
    console.error("Step activity error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔹 Route to Fetch User Step History
app.get("/user-history", authenticateUser, async (req, res) => {
  try {
    const { period } = req.query; // Expect period as query param (day, week, month, year)
    const userId = req.session.userId;

    if (!["day", "week", "month", "year"].includes(period)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid period" });
    }

    const pool = await poolPromise;
    let query = "";
    let startDate;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split("T")[0];

    switch (period) {
      case "day":
        query = `
          SELECT total_steps, timestamp
          FROM [dbo].[USER_HISTORY]
          WHERE userId = @userId
          AND CAST(timestamp AS DATE) = @todayString
          ORDER BY timestamp ASC
        `;
        break;
      case "week":
        startDate = new Date(today);
        const dayOfWeek = today.getDay();
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startDate.setDate(today.getDate() - daysToSubtract);
        startDate.setHours(0, 0, 0, 0);
        query = `
          SELECT total_steps, timestamp
          FROM [dbo].[USER_HISTORY]
          WHERE userId = @userId
          AND timestamp >= @startDate
          AND timestamp <= @todayString
          ORDER BY timestamp ASC
        `;
        break;
      case "month":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        query = `
          SELECT total_steps, timestamp
          FROM [dbo].[USER_HISTORY]
          WHERE userId = @userId
          AND timestamp >= @startDate
          AND timestamp <= @todayString
          ORDER BY timestamp ASC
        `;
        break;
      case "year":
        startDate = new Date(today.getFullYear(), 0, 1);
        query = `
          SELECT total_steps, timestamp
          FROM [dbo].[USER_HISTORY]
          WHERE userId = @userId
          AND timestamp >= @startDate
          AND timestamp <= @todayString
          ORDER BY timestamp ASC
        `;
        break;
    }

    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("todayString", sql.NVarChar, todayString)
      .input("startDate", sql.DateTime, startDate)
      .query(query);

    // Process the data based on the period
    let total = 0;
    let labels = [];
    let values = [];
    let maxValue = 2000;
    let average = 0;

    switch (period) {
      case "day": {
        const totalSteps =
          result.recordset.length > 0 ? result.recordset[0].total_steps : 0;
        const hourlySteps = Array(24).fill(0);
        if (totalSteps) {
          const currentHour = today.getHours();
          hourlySteps[currentHour] = totalSteps;
        }
        total = totalSteps;
        labels = Array.from({ length: 24 }, (_, i) => `${i}`.padStart(2, "0"));
        values = hourlySteps;
        maxValue = Math.max(total, 2000);
        break;
      }
      case "week": {
        const valuesArr = Array(7).fill(0);
        result.recordset.forEach((entry) => {
          const entryDate = new Date(entry.timestamp);
          const diffDays = Math.floor(
            (entryDate - startDate) / (1000 * 60 * 60 * 24)
          );
          if (diffDays >= 0 && diffDays < 7) {
            valuesArr[diffDays] = entry.total_steps;
          }
        });
        total = valuesArr.reduce((sum, val) => sum + val, 0);
        labels = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
        values = valuesArr;
        maxValue = Math.round(Math.max(...values, 3000));
        average = Math.round(total / 7);
        break;
      }
      case "month": {
        const daysInMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0
        ).getDate();
        const valuesArr = Array(daysInMonth).fill(0);
        result.recordset.forEach((entry) => {
          const dayIndex = new Date(entry.timestamp).getDate() - 1;
          valuesArr[dayIndex] = entry.total_steps;
        });
        total = valuesArr.reduce((sum, val) => sum + val, 0);
        labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
        values = valuesArr;
        maxValue = Math.max(...values, 4000);
        average = total / daysInMonth;
        break;
      }
      case "year": {
        const monthlyTotals = Array(12).fill(0);
        result.recordset.forEach((entry) => {
          const monthIndex = new Date(entry.timestamp).getMonth();
          monthlyTotals[monthIndex] += entry.total_steps;
        });
        total = monthlyTotals.reduce((sum, val) => sum + val, 0);
        const dailyAverage = total / 365;
        labels = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "Mai",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Okt",
          "Nov",
          "Des",
        ];
        values = monthlyTotals.map((val) => Math.round(val / 30));
        maxValue = Math.round(
          Math.max(...monthlyTotals.map((val) => val / 30), 400)
        );
        average = Math.round(dailyAverage);
        break;
      }
    }

    res.json({
      success: true,
      data: {
        total,
        labels,
        values,
        maxValue,
        average,
      },
    });
  } catch (err) {
    console.error("User history fetch error:", err);
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
      .query(
        "SELECT * FROM [STEPACTIVITY] WHERE userId = @userId ORDER BY [timestamp] DESC"
      );

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
      .input("userId", sql.Int, req.session.userId).query(`
        INSERT INTO events 
        (title, description, activity, goal, start_date, end_date, location, event_type, total_participants, team_count, members_per_team, user_id)
        VALUES 
        (@title, @description, @activity, @goal, @start_date, @end_date, @location, @event_type, @total_participants, @team_count, @members_per_team, @userId)
      `);

    res
      .status(201)
      .json({ success: true, message: "Event created successfully" });
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

app.get("/", (req, res) => {
  res.send("API is running ✅");
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
