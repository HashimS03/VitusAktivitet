const express = require("express");
const sql = require("mssql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const winston = require("winston");

dotenv.config();

const app = express();

// Logger configuration
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

const serverLog = (level, message, meta) => {
  logger.log({ level, message, ...meta });
};

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:8081", "exp://192.168.1.65:8081"],
    credentials: true,
  })
);

// Database configuration
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then((pool) => {
    serverLog("info", "Connected to SQL Server");
    return pool;
  })
  .catch((err) => {
    serverLog("error", "Database connection failed:", err);
    process.exit(1);
  });

// JWT Authentication Middleware
const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.session = { userId: decoded.userId };
    next();
  } catch (err) {
    serverLog("error", "Token verification failed:", err);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// Routes

// Register
app.post("/register", async (req, res) => {
  try {
    const { username, email, password, daily_goal } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const pool = await poolPromise;
    const existingUser = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("SELECT * FROM [dbo].[USER] WHERE email = @email");

    if (existingUser.recordset.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .input("email", sql.NVarChar, email)
      .input("password", sql.NVarChar, hashedPassword)
      .input("daily_goal", sql.Int, daily_goal || 7500)
      .query(
        "INSERT INTO [dbo].[USER] (username, email, password, daily_goal) OUTPUT INSERTED.Id VALUES (@username, @email, @password, @daily_goal)"
      );

    const userId = result.recordset[0].Id;
    serverLog("info", `User registered: ${email}`, { userId });

    res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (err) {
    serverLog("error", "Registration error:", err);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("SELECT * FROM [dbo].[USER] WHERE email = @email");

    const user = result.recordset[0];
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user.Id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    serverLog("info", `User logged in: ${email}`, { userId: user.Id });
    res.json({ success: true, message: "Login successful", userId: user.Id });
  } catch (err) {
    serverLog("error", "Login error:", err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("token");
  serverLog("info", "User logged out");
  res.json({ success: true, message: "Logged out successfully" });
});

// Check Auth
app.get("/check-auth", authenticateJWT, (req, res) => {
  res.json({ success: true, userId: req.session.userId });
});

// Get User Data
app.get("/user", authenticateJWT, async (req, res) => {
  try {
    const userId = req.session.userId;
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query(
        "SELECT Id, username, email, daily_goal FROM [dbo].[USER] WHERE Id = @userId"
      );

    if (result.recordset.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user: result.recordset[0] });
  } catch (err) {
    serverLog("error", "User fetch error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch user data" });
  }
});

// Update Daily Goal
app.put("/user/daily-goal", authenticateJWT, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { daily_goal } = req.body;

    if (!daily_goal || daily_goal <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid daily goal" });
    }

    const pool = await poolPromise;
    await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("daily_goal", sql.Int, daily_goal)
      .query(
        "UPDATE [dbo].[USER] SET daily_goal = @daily_goal WHERE Id = @userId"
      );

    serverLog("info", `Daily goal updated for user ${userId}`, { daily_goal });
    res.json({ success: true, message: "Daily goal updated successfully" });
  } catch (err) {
    serverLog("error", "Daily goal update error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to update daily goal" });
  }
});

// Step Activity
app.post("/step-activity", authenticateJWT, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { stepCount, distance, timestamp } = req.body;

    if (!stepCount || !timestamp) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const pool = await poolPromise;
    await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("step_count", sql.Int, stepCount)
      .input("distance", sql.Float, distance || null)
      .input("timestamp", sql.DateTime, new Date(timestamp))
      .query(
        "INSERT INTO [dbo].[STEPACTIVITY] (userId, step_count, distance, timestamp) VALUES (@userId, @step_count, @distance, @timestamp)"
      );

    serverLog("info", `Step activity recorded for user ${userId}`, {
      stepCount,
    });
    res.json({ success: true, message: "Step activity recorded successfully" });
  } catch (err) {
    serverLog("error", "Step activity recording error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to record step activity" });
  }
});

// Get Step Activity
app.get("/step-activity", authenticateJWT, async (req, res) => {
  try {
    const userId = req.session.userId;
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query(
        "SELECT step_count, distance, timestamp FROM [dbo].[STEPACTIVITY] WHERE userId = @userId ORDER BY timestamp DESC"
      );

    res.json({ success: true, steps: result.recordset });
  } catch (err) {
    serverLog("error", "Step activity fetch error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch step activity" });
  }
});

