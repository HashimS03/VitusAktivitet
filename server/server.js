const express = require("express");
const cors = require("cors");
const passport = require("./auth"); // Import Azure AD authentication
const session = require("express-session");
const jwt = require("jsonwebtoken");
const pool = require("./db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// 🔹 Azure Entra ID Login Route
app.get("/auth/login", passport.authenticate("azuread-openidconnect"));

// 🔹 Azure Entra ID Callback Route
app.post(
  "/auth/callback",
  passport.authenticate("azuread-openidconnect", { failureRedirect: "/" }),
  (req, res) => {
    // Generate a JWT token for the user
    const token = jwt.sign(req.user, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, user: req.user });
  }
);

// 🔹 Protected API Route
app.get("/users", async (req, res) => {
  try {
    const users = await pool.query("SELECT * FROM users");
    res.json(users.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
