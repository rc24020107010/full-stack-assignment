import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import studentRoutes from './routes/studentRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables from .env file
dotenv.config();

// Initialize MongoDB connection
connectDB();

const app = express();

// Built-in middleware to parse incoming JSON payloads
app.use(express.json());

// Base route / API status
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Student Attendance Management System API is running.',
    course: 'B.Voc (Software Development)',
    semester: 5,
    subject: 'Full Stack Web Development - 2',
    documentation: '/README.md',
    endpoints: {
      students: '/api/students',
      attendance: '/api/attendance',
    },
  });
});

// Mount modular API routes
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);

// Catch-all 404 handler for undefined endpoints
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
  console.log(`📡 Base API URL: http://localhost:${PORT}`);
});

