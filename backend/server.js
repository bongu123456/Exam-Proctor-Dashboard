const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, getDbMode } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const examRoutes = require('./routes/examRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Allow all origins for dev simplicity
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB Connection
connectDB();

// API Status Route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Exam Proctoring API is operational',
    databaseMode: getDbMode(),
    timestamp: new Date()
  });
});

// Mounted Routes
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/submissions', submissionRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`💾 Active Database Mode: [${getDbMode().toUpperCase()}]`);
  console.log(`===================================================`);
});
