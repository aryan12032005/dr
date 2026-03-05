require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Import routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const documentRoutes = require('./src/routes/documents');
const departmentRoutes = require('./src/routes/departments');
const categoryRoutes = require('./src/routes/categories');
const groupRoutes = require('./src/routes/groups');
const queryRoutes = require('./src/routes/queries');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware - allow multiple frontend origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all for dev
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Digital Repository API' });
});

// Routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', documentRoutes);
app.use('/api', departmentRoutes);
app.use('/api', categoryRoutes);
app.use('/api', groupRoutes);
app.use('/api', queryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
