const sql = require("mssql");
require("dotenv").config();

const config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_HOST,
  port: 1433,
  database: "master", // Connect to the master database first
  options: {
    encrypt: true, // Required for Azure
    trustServerCertificate: false,
  },
};

async function listDatabases() {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query("SELECT name FROM sys.databases");
    console.log("📌 Available Databases:", result.recordset);
    pool.close();
  } catch (err) {
    console.error("❌ Error fetching databases:", err.message);
  }
}

listDatabases();
