const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { sql, poolPromise } = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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

// In-memory logging
const recentLogs = [];
const MAX_LOGS = 100;

// Custom logging function
function serverLog(type, message, details = null) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type,
    message,
    details: details
      ? typeof details === "object"
        ? JSON.stringify(details)
        : details
      : null,
  };

  recentLogs.unshift(logEntry);
  if (recentLogs.length > MAX_LOGS) {
    recentLogs.pop();
  }

  console[type](message, details || "");
}

// JWT authentication middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  serverLog("log", "Auth header received:", authHeader ? "Present" : "Missing");
  
  if (authHeader) {
    const token = authHeader.split(" ")[1];

    serverLog(
      "log",
      "Token extracted:",
      token ? token.substring(0, 10) + "..." : "Invalid format"
    );

    if (!JWT_SECRET) {
      serverLog("error", "JWT_SECRET is not defined in environment variables");
      return res
        .status(500)
        .json({ success: false, message: "Server configuration error" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        serverLog("log", "JWT verification failed:", err.message);
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ success: false, message: "Token expired, please log in again" });
        } else if (err.name === "JsonWebTokenError") {
          return res.status(403).json({ success: false, message: "Invalid token" });
        }
        return res.status(403).json({ success: false, message: "Invalid or expired token" });
      }

      serverLog("log", "JWT verified successfully for user:", user);
      
      // Set the user ID from the token in BOTH places for reliability
      req.userId = user.id;
      req.session.userId = user.id;
      
      next();
    });
  } else {
    serverLog("error", "No authorization token provided");
    return res.status(401).json({ 
      success: false, 
      message: "No authorization token provided. Please log in again." 
    });
  }
};

