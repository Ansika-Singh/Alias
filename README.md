# Alias ✨

### AI-Powered College Portal — Attendance, Academics & Administration in One Place

> Eliminate roll calls. Automate attendance. Empower every role. Manage your entire institution — seamlessly.

---

## 📌 Overview

**Alias** is an intelligent, all-in-one college portal powered by AI facial recognition and QR-based attendance tracking. Designed for modern educational institutions, Alias goes far beyond attendance — it unifies academic management, communication, fee tracking, examinations, and more under a single platform with dedicated role-based dashboards for **Students**, **Teachers**, **Principals**, and **Parents**.

No more 10-minute roll calls. No more proxy attendance. No more scattered systems.

---

## 🚨 The Problem

In a typical college today:

- 10–15 minutes per class are wasted on vocal roll calls
- For 6 periods a day → ~1 hour of teaching time lost daily
- Proxy attendance is rampant and hard to detect
- Teachers manually compile absentee reports — time-consuming and error-prone
- Parents have no real-time visibility into their child's attendance or academics
- Fee records, exam results, assignments, and announcements are scattered across different platforms
- Principals lack consolidated audit trails and institution-wide insights

**Alias solves all of this.**

---

## 👥 Role-Based Portals

Alias provides four dedicated portals — each tailored to the needs of its users.

---

### 🎓 Student Portal

- 📷 **Face / QR Attendance** — Auto-marked via facial recognition or QR scan at entry
- 📊 **Attendance Dashboard** — View period-wise, subject-wise, and cumulative attendance %
- 📚 **Assignments** — View, submit, and track assignments per subject
- 📝 **Exam Schedule & Results** — Access upcoming exams, hall tickets, and published results
- 💰 **Fee Portal** — View fee structure, due dates, payment history, and download receipts
- 📣 **Announcements** — Receive institution-wide and class-specific notices
- 📅 **Academic Calendar** — View holidays, exam dates, events, and important milestones
- 🏖️ **Leave Requests** — Submit leave applications and track approval status

---

### 👨‍🏫 Teacher Portal

- 📷 **Live Attendance View** — Real-time attendance for ongoing class (face/QR auto-marked)
- 📋 **Period-wise Reports** — Present/absent list per period; export as PDF/Excel
- 📚 **Assignment Management** — Create, assign, and grade student assignments
- 📝 **Exam Management** — Schedule exams, upload question papers, publish results
- 📣 **Announcements** — Post class or subject-specific announcements
- 🏖️ **Leave Management** — Review and approve/reject student leave requests
- 📅 **Timetable View** — View personal timetable with subject and room assignments
- 🔔 **Smart Alerts** — Notified if class attendance drops below threshold

---

### 🏫 Principal Portal

- 🏛️ **Institution-wide Dashboard** — Bird's-eye view of attendance across all departments and classes
- 🗂️ **Audit Trail** — Full logs of all system actions — attendance edits, approvals, logins
- 👩‍🏫 **Teacher Management** — Manage teacher profiles, assignments, and substitute handling
- 📊 **Advanced Reports** — Filter attendance/performance by date, class, subject, department
- 📝 **Exam Oversight** — Monitor all scheduled exams, results, and evaluation status
- 💰 **Fee Overview** — Track fee collection status institution-wide
- 📣 **Announcements** — Broadcast notices to all roles simultaneously
- 📅 **Academic Calendar Management** — Create and manage the institution's official academic calendar
- 🔒 **Access Control** — Manage user roles, permissions, and system access

---

### 👨‍👩‍👧 Parent Portal

- 📊 **Child's Attendance** — Real-time visibility into daily and period-wise attendance
- 🔔 **Instant Alerts** — Notified via SMS/email if child is absent or leaves early
- 📝 **Exam Results** — View published results and performance trends
- 💰 **Fee Status** — Check fee dues, payment history, and upcoming deadlines
- 📣 **Announcements** — Receive school-wide notices relevant to their child
- 🏖️ **Leave Tracking** — View and track leave applications submitted by student
- 📅 **Calendar** — View academic events, holidays, and exam schedules

---

## ✅ Core Technical Features

### 👤 Facial Recognition & Identification
- Real-time face detection using live camera feed
- Matches faces against pre-enrolled student/employee database
- Works with glasses, partial masks, and slight angle variations
- Multi-face detection — marks multiple students simultaneously

### 📱 QR-Based Attendance
- Students scan a dynamic QR code displayed by the teacher
- Time-limited QR codes prevent proxy scanning
- Works as a fallback when camera is unavailable

### 🗓️ Timetable-Aware Tracking
- System is fed the day's timetable at the start of each day
- Knows which period is running, which subject, and which teacher is responsible
- Attendance recorded per period, not just per day

### ⏱️ Time-in / Time-out Logging
- Tracks exact entry and exit times for each individual
- Records total duration spent in class
- Detects and logs mid-class exits

### 📊 Automated Reports
- Present/absent list per period, auto-generated
- Cumulative attendance % per student
- Period-skipping patterns detected and flagged
- Export as PDF or Excel

### 📨 Smart Notifications
- Email/SMS/portal alerts to subject teachers per period
- Parents notified on absence or early exit
- Admin receives full-day summary
- Late arrivals flagged automatically

### 🗂️ Audit Trail
- Immutable log of all system events
- Tracks attendance edits, manual overrides, login history, and approvals
- Filterable by date, user, and action type

### 🔒 Anti-Proxy & Security
- Liveness detection to prevent photo spoofing
- Flags unrecognized faces attempting entry
- All access attempts logged with timestamps

---

## 🚀 Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/Ansika-Singh/Alias.git

# 2. Install dependencies
cd Alias
npm install

# 3. Configure environment
cp .env.example .env
# Add your DB credentials, SMTP config, and camera settings

# 4. Register students via Admin Panel
# Upload photos + student details (bulk CSV supported)

# 5. Set up timetable
# Import via Excel/CSV or enter manually

# 6. Start the system
npm run dev
```

---

## 🗺️ Roadmap

- [x] Core facial recognition engine
- [x] QR-based attendance system
- [x] Student, Teacher, Principal, Parent role-based portals
- [x] Timetable-aware period tracking
- [x] Assignment & exam management
- [x] Fee portal
- [x] Announcements & academic calendar
- [x] Leave request system
- [x] Audit trail for principal
- [x] Parent notification system (SMS/email)
- [ ] Mobile app (React Native)
- [ ] ERP integration (SAP, Fedena)
- [ ] Offline mode with sync
- [ ] Multi-camera support for large campuses
- [ ] AI-based performance prediction per student

---

## 🛠️ Tech Stack

- **Frontend** — React.js / Next.js
- **Backend** — Node.js / Express
- **Database** — MongoDB
- **Face Recognition** — Python (OpenCV, DeepFace / face_recognition)
- **Authentication** — JWT + Role-based access control
- **Notifications** — Nodemailer / Twilio SMS
- **Reports** — PDFKit / ExcelJS

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add YourFeature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## 📄 License

MIT License © 2025 [Ansika Singh,Bishnu KumarSardar](https://github.com/Ansika-Singh)

---

> Built with ❤️ by **Pixel Pirates** — Cambridge Institute of Technology, Bengaluru
