const sql = require("mssql");
require("dotenv").config();

const config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_HOST,
  database: process.env.MSSQL_DATABASE,
  port: parseInt(process.env.MSSQL_PORT, 10),
  options: {
    encrypt: true, // Required for Azure
    trustServerCertificate: false,
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("✅ Connected to Azure SQL Database");
    return pool;
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err);
    process.exit(1); // Exit process if connection fails
  });

module.exports = {
  sql,
  poolPromise,
};
