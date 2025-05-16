const sql = require("mssql");
require("dotenv").config();

// Log the connection attempt
console.log("Setting up database connection...");
console.log("DB Host:", process.env.MSSQL_HOST);
console.log("DB Name:", process.env.MSSQL_DATABASE);
console.log("DB Port:", process.env.MSSQL_PORT);
console.log("DB User is set:", !!process.env.MSSQL_USER);
console.log("DB Password is set:", !!process.env.MSSQL_PASSWORD);

// Connection configuration
const config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_HOST,
  database: process.env.MSSQL_DATABASE,
  port: parseInt(process.env.MSSQL_PORT, 10) || 1433,
  options: {
    encrypt: true, // Required for Azure
    trustServerCertificate: false,
    connectTimeout: 30000, // 30 seconds
    requestTimeout: 30000, // 30 seconds
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// Create connection pool
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Connected to database successfully!");
    return pool;
  })
  .catch((err) => {
    console.error("Database connection error:", err);
    throw err;
  });

module.exports = {
  sql,
  poolPromise,
};