// 🔹 Route to Register a User
app.post("/register", async (req, res) => {
  serverLog("log", "Register request received:", req.body);
  try {
    const { name, email, password, avatar, phone, address } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({
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
  serverLog("log", "Login request received:", { email: req.body.email });
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

      const token = jwt.sign({ id: user.Id, email }, JWT_SECRET, { expiresIn: "7d" });

      req.session.userId = user.Id;

      res.json({
        success: true,
        message: "Login successful",
        userId: user.Id,
        token,
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

// 🔹 Route to Refresh Token
app.post("/refresh-token", async (req, res) => {
  serverLog("log", "Token refresh request received");
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ 
        success: false, 
        message: "Refresh token is required" 
      });
    }
    
    // Verify the refresh token
    jwt.verify(refreshToken, JWT_SECRET, async (err, decoded) => {
      if (err) {
        serverLog("error", "Refresh token verification failed:", err.message);
        return res.status(401).json({ 
          success: false, 
          message: "Invalid refresh token, please log in again" 
        });
      }
      
      // Check if user still exists in database
      try {
        const pool = await poolPromise;
        const result = await pool
          .request()
          .input("id", sql.Int, decoded.id)
          .query("SELECT [Id], [email] FROM [USER] WHERE [Id] = @id");
        
        if (result.recordset.length === 0) {
          return res.status(404).json({ 
            success: false, 
            message: "User not found, please log in again" 
          });
        }
        
        const user = result.recordset[0];
        
        // Generate new access token
        const newToken = jwt.sign(
          { id: user.Id, email: user.email }, 
          JWT_SECRET, 
          { expiresIn: "7d" }
        );
        
        // Generate new refresh token as well - best practice for token rotation
        const newRefreshToken = jwt.sign(
          { id: user.Id, email: user.email }, 
          JWT_SECRET, 
          { expiresIn: "30d" }
        );
        
        // Ensure the session is updated
        req.session.userId = user.Id;
        
        serverLog("log", "Token refreshed successfully for user:", user.Id);
        res.json({
          success: true,
          message: "Token refreshed successfully",
          userId: user.Id,
          token: newToken,
          refreshToken: newRefreshToken
        });
      } catch (dbError) {
        serverLog("error", "Database error during token refresh:", dbError);
        res.status(500).json({ 
          success: false, 
          message: "Error refreshing token, please try again" 
        });
      }
    });
  } catch (err) {
    serverLog("error", "Token refresh error:", err);
    res.status(500).json({ 
      success: false, 
      message: `Failed to refresh token: ${err.message}` 
    });
  }
});

// 🔹 Route to Fetch Leaderboard Data
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

    const leaderboardData = result.recordset.map((row) => ({
      id: row.userId.toString(),
      name: row.name || "Ukjent bruker",
      points: row.steps || 0,
      department: "Ukjent avdeling",
      avatar:
        row.avatar && Buffer.isBuffer(row.avatar)
          ? `data:image/jpeg;base64,${row.avatar.toString("base64")}`
          : null,
      change: 0,
    }));

    serverLog("log", `Returning ${leaderboardData.length} leaderboard entries`);
    res.json({ success: true, data: leaderboardData });
  } catch (err) {
    serverLog("error", "Leaderboard fetch error:", err);
    const errorDetails = {
      message: err.message,
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
    };
    serverLog("error", "Error details:", errorDetails);
    res.status(500).json({
      success: false,
      message: "Kunne ikke hente ledertavle. Prøv igjen senere.",
      error: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
});

// 🔹 Route to Logout
app.post("/logout", (req, res) => {
  serverLog("log", "Logout request received");
  req.session.destroy((err) => {
    if (err) {
      serverLog("error", "Logout error:", err);
      return res.status(500).json({ success: false, message: "Logout failed" });
    }
    res.json({ success: true, message: "Logged out successfully" });
  });
});

// 🔹 Route to Fetch User Data
app.get("/user", authenticateJWT, async (req, res) => {
  serverLog(
    "log",
    "User data request received for userId:",
    req.session.userId
  );
  try {
    const pool = await poolPromise;
    const result = await pool.request().input("id", sql.Int, req.session.userId)
      .query(`
        SELECT [Id], [name], [email], [avatar], [created_at], [last_login], [phone], [address]
        FROM [USER]
        WHERE [Id] = @id
      `);

    if (result.recordset.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const user = result.recordset[0];
    user.avatar =
      user.avatar && Buffer.isBuffer(user.avatar)
        ? `data:image/jpeg;base64,${user.avatar.toString("base64")}`
        : null;

    res.json({ success: true, user });
  } catch (err) {
    serverLog("error", "User fetch error:", err);
    const errorDetails = {
      message: err.message,
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
    };
    serverLog("error", "Error details:", errorDetails);
    res
      .status(500)
      .json({
        success: false,
        message: `Failed to fetch user: ${err.message}`,
      });
  }
});

app.get("/user-statistics", authenticateJWT, async (req, res) => {
  serverLog(
    "log",
    "User statistics fetch request for userId:",
    req.session.userId
  );
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("userId", sql.Int, req.session.userId)
      .query(
        "SELECT total_steps FROM [USER_STATISTICS] WHERE userId = @userId"
      );

    if (result.recordset.length === 0) {
      return res.json({ success: true, data: { total_steps: 0 } });
    }

    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    serverLog("error", "User statistics fetch error:", err);
    res.status(500).json({
      success: false,
      message: `Failed to fetch user statistics: ${err.message}`,
    });
  }
});

// 🔹 Route to Update User Data
app.put("/user", authenticateJWT, async (req, res) => {
  serverLog(
    "log",
    "User update request received for userId:",
    req.session.userId
  );
  try {
    const { name, email, phone, address, avatar } = req.body;

    // If updating profile (from editprofile.js), name and email are required
    if (name || email) {
      if (!name || !email) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Name and email are required when updating profile",
          });
      }
    }

    const pool = await poolPromise;

    // Check if user exists
    const userCheck = await pool
      .request()
      .input("id", sql.Int, req.session.userId)
      .query("SELECT Id FROM [USER] WHERE Id = @id");
    if (userCheck.recordset.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check for email uniqueness (excluding the current user) if email is provided
    if (email) {
      const emailCheck = await pool
        .request()
        .input("email", sql.NVarChar, email)
        .input("id", sql.Int, req.session.userId)
        .query("SELECT Id FROM [USER] WHERE email = @email AND Id != @id");
      if (emailCheck.recordset.length > 0) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Email is already in use by another user",
          });
      }
    }

    // Prepare avatar data for VARBINARY storage, only if avatar is provided
    let avatarBuffer = null;
    if (avatar) {
      try {
        // Remove the data URI prefix (e.g., "data:image/jpeg;base64,")
        const base64String = avatar.split(",")[1];
        avatarBuffer = Buffer.from(base64String, "base64");
      } catch (err) {
        serverLog("error", "Invalid avatar base64 data:", err);
        return res
          .status(400)
          .json({ success: false, message: "Invalid avatar data format" });
      }
    }

    // Update user data, only updating fields if they are provided
    await pool
      .request()
      .input("id", sql.Int, req.session.userId)
      .input("name", sql.NVarChar, name || null)
      .input("email", sql.NVarChar, email || null)
      .input("phone", sql.NVarChar, phone || null)
      .input("address", sql.NVarChar, address || null)
      .input("avatar", sql.VarBinary(sql.MAX), avatarBuffer || null).query(`
        UPDATE [USER]
        SET name = COALESCE(@name, name),
            email = COALESCE(@email, email),
            phone = CASE 
                      WHEN @phone IS NOT NULL THEN @phone 
                      ELSE phone 
                    END,
            address = CASE 
                        WHEN @address IS NOT NULL THEN @address 
                        ELSE address 
                      END,
            avatar = CASE 
                      WHEN @avatar IS NOT NULL THEN @avatar 
                      ELSE avatar 
                     END
        WHERE Id = @id
      `);

    serverLog(
      "log",
      "User updated successfully for userId:",
      req.session.userId
    );
    res.json({ success: true, message: "User updated successfully" });
  } catch (err) {
    serverLog("error", "User update error:", err);
    const errorDetails = {
      message: err.message,
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
      code: err.code,
      number: err.number,
    };
    serverLog("error", "Error details:", errorDetails);

    if (err.number === 2627) {
      // Unique constraint violation (likely email)
      return res
        .status(400)
        .json({ success: false, message: "Email is already in use" });
    }
    res
      .status(500)
      .json({
        success: false,
        message: `Failed to update user: ${err.message}`,
      });
  }
});

