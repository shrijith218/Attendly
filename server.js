const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath);

// Create table if not exists
db.run(`CREATE TABLE IF NOT EXISTS scan_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barcode TEXT NOT NULL,
  timestamp TEXT NOT NULL
)`);

// Store scanned barcode
app.post('/scan', (req, res) => {
  const { barcode, time } = req.body;
  if (!barcode || !time) return res.status(400).json({ error: "Invalid input" });

  db.run(`INSERT INTO scan_log (barcode, timestamp) VALUES (?, ?)`, [barcode, time], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: this.lastID });
  });
});

// Retrieve all scans
app.get('/logs', (req, res) => {
  db.all(`SELECT * FROM scan_log ORDER BY id DESC`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
