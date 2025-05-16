const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { sql, poolPromise } = require("./db");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Import route modules
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const eventRoutes = require("./routes/events");
const activityRoutes = require("./routes/activities");
const achievementRoutes = require("./routes/achievements");

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "vitus-aktivitet-secret-key-2023";

// Middleware
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
    secret: process.env.SESSION_SECRET || "vitus-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
  })
);

// Logging setup
const serverLog = (type, message, details = null) => {
  console[type](message, details || "");
};

// Authentication middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    if (!JWT_SECRET) {
      return res.status(500).json({ 
        success: false, 
        message: "Server configuration error" 
      });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({
            success: false,
            message: "Token expired, please log in again",
          });
        }
        return res.status(403).json({ 
          success: false, 
          message: "Invalid token" 
        });
      }

      req.user = user;
      req.session.userId = user.id;
      next();
    });
  } else {
    if (!req.session.userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }
    next();
  }
};

// Mount routes
app.use("/", authRoutes);
app.use("/user", userRoutes);
app.use("/events", eventRoutes);
app.use("/", activityRoutes);
app.use("/", achievementRoutes);


app.get("/health", async (req, res) => {
  try {
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
      dbError,
      environment: process.env.NODE_ENV || "development",
      time: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
});

app.get("/api/health", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT 1 as test");
    res.json({ 
      status: "OK", 
      dbConnected: true,
      dbResponse: result.recordset[0]
    });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({ 
      status: "Error", 
      dbConnected: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.get("/", (req, res) => {
  res.send("Vitus Aktivitet API is running ✅");
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Export for testing
module.exports = { app, authenticateJWT };
