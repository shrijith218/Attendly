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

// === Create master student table (if not exists) ===
db.run(`CREATE TABLE IF NOT EXISTS students (
  admission_number TEXT PRIMARY KEY,
  name TEXT,
  class_sec TEXT
)`);

// === Create attendance log table ===
db.run(`CREATE TABLE IF NOT EXISTS attendance_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admission_number TEXT,
  name TEXT,
  class_sec TEXT,
  timestamp TEXT
)`);

// === Scan handler ===
app.post('/scan', (req, res) => {
  const { barcode, time } = req.body;

  if (!barcode || !time) {
    return res.status(400).json({ error: "Missing barcode or time" });
  }

  // barcode is admission_number
  db.get(`SELECT * FROM students WHERE admission_number = ?`, [barcode], (err, student) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Log into attendance_log
    db.run(`INSERT INTO attendance_log (admission_number, name, class_sec, timestamp)
            VALUES (?, ?, ?, ?)`,
      [student.admission_number, student.name, student.class_sec, time],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });

        res.json({
          success: true,
          id: this.lastID,
          student: {
            admission_number: student.admission_number,
            name: student.name,
            class_sec: student.class_sec
          }
        });
      }
    );
  });
});

// === View attendance log ===
app.get('/attendance', (req, res) => {
  db.all(`SELECT * FROM attendance_log ORDER BY id DESC`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// === Start server ===
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
