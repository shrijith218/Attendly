const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ✅ Supabase setup
const supabaseUrl = 'https://ieqlswwdfobuuahxyowh.supabase.co'; // Replace with your actual URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllcWxzd3dkZm9idXVhaHh5b3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1OTU2MTQsImV4cCI6MjA2NjE3MTYxNH0.kVfRidaDIH-uABmkbWf7yr0YlZmRkbtOuGFnN2KePFI';                   // Replace with your anon/public API key
const supabase = createClient(supabaseUrl, supabaseKey);

// === POST /scan: Log scanned data ===
app.post('/scan', async (req, res) => {
  const { barcode, time } = req.body;

  if (!barcode || !time) {
    return res.status(400).json({ error: "Missing barcode or time" });
  }

  try {
    // 1. Get student from 'students'
    const { data: student, error: fetchError } = await supabase
      .from('students')
      .select('*')
      .eq('admission_number', barcode)
      .single();

    if (fetchError || !student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // 2. Insert into 'attendance_log'
    const { error: insertError } = await supabase
      .from('attendance_log')
      .insert({
        admission_number: barcode,
        name: student.name,
        class_sec: student.class_sec,
        timestamp: time
      });

    if (insertError) {
      return res.status(500).json({ error: insertError.message });
    }

    res.json({
      success: true,
      student: {
        admission_number: student.admission_number,
        name: student.name,
        class_sec: student.class_sec
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === GET /attendance: View all logs ===
app.get('/attendance', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('attendance_log')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === Start the server ===
app.listen(PORT, () => {
  console.log(`✅ Supabase server running on port ${PORT}`);
});