// 🔹 Route to Get User's Daily Goal
app.get("/user/daily-goal", authenticateJWT, async (req, res) => {
  serverLog("log", "Daily goal fetch request received for userId:", req.session.userId);
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, req.session.userId)
      .query("SELECT [daily_goal] FROM [USER] WHERE [Id] = @id");

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const dailyGoal = result.recordset[0].daily_goal || 7500; // Default to 7500 if not set
    serverLog("log", "Daily goal fetched:", dailyGoal);
    
    res.json({ 
      success: true, 
      daily_goal: dailyGoal 
    });
  } catch (err) {
    serverLog("error", "Daily goal fetch error:", err);
    res.status(500).json({ success: false, message: `Failed to fetch daily goal: ${err.message}` });
  }
});

// 🔹 Route to Update User's Daily Goal
app.put("/user/daily-goal", authenticateJWT, async (req, res) => {
  serverLog("log", "Daily goal update request received:", req.body);
  try {
    const { dailyGoal } = req.body;
    
    if (!dailyGoal || isNaN(parseInt(dailyGoal)) || parseInt(dailyGoal) <= 0) {
      return res.status(400).json({ success: false, message: "Valid daily goal is required" });
    }
    
    const pool = await poolPromise;
    await pool
      .request()
      .input("id", sql.Int, req.session.userId)
      .input("dailyGoal", sql.Int, parseInt(dailyGoal))
      .query("UPDATE [USER] SET [daily_goal] = @dailyGoal WHERE [Id] = @id");
      
    res.json({ success: true, message: "Daily goal updated successfully" });
  } catch (err) {
    serverLog("error", "Daily goal update error:", err);
    res.status(500).json({ success: false, message: `Failed to update daily goal: ${err.message}` });
  }
});

