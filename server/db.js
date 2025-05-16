const sql = require("mssql");

// Log the connection attempt
console.log("Setting up database connection...");

// Connection configuration with fallbacks
const config = {
  user: process.env.MSSQL_USER || "your_default_user",
  password: process.env.MSSQL_PASSWORD || "your_default_password",
  server: process.env.MSSQL_HOST || "localhost",
  database: process.env.MSSQL_DATABASE || "your_default_database",
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

// Create a mock pool for when real connection fails
const createMockPool = () => {
  console.warn("Using mock database connection - QUERIES WILL FAIL");
  return {
    request: () => ({
      input: () => ({
        input: () => ({
          query: async () => {
            throw new Error("Database connection failed - cannot execute query");
          },
        }),
        query: async () => {
          throw new Error("Database connection failed - cannot execute query");
        },
      }),
      query: async () => {
        throw new Error("Database connection failed - cannot execute query");
      },
    }),
  };
};

// Create connection pool with error handling
let isConnected = false;
let connectionError = null;

const poolPromise = new Promise((resolve) => {
  sql
    .connect(config)
    .then((pool) => {
      console.log("Connected to database successfully!");
      isConnected = true;
      resolve(pool);
    })
    .catch((err) => {
      console.error("Database connection failed:", err);
      connectionError = err;
      resolve(createMockPool()); // Resolve with mock so the server can still start
    });
});

module.exports = {
  sql,
  poolPromise,
  isConnected: () => isConnected,
  getConnectionError: () => connectionError,
};



