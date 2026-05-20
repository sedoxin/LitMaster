const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./src/config/db');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',          require('./src/routes/auth.routes'));
app.use('/api/users',         require('./src/routes/user.routes'));
app.use('/api/literature',    require('./src/routes/literature.routes'));
app.use('/api/prompts',       require('./src/routes/prompt.routes'));
app.use('/api/pronunciation', require('./src/routes/pronunciation.routes'));
app.use('/api/progress',      require('./src/routes/progress.routes'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'LitMaster REST API is running.' });
});

// Start server
app.listen(PORT, () => {
  console.log(`LitMaster API running on port ${PORT}`);
});
