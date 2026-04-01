# 🏦 NexBank — Automated Banking System

A full-stack banking application built with Node.js, Express, SQLite, and vanilla HTML/CSS/JS with a dark theme.

---

## 📁 Folder Structure

```
banking-system/
├── server.js              ← Main Express server
├── package.json           ← Project config & dependencies
├── db/
│   └── database.js        ← SQLite database setup
├── routes/
│   ├── auth.js            ← Login & Signup APIs
│   └── banking.js         ← Deposit, Withdraw, Transfer APIs
└── public/
    ├── index.html         ← Single-page frontend
    ├── css/
    │   └── style.css      ← Dark theme styles
    └── js/
        └── app.js         ← Frontend JavaScript logic
```

---

## 🚀 How to Run

### Step 1: Install Node.js
Download and install Node.js from https://nodejs.org (v16 or newer)

### Step 2: Install Dependencies
Open terminal in the `banking-system` folder and run:
```bash
npm install
```

### Step 3: Start the Server
```bash
npm start
```

### Step 4: Open in Browser
Go to: **http://localhost:3000**

---

## 🔧 Tech Stack

| Layer    | Technology           |
|----------|----------------------|
| Frontend | HTML5, CSS3, JavaScript |
| Backend  | Node.js + Express    |
| Database | SQLite (better-sqlite3) |
| Auth     | JWT + bcrypt         |

---

## 💡 Features

- ✅ User Registration & Login with encrypted passwords
- ✅ JWT-based session authentication
- ✅ Initial balance = ₹0 → shows deposit-only screen
- ✅ Full Dashboard: Deposit, Withdraw, Transfer, Balance, History
- ✅ Transfer by email address
- ✅ Transaction history table (last 20 records)
- ✅ Insufficient balance protection
- ✅ Dark mode UI (black + dark blue + cyan)
- ✅ Responsive design

---

## 📦 Dependencies

```json
{
  "express": "^4.18.2",
  "better-sqlite3": "^9.4.3",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2"
}
```

---

## 🌐 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |

### Banking (requires Bearer token)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/bank/profile` | Get user profile & balance |
| POST | `/api/bank/deposit` | Deposit money |
| POST | `/api/bank/withdraw` | Withdraw money |
| POST | `/api/bank/transfer` | Transfer to another user |
| GET | `/api/bank/transactions` | Get last 20 transactions |

---

*Built for college project — NexBank Automated Banking System*
