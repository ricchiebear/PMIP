const express = require('express');
const cors = require('cors');
const pool = require('./config/database');

const artistRoutes = require('./routes/artistRoutes');
const trackRoutes = require('./routes/trackRoutes');
const releaseRoutes = require('./routes/releaseRoutes');
const streamingRoutes = require('./routes/streamingRoutes');
const intelligenceRoutes = require('./routes/intelligenceRoutes');
const countryRoutes = require('./routes/countryRoutes');

const app = express();

// Global middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
  })
);
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  return res.status(200).json({
    status: 'success',
    message: 'PMIP Backend API is running'
  });
});

// Database health check
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT 1 AS database_status'
    );

    return res.status(200).json({
      status: 'success',
      message: 'PMIP Backend API and database are connected',
      database: rows[0].database_status
    });
  } catch (error) {
    console.error(
      'Database health check failed:',
      error
    );

    return res.status(500).json({
      status: 'error',
      error: {
        code: 'DATABASE_CONNECTION_ERROR',
        message: 'PMIP database connection failed.'
      }
    });
  }
});

// API routes
app.use('/api/artists', artistRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/releases', releaseRoutes);
app.use('/api/streaming', streamingRoutes);
app.use('/api/intelligence', intelligenceRoutes);
app.use('/api/countries', countryRoutes);

// Unknown API routes
app.use((req, res) => {
  return res.status(404).json({
    status: 'error',
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'The requested API route could not be found.'
    }
  });
});

// Global error handler
app.use((error, req, res, next) => {
  const statusCode = 
    error.statusCode ||
    error.status ||
    500;

  const errorCode =
    statusCode >= 500
      ? 'INTERNAL_SERVER_ERROR'
      : error.code || 
        (statusCode === 400
          ? 'BAD_REQUEST'
          : 'REQUEST_ERROR');

  const message =
    statusCode >= 500
      ? 'An unexpected server error occurred.'
      : error.message || 'The request could not be completed.';

  if (statusCode >= 500) {
    console.error('Unhandled API error:', error);
  }

  return res.status(statusCode).json({
    status: 'error',
    error: {
      code: errorCode,
      message
    }
  });
});

module.exports = app;