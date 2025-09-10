# 📷 Attendly – Barcode Attendance System

**Attendly** is an open-source, mobile-friendly **barcode-based attendance system**. It allows scanning student barcodes using a mobile device or desktop, logs attendance data to **Supabase**, and provides an option to **download attendance logs in Excel format**.

---

## ✅ Features
- 📱 **Mobile Barcode Scanning** using camera
- 🌐 **Cross-platform** (Works on mobile & desktop browsers)
- ⚡ **Node.js + Express Backend**
- 🗄 **Supabase Database Integration**
- 📥 **Download Attendance Logs as Excel**
- 🔒 **Secure API Integration**
- 🏷 **Open Source under GPLv3**

---

## 🛠 Tech Stack
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js + Express
- **Database:** Supabase (PostgreSQL)
- **Excel Export:** ExcelJS
- **Deployment:**  
  - Frontend → Vercel  
  - Backend → Render  
  - Database → Supabase  

---

## 📂 Project Structure
```
Attendly/
│
├── public/
│   └── index.html        # Frontend scanner page
│
├── server.js             # Express backend for attendance logging
├── package.json          # Node.js dependencies
└── README.md             # Documentation
```

---

## 🚀 How to Run Locally

### 1️⃣ **Clone the Repository**
```bash
git clone https://github.com/shrijith218/attendly.git
cd attendly
```

### 2️⃣ **Install Dependencies**
```bash
npm install
```

### 3️⃣ **Set Up Supabase**
- Create a **Supabase Project** at [https://supabase.com](https://supabase.com)
- Add tables:
  - **students** → `admission_number (text)`, `name (text)`, `class_sec (text)`
  - **attendance_log** → `admission_number`, `name`, `class_sec`, `timestamp`
- Get your **Project URL** and **anon key** from Supabase dashboard.

### 4️⃣ **Configure Environment Variables**
Create a `.env` file in root:
```
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-anon-key
```

Update `server.js` to use `process.env` for credentials.

### 5️⃣ **Run Backend Server**
```bash
node server.js
```

It will run on **http://localhost:3001**.

---

## 🌍 Deployment
- **Frontend**: Deploy `public` folder on **Vercel**
- **Backend**: Deploy `server.js` on **Render**
- **Database**: Hosted on **Supabase**

---


## 🧾 API Endpoints
### **POST /scan**
Save attendance log
```json
{
  "barcode": "12345",
  "time": "2025-09-09 10:30:00"
}
```

### **GET /download-excel?date=YYYY-MM-DD**
Download attendance logs for a specific date in **Excel format**.

---

## ✅ License
This project is licensed under **GPLv3**.  
See the [LICENSE](https://www.gnu.org/licenses/gpl-3.0.en.html) file for details.

---

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📧 Contact
For queries or contributions, reach out at:  
📩 **shrijithsankaran@gmail.com**
