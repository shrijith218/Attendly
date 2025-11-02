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

// Helper: Euclidean distance between two vectors
function euclideanDistance(arr1, arr2) {
  if (!arr1 || !arr2 || arr1.length !== arr2.length) return Number.MAX_VALUE;
  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    sum += Math.pow(arr1[i] - arr2[i], 2);
  }
  return Math.sqrt(sum);
}

// POST /scan: Save attendance with optional faceDescriptor verification
app.post('/scan', async (req, res) => {
  try {
    const { barcode, admissionNumber, faceDescriptor, time } = req.body;
    const admission = (barcode || admissionNumber || '').toString().trim();
    const timestamp = (time || new Date().toISOString()).toString();

    if (!admission) {
      return res.status(400).json({ error: 'Missing admission number (barcode or admissionNumber)' });
    }

    // Fetch student record including face descriptor column
    const { data: student, error: fetchError } = await supabase
      .from('students')
      .select('*, face_descriptor') // face_descriptor stored as array/json
      .eq('admission_number', admission)
      .single();

    if (fetchError || !student) {
      console.log('❌ Student fetch error:', fetchError);
      return res.status(404).json({ error: 'Student not found' });
    }

    // Verify face descriptor if sent and stored
    if (faceDescriptor && Array.isArray(faceDescriptor) && student.face_descriptor) {
      const distance = euclideanDistance(faceDescriptor, student.face_descriptor);
      const threshold = 0.5; // Tune this threshold as needed
      if (distance > threshold) {
        return res.status(403).json({ error: 'Face does not match student record' });
      }
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

// GET /download-excel?date=YYYY-MM-DD: Export attendance logs for the day
app.get('/download-excel', async (req, res) => {
  try {
    const date = req.query.date;
    if (!date) return res.status(400).json({ error: 'Missing ?date=YYYY-MM-DD' });

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

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Log ${date}`);

    worksheet.columns = [
      { header: 'Admission Number', key: 'admission_number', width: 20 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Class/Section', key: 'class_sec', width: 18 },
      { header: 'Timestamp', key: 'timestamp', width: 28 },
    ];

    if (Array.isArray(data)) {
      data.forEach(row => worksheet.addRow(row));
    }

    res.setHeader('Content-Disposition', `attachment; filename="attendance_log_${date}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('❌ download-excel error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Supabase server running on port ${PORT}`);
});

