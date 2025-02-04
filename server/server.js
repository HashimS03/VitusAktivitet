require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sql = require('mssql');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Configuration (Azure SQL)
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  options: {
    encrypt: true, 
    trustServerCertificate: false
  }
};

// Connect to Azure SQL
async function connectDB() {
  try {
    await sql.connect(dbConfig);
    console.log('✅ Connected to Azure SQL Database');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}
connectDB();

// Fetch Leaderboard Data
app.get('/leaderboard', async (req, res) => {
  try {
    const result = await sql.query('SELECT id, name, points, avatar FROM Leaderboard ORDER BY points DESC');
    res.json(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
