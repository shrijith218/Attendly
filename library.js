const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();

const db = new sqlite3.Database(path.join(__dirname, '../db/library.db'));

router.post('/api/borrow', (req, res) => {
  const { student_id, book_code } = req.body;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  db.run(`INSERT INTO transactions (student_id, book_code, borrow_date, due_date) VALUES (?, ?, ?, ?)`,
    [student_id, book_code, new Date().toISOString(), dueDate.toISOString()],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'DB error' });
      }
      res.json({ message: 'Book issued successfully' });
    });
});

module.exports = router;
