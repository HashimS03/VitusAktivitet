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
    res.status(500).json({ 
      success: false, 
      message: `Login failed: ${err.message}` 
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

module.exports = router;