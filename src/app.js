const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');

/**
 * Creates and configures an Express application
 * @returns {object} Express app instance
 */
function createApp() {
  const app = express();
  
  // Set up middleware
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  
  // Security headers
  app.use((req, res, next) => {
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
  });
  
  return app;
}

module.exports = { createApp };