// 🔹 Route to Create or Update Step Activity
app.post("/step-activity", authenticateJWT, async (req, res) => {
  serverLog("log", "Step activity request received:", req.body);
  serverLog("log", "Session userId:", req.session.userId);
  try {
    const { stepCount, distance, timestamp } = req.body;
    // Use consistent userId from JWT token (set by authenticateJWT middleware)
    const userId = req.session.userId;
    
    serverLog("log", "Step activity - using userId:", userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated. Please log in again."
      });
    }

    if (!stepCount && stepCount !== 0) {
      return res
        .status(400)
        .json({ success: false, message: "stepCount is required" });
    }

    const pool = await poolPromise;

    // Validate user
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

    // Get current date for the record
    const currentDate = new Date(timestamp || new Date())
      .toISOString()
      .split("T")[0];

    // Check if a record exists for today
    const todayRecord = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("currentDate", sql.NVarChar, currentDate).query(`
        SELECT Id, step_count
        FROM [STEPACTIVITY]
        WHERE userId = @userId
        AND CAST(timestamp AS DATE) = @currentDate
      `);

    // Begin transaction for atomic updates
    const transaction = pool.transaction();
    await transaction.begin();

    try {
      if (todayRecord.recordset.length > 0) {
        // Update existing record for today
        const recordId = todayRecord.recordset[0].Id;
        const previousSteps = todayRecord.recordset[0].step_count;
        await transaction
          .request()
          .input("id", sql.Int, recordId)
          .input("stepCount", sql.Int, stepCount)
          .input("distance", sql.Float, distance || null)
          .input("timestamp", sql.DateTime, timestamp || new Date()).query(`
            UPDATE [STEPACTIVITY]
            SET step_count = @stepCount, distance = @distance, timestamp = @timestamp
            WHERE Id = @id
          `);

        // Update total_steps in USER_STATISTICS
        const stepDifference = stepCount - previousSteps;
        if (stepDifference !== 0) {
          await transaction
            .request()
            .input("userId", sql.Int, userId)
            .input("stepDifference", sql.BigInt, stepDifference).query(`
              UPDATE [USER_STATISTICS]
              SET total_steps = total_steps + @stepDifference,
                  last_updated = GETDATE()
              WHERE userId = @userId
            `);
        }
      } else {
        // Insert new record for today
        await transaction
          .request()
          .input("userId", sql.Int, userId)
          .input("stepCount", sql.Int, stepCount)
          .input("distance", sql.Float, distance || null)
          .input("timestamp", sql.DateTime, timestamp || new Date()).query(`
            INSERT INTO [STEPACTIVITY] (userId, step_count, distance, timestamp)
            VALUES (@userId, @stepCount, @distance, @timestamp)
          `);

        // Update total_steps in USER_STATISTICS
        await transaction
          .request()
          .input("userId", sql.Int, userId)
          .input("stepCount", sql.BigInt, stepCount).query(`
            MERGE INTO [USER_STATISTICS] AS target
            USING (SELECT @userId AS userId, @stepCount AS stepCount) AS source
            ON target.userId = source.userId
            WHEN MATCHED THEN
              UPDATE SET total_steps = total_steps + @stepCount,
                         last_updated = GETDATE()
            WHEN NOT MATCHED THEN
              INSERT (userId, total_steps, last_updated)
              VALUES (@userId, @stepCount, GETDATE());
          `);
      }

      // Update LEADERBOARD
      const existingLeaderboard = await transaction
        .request()
        .input("userId", sql.Int, userId)
        .query("SELECT user_id FROM [LEADERBOARD] WHERE user_id = @userId");

      if (existingLeaderboard.recordset.length > 0) {
        await transaction
          .request()
          .input("userId", sql.Int, userId)
          .input("steps", sql.Int, stepCount)
          .input("timestamp", sql.DateTime, timestamp || new Date()).query(`
            UPDATE [LEADERBOARD]
            SET steps = @steps, timestamp = @timestamp
            WHERE user_id = @userId
          `);
      } else {
        await transaction
          .request()
          .input("userId", sql.Int, userId)
          .input("steps", sql.Int, stepCount)
          .input("timestamp", sql.DateTime, timestamp || new Date()).query(`
            INSERT INTO [LEADERBOARD] (user_id, steps, timestamp)
            VALUES (@userId, @steps, @timestamp)
          `);
      }

      await transaction.commit();
      res
        .status(201)
        .json({ success: true, message: "Step activity saved successfully" });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    serverLog("error", "Step activity error:", err);
    res.status(500).json({
      success: false,
      message: `Failed to save step activity: ${err.message}`,
    });
  }
});