// Get Stats (Total Steps and Streak)
app.get("/stats", authenticateJWT, async (req, res) => {
  try {
    const userId = req.session.userId;
    const pool = await poolPromise;

    // Hent total skritt
    const totalStepsResult = await pool
      .request()
      .input("userId", sql.Int, userId).query(`
        SELECT SUM(step_count) AS total_steps
        FROM [dbo].[STEPACTIVITY]
        WHERE userId = @userId
      `);
    const totalSteps = totalStepsResult.recordset[0].total_steps || 0;

    // Hent daily_goal for brukeren
    const userResult = await pool.request().input("userId", sql.Int, userId)
      .query(`
        SELECT daily_goal
        FROM [dbo].[USER]
        WHERE Id = @userId
      `);
    const dailyGoal = userResult.recordset[0]?.daily_goal || 0;

    // Beregn streak
    const dailyStepsResult = await pool
      .request()
      .input("userId", sql.Int, userId).query(`
        SELECT CAST([timestamp] AS DATE) AS activity_date, SUM(step_count) AS daily_steps
        FROM [dbo].[STEPACTIVITY]
        WHERE userId = @userId
        GROUP BY CAST([timestamp] AS DATE)
        ORDER BY activity_date DESC
      `);

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const latestEntry = dailyStepsResult.recordset[0];
    const hasDataForToday =
      latestEntry &&
      new Date(latestEntry.activity_date).toDateString() ===
        today.toDateString();

    let currentDate = new Date(today);
    if (!hasDataForToday) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    for (let i = 0; i < dailyStepsResult.recordset.length; i++) {
      const entry = dailyStepsResult.recordset[i];
      const entryDate = new Date(entry.activity_date);
      entryDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(currentDate);
      expectedDate.setDate(currentDate.getDate() - i);

      if (entryDate.getTime() !== expectedDate.getTime()) break;
      if (entry.daily_steps >= dailyGoal) streak++;
      else break;
    }

    res.json({ success: true, total_steps: totalSteps, streak });
  } catch (err) {
    serverLog("error", "Stats fetch error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
});

// Get Step History (Structured for Graph)
app.get("/step-history", authenticateJWT, async (req, res) => {
  try {
    const userId = req.session.userId;
    const period = req.query.period || "day"; // day, week, month, year
    const pool = await poolPromise;

    const result = await pool.request().input("userId", sql.Int, userId).query(`
        SELECT step_count, timestamp
        FROM [dbo].[STEPACTIVITY]
        WHERE userId = @userId
        ORDER BY timestamp DESC
      `);

    const stepsData = result.recordset;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let total = 0;
    let labels = [];
    let values = [];
    let maxValue = 2000;
    let average = 0;

    if (stepsData.length === 0) {
      return res.json({
        success: true,
        data: { total: 0, labels: [], values: [], maxValue: 2000, average: 0 },
      });
    }

    switch (period) {
      case "day": {
        const todayString = today.toISOString().split("T")[0];
        const todayData = stepsData.filter(
          (entry) =>
            new Date(entry.timestamp).toISOString().split("T")[0] ===
            todayString
        );
        total = todayData.reduce((sum, entry) => sum + entry.step_count, 0);
        const hourlySteps = Array(24).fill(0);
        todayData.forEach((entry) => {
          const hour = new Date(entry.timestamp).getHours();
          hourlySteps[hour] = (hourlySteps[hour] || 0) + entry.step_count;
        });
        labels = Array.from({ length: 24 }, (_, i) => `${i}`.padStart(2, "0"));
        values = hourlySteps;
        maxValue = Math.max(total, 2000);
        break;
      }
      case "week": {
        const startOfWeek = new Date(today);
        const dayOfWeek = today.getDay();
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startOfWeek.setDate(today.getDate() - daysToSubtract);
        startOfWeek.setHours(0, 0, 0, 0);

        values = Array(7).fill(0);
        stepsData.forEach((entry) => {
          const entryDate = new Date(entry.timestamp);
          entryDate.setHours(0, 0, 0, 0);
          const diffTime = entryDate - startOfWeek;
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays >= 0 && diffDays < 7) {
            values[diffDays] = (values[diffDays] || 0) + entry.step_count;
          }
        });

        total = values.reduce((sum, val) => sum + val, 0);
        labels = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
        maxValue = Math.round(Math.max(...values, 3000));
        average = Math.round(total / 7);
        break;
      }
      case "month": {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthData = stepsData.filter(
          (entry) => new Date(entry.timestamp) >= startOfMonth
        );
        const daysInMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0
        ).getDate();
        values = Array(daysInMonth).fill(0);
        monthData.forEach((entry) => {
          const dayIndex = new Date(entry.timestamp).getDate() - 1;
          values[dayIndex] = (values[dayIndex] || 0) + entry.step_count;
        });
        total = values.reduce((sum, val) => sum + val, 0);
        labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
        maxValue = Math.max(...values, 4000);
        average = total / daysInMonth;
        break;
      }
      case "year": {
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const yearData = stepsData.filter(
          (entry) => new Date(entry.timestamp) >= startOfYear
        );
        const monthlyTotals = Array(12).fill(0);
        yearData.forEach((entry) => {
          const monthIndex = new Date(entry.timestamp).getMonth();
          monthlyTotals[monthIndex] += entry.step_count;
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
        maxValue = Math.round(Math.max(...values, 400));
        average = Math.round(dailyAverage);
        break;
      }
      default:
        total = 0;
        labels = [];
        values = [];
        maxValue = 2000;
        average = 0;
    }

    res.json({
      success: true,
      data: { total, labels, values, maxValue, average },
    });
  } catch (err) {
    serverLog("error", "Step history fetch error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch step history" });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  serverLog("info", `Server running on port ${PORT}`);
});
