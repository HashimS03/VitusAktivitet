const express = require("express");
const cors = require("cors");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const { sql, poolPromise } = require("./db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);


// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
