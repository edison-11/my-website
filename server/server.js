require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const apiRoutes = require('./routes');

const app = express();
if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required');
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be configured with at least 32 characters');
const allowedOrigins = new Set((process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((origin) => origin.trim()));
for (const origin of allowedOrigins) {
  const url = new URL(origin);
  if (url.hostname === 'localhost') {
    url.hostname = '127.0.0.1';
    allowedOrigins.add(url.origin);
  } else if (url.hostname === '127.0.0.1') {
    url.hostname = 'localhost';
    allowedOrigins.add(url.origin);
  }
}
app.use(cors({ origin: [...allowedOrigins] }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api', apiRoutes);
app.use('/api', (_req, res) => res.status(404).json({ message: 'Route not found' }));
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '1d', immutable: true }));
app.use(express.static(clientDist));
app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid identifier or field value' });
  if (err.code === 11000) return res.status(409).json({ message: 'A record with that value already exists' });
  res.status(err.status || 500).json({ message: err.status ? err.message : 'Server error' });
});

const port = process.env.PORT || 5000;
connectDB()
  .then(() => {
    const server = app.listen(port, () => console.log(`API listening on port ${port}`));
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`API port ${port} is already in use. The API may already be running; check http://127.0.0.1:${port}/api/health.`);
        process.exitCode = 1;
        return;
      }
      console.error('API server failed to start:', error.message);
      process.exitCode = 1;
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  });
