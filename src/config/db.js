const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Create a connection pool for efficient database access
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'litmaster_db',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

// Verify connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('Connected to MySQL database.');
    connection.release();
  }
});

module.exports = pool.promise();
