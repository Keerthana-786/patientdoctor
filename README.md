# 🛡️ QuantumShield Health — Full Stack Project

AI-Powered | Quantum-Resilient | Patient-Centric Healthcare Security Platform

---

## 📁 Project Structure

```
quantumshield/
├── backend/                  # Node.js + Express API
│   ├── server.js             # Main server entry point
│   ├── .env                  # Environment variables
│   ├── routes/
│   │   ├── auth.js           # Login / Register / JWT
│   │   ├── records.js        # Health record CRUD
│   │   ├── access.js         # AI risk engine + access control
│   │   └── audit.js          # Blockchain audit log
│   ├── middleware/
│   │   └── authMiddleware.js # JWT verification middleware
│   ├── models/
│   │   ├── User.js           # User schema (Mongoose)
│   │   ├── HealthRecord.js   # Health record schema
│   │   └── AuditLog.js       # Audit log schema
│   └── utils/
│       ├── riskEngine.js     # AI risk score calculation
│       └── blockchain.js     # Hash chaining blockchain util
├── frontend/                 # React app
│   ├── package.json
│   ├── public/index.html
│   └── src/
│       ├── index.js
│       ├── App.js
│       ├── context/
│       │   └── AuthContext.js
│       ├── utils/
│       │   └── api.js        # Axios API calls
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── PatientDashboard.jsx
│       │   ├── StaffDashboard.jsx
│       │   └── AdminDashboard.jsx
│       └── components/
│           ├── Navbar.jsx
│           ├── RiskModal.jsx
│           ├── AuditTable.jsx
│           ├── EmergencyOverride.jsx
│           └── PrivacyToggle.jsx
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas free tier)
- npm or yarn

---

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/quantumshield
JWT_SECRET=quantumshield_super_secret_key_2025
JWT_EXPIRES_IN=8h
```

Seed the database with demo users:
```bash
node seed.js
```

Start the backend:
```bash
npm run dev
```

Backend runs at: `http://localhost:5000`

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

---

## 👥 Demo Users (after seeding)

| Role    | Username         | Password   |
|---------|-----------------|------------|
| Patient | john.patient    | demo1234   |
| Nurse   | priya.nurse     | demo1234   |
| Doctor  | raj.doctor      | demo1234   |
| Admin   | admin.secure    | demo1234   |

---

## 🔐 Features

### Real JWT Authentication
- Login returns a signed JWT token
- All API routes protected by `authMiddleware`
- Token stored in localStorage, sent in Authorization header

### Real AI Risk Engine
- Calculates risk score (0–100) from: role clearance, time of access, device fingerprint, data sensitivity, behavior pattern
- Score < 50 → Access Granted
- Score 50–74 → Step-Up Authentication Required
- Score ≥ 75 → Access Denied

### Real Blockchain Audit Log
- Every access attempt creates a log entry
- Each entry hashed with SHA-256 including previous hash (like blockchain)
- Tamper-evident: changing any log breaks the hash chain

### Real Database
- MongoDB stores users, health records, audit logs
- Passwords hashed with bcrypt
- Records tagged with sensitivity levels

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Axios, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Risk AI | Custom weighted scoring engine |
| Blockchain | SHA-256 hash chaining |
| Styling | Inline CSS (dark futuristic theme) |