// 🔹 Route to Fetch Step Activity for User
app.get("/step-activity", authenticateJWT, async (req, res) => {
  serverLog(
    "log",
    "Step activity fetch request for userId:",
    req.session.userId
  );
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("userId", sql.Int, req.session.userId)
      .query(
        "SELECT * FROM [STEPACTIVITY] WHERE userId = @userId ORDER BY [timestamp] DESC"
      );

    res.json({ success: true, data: result.recordset });
  } catch (err) {
    serverLog("error", "Step activity fetch error:", err);
    const errorDetails = {
      message: err.message,
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
    };
    serverLog("error", "Error details:", errorDetails);
    res
      .status(500)
      .json({
        success: false,
        message: `Failed to fetch step activity: ${err.message}`,
      });
  }
});

// 🔹 Route to Create an Event
app.post("/events", authenticateJWT, async (req, res) => {
  serverLog("log", "Event creation request received:", req.body);
  serverLog("log", "User ID from session:", req.session.userId);
  
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

    if (!title || !start_date || !end_date) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Title, start_date, and end_date are required",
        });
    }

    if (!req.session.userId) {
      return res.status(401).json({ 
        success: false, 
        message: "User ID not available. Please log in again." 
      });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("title", sql.NVarChar, title)
      .input("description", sql.NVarChar, description || null)
      .input("activity", sql.NVarChar, activity || null)
      .input("goal", sql.Int, goal || null)
      .input("start_date", sql.DateTime, new Date(start_date))
      .input("end_date", sql.DateTime, new Date(end_date))
      .input("location", sql.NVarChar, location || null)
      .input("event_type", sql.NVarChar, event_type || null)
      .input("total_participants", sql.Int, total_participants || null)
      .input("team_count", sql.Int, team_count || null)
      .input("members_per_team", sql.Int, members_per_team || null)
      .input("created_by", sql.Int, req.session.userId).query(`
        INSERT INTO [EVENTS] 
        (title, description, activity, goal, start_date, end_date, location, event_type, total_participants, team_count, members_per_team, created_by)
        OUTPUT INSERTED.Id
        VALUES 
        (@title, @description, @activity, @goal, @start_date, @end_date, @location, @event_type, @total_participants, @team_count, @members_per_team, @created_by)
      `);

    const eventId = result.recordset[0].Id;
    
    // Automatically add the creator as a participant
    await pool
      .request()
      .input("eventId", sql.Int, eventId)
      .input("userId", sql.Int, req.session.userId)
      .input("teamId", sql.Int, null)
      .query(`
        INSERT INTO [EVENT_PARTICIPANTS] (event_id, user_id, team_id)
        VALUES (@eventId, @userId, @teamId)
      `);
    
    serverLog("log", "Event created successfully with ID:", eventId);
    serverLog("log", "Creator automatically added as participant");

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      eventId: eventId
    });
  } catch (err) {
    serverLog("error", "Event creation error:", err);
    const errorDetails = {
      message: err.message,
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
    };
    serverLog("error", "Error details:", errorDetails);
    res
      .status(500)
      .json({
        success: false,
        message: `Failed to create event: ${err.message}`,
      });
  }
});

// 🔹 Route to Fetch All Events for a User
app.get("/events", authenticateJWT, async (req, res) => {
  serverLog("log", "Events fetch request for userId:", req.session.userId);
  try {
    const pool = await poolPromise;
    
    // Query to get both created events and events the user is participating in
    const result = await pool
      .request()
      .input("userId", sql.Int, req.session.userId)
      .query(`
        SELECT DISTINCT e.*
        FROM [EVENTS] e
        LEFT JOIN [EVENT_PARTICIPANTS] ep ON e.Id = ep.event_id
        WHERE e.created_by = @userId OR ep.user_id = @userId
      `);

    // Get participants for each event
    const events = await Promise.all(
      result.recordset.map(async (event) => {
        // Fetch participants for this event
        const participantsResult = await pool
          .request()
          .input("eventId", sql.Int, event.Id)
          .query(`
            SELECT 
              ep.id, 
              ep.event_id, 
              ep.user_id, 
              ep.team_id,
              u.name as user_name
            FROM [EVENT_PARTICIPANTS] ep
            JOIN [USER] u ON ep.user_id = u.Id
            WHERE ep.event_id = @eventId
          `);

        // Map participants to a clean format
        const participants = participantsResult.recordset.map(p => ({
          id: p.id,
          eventId: p.event_id,
          userId: p.user_id,
          teamId: p.team_id,
          userName: p.user_name
        }));

        // Return event with its participants
        return {
          ...event,
          participants: participants
        };
      })
    );

    res.json({ success: true, data: events });
  } catch (err) {
    serverLog("error", "Events fetch error:", err);
    const errorDetails = {
      message: err.message,
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
    };
    serverLog("error", "Error details:", errorDetails);
    res
      .status(500)
      .json({
        success: false,
        message: `Failed to fetch events: ${err.message}`,
      });
  }
});

