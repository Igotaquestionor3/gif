const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const GIF_PATH = path.join(__dirname, 'funny.gif'); // Make sure your GIF is named funny.gif here

app.get('/funny.gif', (req, res) => {
  const userAgent = req.get('User-Agent') || 'Unknown';

  // Log request info
  const logLine = `${new Date().toISOString()} - ${req.ip} - ${userAgent}\n`;
  console.log(logLine);
  fs.appendFile('requests.log', logLine, err => {
    if (err) console.error('Failed to write log:', err);
  });

  // Set headers to prevent caching
  res.setHeader('Content-Type', 'image/gif');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  // Stream the GIF file
  fs.createReadStream(GIF_PATH).pipe(res);
});

// Logs route protected by password query param
app.get('/logs', (req, res) => {
  const auth = req.query.auth || '';
  if (auth !== process.env.LOG_PASSWORD) {
    return res.status(403).send('Forbidden: Invalid password');
  }

  fs.readFile('requests.log', 'utf8', (err, data) => {
    if (err) return res.status(500).send('No logs available.');
    res.type('text/plain').send(data);
  });
});

// Health check route
app.get('/', (req, res) => {
  res.send('GIF Logger is running');
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
