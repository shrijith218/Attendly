require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const attendanceRoutes = require('./attendance');
const libraryRoutes = require('./library');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Mount routes
app.use('/attendance', attendanceRoutes);
app.use('/library', libraryRoutes);

// Fallback to index.html for SPAs or main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