// 🔹 Route to Update an Event
app.put("/events/:id", authenticateJWT, async (req, res) => {
  serverLog("log", "Event update request received for eventId:", req.params.id);
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

    if (!title || !start_date || !end_date) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Title, start_date, and end_date are required",
        });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("eventId", sql.Int, eventId)
      .input("userId", sql.Int, req.session.userId)
      .query(
        "SELECT Id FROM [EVENTS] WHERE Id = @eventId AND created_by = @userId"
      );

    if (result.recordset.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Event not found or you lack permission",
        });
    }

    await pool
      .request()
      .input("eventId", sql.Int, eventId)
      .input("title", sql.NVarChar, title)
      .input("description", sql.NVarChar, description || null)
      .input("activity", sql.NVarChar, activity || null)
      .input("goal", sql.Int, goal || null)
      .input("start_date", sql.Date, new Date(start_date))
      .input("end_date", sql.Date, new Date(end_date))
      .input("location", sql.NVarChar, location || null)
      .input("event_type", sql.NVarChar, event_type || null)
      .input("total_participants", sql.Int, total_participants || null)
      .input("team_count", sql.Int, team_count || null)
      .input("members_per_team", sql.Int, members_per_team || null).query(`
        UPDATE [EVENTS]
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
        WHERE Id = @eventId
      `);

    res.json({ success: true, message: "Event updated successfully" });
  } catch (err) {
    serverLog("error", "Event update error:", err);
    const errorDetails = {
      message: err.message,
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
    };
    serverLog("error", "Error details:", errorDetails);
    res
      .status(500)
      .json({
        success: false,
        message: `Failed to update event: ${err.message}`,
      });
  }
});

// 🔹 Route to Delete an Event
app.delete("/events/:id", authenticateJWT, async (req, res) => {
  serverLog(
    "log",
    "Event deletion request received for eventId:",
    req.params.id
  );
  try {
    const eventId = req.params.id;

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("eventId", sql.Int, eventId)
      .input("userId", sql.Int, req.session.userId)
      .query(
        "DELETE FROM [EVENTS] WHERE Id = @eventId AND created_by = @userId"
      );

    if (result.rowsAffected[0] === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Event not found or you lack permission",
        });
    }

    res.json({ success: true, message: "Event deleted successfully" });
  } catch (err) {
    serverLog("error", "Event deletion error:", err);
    const errorDetails = {
      message: err.message,
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
    };
    serverLog("error", "Error details:", errorDetails);
    res
      .status(500)
      .json({
        success: false,
        message: `Failed to delete event: ${err.message}`,
      });
  }
});

// Add these endpoints just before the "Basic Test Endpoint" section (around line 620)

