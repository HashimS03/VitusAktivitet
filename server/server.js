process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION - keeping process alive:', error);
});

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
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(" ")[1];
      const secret = process.env.JWT_SECRET || "vitus-aktivitet-secret-key-2023";

      jwt.verify(token, secret, (err, user) => {
        if (err) {
          console.error("JWT verification error:", err.message);
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
        if (user && user.id) {
          req.session.userId = user.id;
        }
        next();
      });
    } else {
      if (req.session && req.session.userId) {
        next();
      } else {
        return res.status(401).json({ 
          success: false, 
          message: "Unauthorized" 
        });
      }
    }
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication error"
    });
  }
};

// Simple alive check that doesn't depend on any other modules
app.get("/alive", (req, res) => {
  res.status(200).send("Server is alive! " + new Date().toISOString());
});

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
  try {
    res.send(`
      <html>
        <head><title>Vitus Aktivitet API Status</title></head>
        <body>
          <h1>Vitus Aktivitet API is running ✅</h1>
          <p>Server time: ${new Date().toISOString()}</p>
          <p>Environment: ${process.env.NODE_ENV || "development"}</p>
          <p><a href="/api/health">Check API Health</a></p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error in root route:", error);
    res.status(500).send(`
      <html>
        <head><title>Vitus Aktivitet API Error</title></head>
        <body>
          <h1>Server Error</h1>
          <p>Error: ${error.message}</p>
          <p>Time: ${new Date().toISOString()}</p>
        </body>
      </html>
    `);
  }
});

// Startup diagnostics route
app.get("/startup-diagnostics", (req, res) => {
  try {
    // Check environment variables (hide sensitive info)
    const envVars = {
      NODE_ENV: process.env.NODE_ENV || "not set",
      PORT: process.env.PORT || "not set",
      DB_CONNECTION: process.env.MSSQL_HOST ? "set" : "not set",
      JWT_SECRET: process.env.JWT_SECRET ? "set" : "not set",
      SESSION_SECRET: process.env.SESSION_SECRET ? "set" : "not set"
    };
    
    // Check middleware
    const middlewareStatus = {
      express: !!express,
      cors: !!cors,
      session: !!session,
      sql: !!sql,
      jwt: !!jwt
    };
    
    // Check routes mounted
    const routesStatus = {
      auth: !!authRoutes,
      user: !!userRoutes,
      event: !!eventRoutes,
      activity: !!activityRoutes,
      achievement: !!achievementRoutes
    };
    
    res.json({
      serverTime: new Date().toISOString(),
      environment: envVars,
      middleware: middlewareStatus,
      routes: routesStatus,
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage()
    });
  } catch (error) {
    console.error("Diagnostics error:", error);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
});

// DB diagnostics route
app.get("/db-diagnostics", async (req, res) => {
  try {
    console.log("Starting DB diagnostics");
    
    // Check DB config (hide credentials)
    const dbConfig = {
      host: process.env.MSSQL_HOST || "not set",
      database: process.env.MSSQL_DATABASE || "not set",
      port: process.env.MSSQL_PORT || "not set",
      user: process.env.MSSQL_USER ? "set" : "not set",
      password: process.env.MSSQL_PASSWORD ? "set" : "not set",
    };
    
    console.log("DB config checked");
    
    // Try to connect
    const poolResult = { success: false, message: "" };
    
    try {
      console.log("Attempting DB connection");
      const pool = await poolPromise;
      console.log("Pool created, running test query");
      const result = await pool.request().query("SELECT @@version as version");
      console.log("Query executed");
      
      poolResult.success = true;
      poolResult.version = result.recordset[0].version;
      poolResult.message = "Connected successfully";
    } catch (dbErr) {
      console.error("DB connection error:", dbErr);
      poolResult.message = dbErr.message;
      poolResult.code = dbErr.code;
      poolResult.state = dbErr.state;
    }
    
    res.json({
      time: new Date().toISOString(),
      dbConfig,
      connectionResult: poolResult
    });
  } catch (error) {
    console.error("DB diagnostics error:", error);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
});

// Add this new route near your other diagnostic endpoints

app.get("/server-info", (req, res) => {
  try {
    // Basic server info
    const serverInfo = {
      time: new Date().toISOString(),
      uptime: process.uptime() + " seconds",
      nodeVersion: process.version,
      hostname: require('os').hostname(),
      platform: process.platform,
      
      // Environment info (sanitized)
      environment: {
        NODE_ENV: process.env.NODE_ENV || "not set",
        PORT: process.env.PORT || "not set",
        
        // Check if important variables exist (don't expose values)
        database: {
          MSSQL_HOST: process.env.MSSQL_HOST ? "set" : "not set",
          MSSQL_DATABASE: process.env.MSSQL_DATABASE ? "set" : "not set",
          MSSQL_USER: process.env.MSSQL_USER ? "set" : "not set",
          MSSQL_PASSWORD: process.env.MSSQL_PASSWORD ? "set" : "not set",
          MSSQL_PORT: process.env.MSSQL_PORT ? "set" : "not set"
        },
        
        secrets: {
          JWT_SECRET: process.env.JWT_SECRET ? "set" : "not set",
          SESSION_SECRET: process.env.SESSION_SECRET ? "set" : "not set"
        }
      },
      
      // Memory usage
      memory: {
        rss: Math.round(process.memoryUsage().rss / (1024 * 1024)) + " MB",
        heapTotal: Math.round(process.memoryUsage().heapTotal / (1024 * 1024)) + " MB",
        heapUsed: Math.round(process.memoryUsage().heapUsed / (1024 * 1024)) + " MB",
        external: Math.round(process.memoryUsage().external / (1024 * 1024)) + " MB"
      },
      
      // Important packages
      packages: {
        express: require('express/package.json').version,
        bcryptjs: require('bcryptjs/package.json').version,
        mssql: require('mssql/package.json').version,
        jsonwebtoken: require('jsonwebtoken/package.json').version
      }
    };
    
    res.json(serverInfo);
  } catch (error) {
    console.error("Server info error:", error);
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// Add this near the bottom of your file, just before app.listen
app.get("/basic-status", (req, res) => {
  res.send(`
    <html>
      <head><title>Basic Server Status</title></head>
      <body>
        <h1>Basic Server Status</h1>
        <p>Server is responding to basic HTTP requests</p>
        <p>Time: ${new Date().toISOString()}</p>
        <p>Node version: ${process.version}</p>
        <p>Server uptime: ${Math.floor(process.uptime())} seconds</p>
        <p>Memory usage: ${Math.round(process.memoryUsage().rss / (1024 * 1024))} MB</p>
      </body>
    </html>
  `);
});

// Start Server
try {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
} catch (error) {
  console.error('Failed to start server:', error);
}

// Export for testing
module.exports = { app, authenticateJWT };
