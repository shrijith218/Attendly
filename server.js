require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const ExcelJS = require('exceljs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


// === POST /scan: Save attendance (barcode OR manual entry) ===
app.post('/scan', async (req, res) => {
  try {
    const { barcode, admissionNumber, time } = req.body;
    const admission = (barcode || admissionNumber || '').toString().trim();
    const timestamp = (time || new Date().toISOString()).toString();

    if (!admission) {
      return res.status(400).json({ error: 'Missing admission number (barcode or admissionNumber)' });
    }

    // Fetch student record
    const { data: student, error: fetchError } = await supabase
      .from('students')
      .select('*')
      .eq('admission_number', admission)
      .single();

    if (fetchError || !student) {
      console.log('❌ Student fetch error:', fetchError);
      return res.status(404).json({ error: 'Student not found' });
    }

    // Insert attendance log
    const { data: inserted, error: insertError } = await supabase
      .from('attendance_log')
      .insert({
        admission_number: admission,
        name: student.name,
        class_sec: student.class_sec,
        timestamp: timestamp,
      })
      .select();

    if (insertError) {
      console.error('❌ Insert error:', insertError);
      return res.status(500).json({ error: insertError.message });
    }

    console.log('✅ Insert success:', inserted);
    return res.json({
      success: true,
      student: {
        admission_number: student.admission_number,
        name: student.name,
        class_sec: student.class_sec,
      },
    });
  } catch (err) {
    console.error('❌ Server error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

// === GET /download-excel?date=YYYY-MM-DD ===
app.get('/download-excel', async (req, res) => {
  try {
    const date = req.query.date;
    if (!date) return res.status(400).json({ error: 'Missing ?date=YYYY-MM-DD' });

    // Use template strings properly
    const startIso = `${date}T00:00:00`;
    const endIso = `${date}T23:59:59`;

    const { data, error } = await supabase
      .from('attendance_log')
      .select('*')
      .gte('timestamp', startIso)
      .lt('timestamp', endIso)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('❌ Supabase query error:', error);
      return res.status(500).json({ error: error.message });
    }

    // Build Excel file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Log ${date}`);

    worksheet.columns = [
      { header: 'Admission Number', key: 'admission_number', width: 20 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Class/Section', key: 'class_sec', width: 18 },
      { header: 'Timestamp', key: 'timestamp', width: 28 },
    ];

    if (Array.isArray(data)) data.forEach(row => worksheet.addRow(row));

    res.setHeader('Content-Disposition', `attachment; filename="attendance_log_${date}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('❌ download-excel error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Supabase server running on port ${PORT}`);
});