// 🔹 Route to Join an Event
app.post("/events/:id/join", authenticateJWT, async (req, res) => {
  serverLog("log", "Event join request received for eventId:", req.params.id);
  try {
    const eventId = parseInt(req.params.id, 10);
    const userId = req.session.userId;
    const { teamId } = req.body; // Optional team ID if joining a team event
    
    // Validate inputs
    if (isNaN(eventId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid event ID format. Must be a number." 
      });
    }
    
    serverLog("log", "Join event request details:", { eventId, userId, teamId });
    
    const pool = await poolPromise;
    
    // Check if event exists
    const eventCheck = await pool
      .request()
      .input("eventId", sql.Int, eventId)
      .query("SELECT * FROM [EVENTS] WHERE Id = @eventId");
      
    if (eventCheck.recordset.length === 0) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    
    // Check if user is already a participant
    const participantCheck = await pool
      .request()
      .input("eventId", sql.Int, eventId)
      .input("userId", sql.Int, userId)
      .query("SELECT * FROM [EVENT_PARTICIPANTS] WHERE event_id = @eventId AND user_id = @userId");
      
    if (participantCheck.recordset.length > 0) {
      return res.status(400).json({ success: false, message: "User is already a participant in this event" });
    }
    
    // Add user to event participants
    const insertResult = await pool
      .request()
      .input("eventId", sql.Int, eventId)
      .input("userId", sql.Int, userId)
      .input("teamId", sql.Int, teamId || null)
      .query(`
        INSERT INTO [EVENT_PARTICIPANTS] (event_id, user_id, team_id)
        VALUES (@eventId, @userId, @teamId)
      `);
    
    const participantId = insertResult.recordset[0].id;
    
    serverLog("log", "User successfully joined event:", { userId, eventId, participantId });
    res.json({ 
      success: true, 
      message: "Successfully joined event",
      participantId
    });
  } catch (err) {
    serverLog("error", "Event join error:", err);
    const errorDetails = {
      message: err.message,
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
    };
    serverLog("error", "Error details:", errorDetails);
    res.status(500).json({ success: false, message: `Failed to join event: ${err.message}` });
  }
});

// 🔹 Route to Leave an Event
app.delete("/events/:id/leave", authenticateJWT, async (req, res) => {
  serverLog("log", "Event leave request received for eventId:", req.params.id);
  try {
    const eventId = req.params.id;
    const userId = req.session.userId;
    
    const pool = await poolPromise;
    
    const result = await pool
      .request()
      .input("eventId", sql.Int, eventId)
      .input("userId", sql.Int, userId)
      .query("DELETE FROM [EVENT_PARTICIPANTS] WHERE event_id = @eventId AND user_id = @userId");
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: "User is not a participant in this event" });
    }
    
    serverLog("log", "User successfully left event:", { userId, eventId });
    res.json({ success: true, message: "Successfully left event" });
  } catch (err) {
    serverLog("error", "Event leave error:", err);
    const errorDetails = {
      message: err.message,
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
    };
    serverLog("error", "Error details:", errorDetails);
    res.status(500).json({ success: false, message: `Failed to leave event: ${err.message}` });
  }
});

// 🔹 Route to Get Event Participants
app.get("/events/:id/participants", authenticateJWT, async (req, res) => {
  serverLog("log", "Event participants request received for eventId:", req.params.id);
  try {
    const eventId = parseInt(req.params.id, 10);
    
    // Validate eventId is a number
    if (isNaN(eventId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid event ID format. Must be a number." 
      });
    }
    
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("eventId", sql.Int, eventId)
      .query(`
        SELECT 
          ep.id, 
          ep.event_id, 
          ep.user_id, 
          ep.team_id,
          u.name as user_name,
          u.avatar
        FROM [EVENT_PARTICIPANTS] ep
        JOIN [USER] u ON ep.user_id = u.Id
        WHERE ep.event_id = @eventId
      `);
    
    const participants = result.recordset.map(participant => ({
      id: participant.id,
      eventId: participant.event_id,
      userId: participant.user_id,
      teamId: participant.team_id,
      userName: participant.user_name,
      avatar: participant.avatar && Buffer.isBuffer(participant.avatar)
        ? `data:image/jpeg;base64,${participant.avatar.toString("base64")}`
        : null
    }));
    
    serverLog("log", `Found ${participants.length} participants for event ${eventId}`);
    res.json({ success: true, data: participants });
  } catch (err) {
    serverLog("error", "Event participants fetch error:", err);
    const errorDetails = {
      message: err.message,
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
    };
    serverLog("error", "Error details:", errorDetails);
    res.status(500).json({ success: false, message: `Failed to fetch event participants: ${err.message}` });
  }
});

