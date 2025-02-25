const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }, // Required for Azure
});

pool.connect()
  .then(() => console.log("✅ Connected to Azure PostgreSQL"))
  .catch((err) => console.error("❌ Database connection failed:", err));

module.exports = pool;
