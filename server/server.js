const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// CORS configuration - Allow only your Netlify frontend URL
const corsOptions = {
  origin: 'https://melodic-bubblegum-753e3e.netlify.app', // Replace with your actual Netlify frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods (you can adjust this if necessary)
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers (including Authorization for JWT token)
};

// Middleware
app.use(cors(corsOptions)); // Apply CORS with the options
app.use(express.json()); // Parse incoming JSON requests

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Budget App API' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