// 🔹 Route to Modify a Participant's Team
app.put("/events/:eventId/participants/:participantId", authenticateJWT, async (req, res) => {
  serverLog("log", "Update participant request received:", {
    eventId: req.params.eventId,
    participantId: req.params.participantId
  });
  try {
    const { eventId, participantId } = req.params;
    const { teamId } = req.body;
    
    const pool = await poolPromise;
    
    // Check if participant exists and belongs to the event
    const participantCheck = await pool
      .request()
      .input("participantId", sql.Int, participantId)
      .input("eventId", sql.Int, eventId)
      .query("SELECT * FROM [EVENT_PARTICIPANTS] WHERE id = @participantId AND event_id = @eventId");
      
    if (participantCheck.recordset.length === 0) {
      return res.status(404).json({ success: false, message: "Participant not found for this event" });
    }
    
    // Check if the current user has permission (is event creator or the participant)
    const participant = participantCheck.recordset[0];
    const eventCheck = await pool
      .request()
      .input("eventId", sql.Int, eventId)
      .query("SELECT created_by FROM [EVENTS] WHERE Id = @eventId");
      
    if (eventCheck.recordset.length === 0) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    
    const eventCreator = eventCheck.recordset[0].created_by;
    if (participant.user_id !== req.session.userId && eventCreator !== req.session.userId) {
      return res.status(403).json({ success: false, message: "You don't have permission to update this participant" });
    }
    
    // Update the participant's team
    await pool
      .request()
      .input("participantId", sql.Int, participantId)
      .input("teamId", sql.Int, teamId || null)
      .query("UPDATE [EVENT_PARTICIPANTS] SET team_id = @teamId WHERE id = @participantId");
    
    serverLog("log", "Participant team updated:", { participantId, teamId });
    res.json({ success: true, message: "Participant team updated successfully" });
  } catch (err) {
    serverLog("error", "Update participant error:", err);
    const errorDetails = {
      message: err.message,
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
    };
    serverLog("error", "Error details:", errorDetails);
    res.status(500).json({ success: false, message: `Failed to update participant: ${err.message}` });
  }
});

// 🔹 Route to Check if User is Participating in an Event
app.get("/events/:id/participation", authenticateJWT, async (req, res) => {
  serverLog("log", "Participation check request received for eventId:", req.params.id);
  try {
    const eventId = parseInt(req.params.id, 10);
    const userId = req.session.userId;
    
    // Validate eventId is a number
    if (isNaN(eventId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid event ID format. Must be a number." 
      });
    }
    
    // Log session and user info for debugging
    serverLog("log", "Session info in participation check:", {
      sessionExists: !!req.session,
      sessionUserId: req.session.userId
    });
    
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("eventId", sql.Int, eventId)
      .input("userId", sql.Int, userId)
      .query(`
        SELECT id, team_id
        FROM [EVENT_PARTICIPANTS]
        WHERE event_id = @eventId AND user_id = @userId
      `);
    
    if (result.recordset.length === 0) {
      return res.json({ success: true, isParticipating: false });
    }
    
    const participation = result.recordset[0];
    
    res.json({ 
      success: true, 
      isParticipating: true,
      participantId: participation.id,
      teamId: participation.team_id
    });
  } catch (err) {
    serverLog("error", "Participation check error:", err);
    const errorDetails = {
      message: err.message,
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
    };
    serverLog("error", "Error details:", errorDetails);
    res.status(500).json({ success: false, message: `Failed to check participation: ${err.message}` });
  }
});

// 🔹 Basic Test Endpoint
app.get("/test", (req, res) => {
  res.json({ message: "API is working!", timestamp: new Date().toISOString() });
});

// 🔹 Health Check Endpoint
app.get("/health", async (req, res) => {
  serverLog("log", "Health check request received");
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
      environment: process.env.NODE_ENV || "unknown",
      bcryptLoaded: typeof bcrypt !== "undefined",
      time: new Date().toISOString(),
      env_vars: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        DB_CONFIG_EXISTS: !!process.env.MSSQL_USER,
        SESSION_SECRET_EXISTS: !!process.env.SESSION_SECRET,
        JWT_SECRET_EXISTS: !!process.env.JWT_SECRET,
      },
    });
  } catch (err) {
    serverLog("error", "Health check error:", err);
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
});

// 🔹 API Status Endpoint
app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
});

// 🔹 Logs Endpoint
app.get("/logs", authenticateJWT, (req, res) => {
  res.json(recentLogs);
});

// 🔹 Root Endpoint
app.get("/", (req, res) => {
  res.send("API is running ✅");
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
