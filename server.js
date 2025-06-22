const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(path.join(__dirname, 'db.sqlite'));

db.run(`CREATE TABLE IF NOT EXISTS scan_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barcode TEXT,
  timestamp TEXT
)`);

app.post('/scan', (req, res) => {
  const { barcode, time } = req.body;
  db.run(`INSERT INTO scan_log (barcode, timestamp) VALUES (?, ?)`, [barcode, time], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: this.lastID });
  });
});

app.get('/logs', (req, res) => {
  db.all(`SELECT * FROM scan_log ORDER BY id DESC`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
