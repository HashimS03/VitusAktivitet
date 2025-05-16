const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const { sql, poolPromise } = require("../db");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "vitus-aktivitet-secret-key-2023";

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, avatar, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const pool = await poolPromise;
    const userResult = await pool
      .request()
      .input("name", sql.NVarChar, name)
      .input("email", sql.NVarChar, email)
      .input("password", sql.VarChar, hashedPassword)
      .input(
        "avatar",
        sql.VarBinary(sql.MAX),
        avatar ? Buffer.from(avatar.split(",")[1], "base64") : null
      )
      .input("phone", sql.NVarChar, phone || null)
      .input("address", sql.NVarChar, address || null).query(`
        INSERT INTO [USER] ([name], [email], [password], [avatar], [created_at], [last_login], [phone], [address])
        OUTPUT INSERTED.Id
        VALUES (@name, @email, @password, @avatar, GETDATE(), NULL, @phone, @address)
      `);

    const newUserId = userResult.recordset[0].Id;

    // Initialize leaderboard entry for the new user
    await pool
      .request()
      .input("userId", sql.Int, newUserId)
      .input("steps", sql.Int, 0)
      .input("timestamp", sql.DateTime, new Date()).query(`
        INSERT INTO [LEADERBOARD] (user_id, steps, timestamp)
        VALUES (@userId, @steps, @timestamp)
      `);

    res.status(201).json({ 
      success: true, 
      message: "User registered successfully" 
    });
  } catch (err) {
    if (err.number === 2627) { // SQL unique constraint violation
      return res.status(400).json({ 
        success: false, 
        message: "Email already exists" 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: `Registration failed: ${err.message}` 
    });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("SELECT [Id], [password] FROM [USER] WHERE [email] = @email");

    if (result.recordset.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    const user = result.recordset[0];
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      await pool
        .request()
        .input("id", sql.Int, user.Id)
        .query("UPDATE [USER] SET [last_login] = GETDATE() WHERE [Id] = @id");

      const token = jwt.sign({ id: user.Id, email }, JWT_SECRET, {
        expiresIn: "7d",
      });

      req.session.userId = user.Id;

      res.json({
        success: true,
        message: "Login successful",
        userId: user.Id,
        token,
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }
  } catch (err) {
    console.error("Login error details:", {
      message: err.message,
      stack: err.stack,
      code: err.code || 'none',
      sqlState: err.sqlState || 'none',
      sqlErrorNumber: err.number || 'none'
    });
    
    // Create a detailed error response that will show in your app logs
    let errorDetails = {
      timestamp: new Date().toISOString(),
      route: "/login",
      error: err.message,
      stack: err.stack,
      // Add request info but remove sensitive data
      requestInfo: {
        email: req.body.email ? "***@***" : "not provided",
        hasPassword: !!req.body.password
      }
    };
    
    // Log the full error details
    console.error("Detailed login error:", JSON.stringify(errorDetails, null, 2));
    
    // Categorize the error for better user feedback
    if (err.message.includes('pool') || 
        err.message.includes('sql') || 
        err.message.includes('database') ||
        err.code === 'ETIMEOUT' ||
        err.code === 'ECONNCLOSED') {
      return res.status(500).json({ 
        success: false, 
        message: "Database connection error, please try again later",
        error_type: "database_error"
      });
    }
    
    if (err.message.includes('bcrypt') || err.message.includes('hash')) {
      return res.status(500).json({ 
        success: false, 
        message: "Authentication service error, please try again later",
        error_type: "bcrypt_error"
      });
    }
    
    if (err.message.includes('session')) {
      return res.status(500).json({ 
        success: false, 
        message: "Session management error, please try again later",
        error_type: "session_error"
      });
    }
    
    // Generic error response
    res.status(500).json({ 
      success: false, 
      message: "Login failed due to server error, please try again later",
      error_type: "unknown_error",
      error_id: new Date().getTime() // Timestamp to help identify this specific error in logs
    });
  }
});

// Logout user
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: "Logout failed" 
      });
    }
    res.json({ 
      success: true, 
      message: "Logged out successfully" 
    });
  });
});

// Test bcryptjs functionality
router.get("/test-bcrypt", async (req, res) => {
  try {
    console.log("Starting bcrypt test");
    
    // Test hash generation
    const testPassword = "test123";
    console.log("Generating salt...");
    const salt = await bcrypt.genSalt(4); // Lower rounds for quicker test
    console.log("Salt generated successfully");
    
    console.log("Hashing password...");
    const hash = await bcrypt.hash(testPassword, salt);
    console.log("Hash generated successfully");
    
    // Test comparison
    console.log("Testing password comparison...");
    const match = await bcrypt.compare(testPassword, hash);
    console.log("Password comparison result:", match);
    
    res.json({
      success: true,
      hashGenerated: !!hash,
      passwordMatches: match,
      bcryptVersion: bcrypt.version || 'unknown'
    });
  } catch (error) {
    console.error("Bcrypt test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Add a database connection test
router.get("/test-db", async (req, res) => {
  try {
    console.log("Testing database connection");
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT @@version as version");
    res.json({
      success: true,
      dbConnected: true,
      version: result.recordset[0].version
    });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;