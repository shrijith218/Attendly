You said:
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const ExcelJS = require('exceljs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const supabaseUrl = 'https://ieqlswwdfobuuahxyowh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllcWxzd3dkZm9idXVhaHh5b3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1OTU2MTQsImV4cCI6MjA2NjE3MTYxNH0.kVfRidaDIH-uABmkbWf7yr0YlZmRkbtOuGFnN2KePFI'; // Replace securely
const supabase = createClient(supabaseUrl, supabaseKey);

// === POST /scan: Save attendance ===
app.post('/scan', async (req, res) => {
  const { barcode, time } = req.body;
  if (!barcode || !time) return res.status(400).json({ error: "Missing barcode or time" });

  try {
    const { data: student, error: fetchError } = await supabase
      .from('students')
      .select('*')
      .eq('admission_number', barcode)
      .single();

    if (fetchError || !student) {
      console.log("❌ Student fetch error:", fetchError);
      return res.status(404).json({ error: "Student not found" });
    }

    const { data: inserted, error: insertError } = await supabase
      .from('attendance_log')
      .insert({
        admission_number: barcode,
        name: student.name,
        class_sec: student.class_sec,
        timestamp: time
      })
      .select();

    if (insertError) {
      console.error("❌ Insert error:", insertError);
      return res.status(500).json({ error: insertError.message });
    }

    console.log("✅ Insert success:", inserted);
    res.json({
      success: true,
      student: {
        admission_number: student.admission_number,
        name: student.name,
        class_sec: student.class_sec
      }
    });
  } catch (err) {
    console.log("❌ Server error:", err);
    res.status(500).json({ error: err.message });
  }
});

// === GET /download-excel?date=YYYY-MM-DD ===
app.get('/download-excel', async (req, res) => {
  const date = req.query.date;
  if (!date) return res.status(400).json({ error: "Missing ?date=YYYY-MM-DD" });

  const { data, error } = await supabase
    .from('attendance_log')
    .select('*')
    .gte('timestamp', ${date}T00:00:00)
    .lt('timestamp', ${date}T23:59:59)
    .order('timestamp', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(Log ${date});

  worksheet.columns = [
    { header: 'Admission Number', key: 'admission_number', width: 20 },
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Class/Section', key: 'class_sec', width: 15 },
    { header: 'Timestamp', key: 'timestamp', width: 30 },
  ];

  data.forEach(row => worksheet.addRow(row));

  res.setHeader('Content-Disposition', attachment; filename="attendance_log_${date}.xlsx");
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  await workbook.xlsx.write(res);
  res.end();
});

// === Start server ===
app.listen(PORT, () => {
  console.log(✅ Supabase server running on port ${PORT});
});
