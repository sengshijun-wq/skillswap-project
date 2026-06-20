# SkillSwap — Setup Guide (Windows / VS Code)

## Install first
1. **Node.js 18+** → https://nodejs.org (LTS)
2. **MySQL 8.0** → https://dev.mysql.com/downloads/mysql/ (or XAMPP)

---

## Step 1 — Import database (once)
PowerShell, inside `skillswap` folder:
```powershell
Get-Content database.sql | mysql -u root -p
```

## Step 2 — Configure backend
```powershell
cd backend
copy .env.example .env
```
Open `.env`, change:
```
DB_PASSWORD=your_mysql_password_here   ← put your real MySQL password
```

## Step 3 — Start backend (Terminal 1)
```powershell
npm install
npm run dev
```
Check: http://localhost:5000/api/health → `"database":"Connected"`

## Step 4 — Start frontend (Terminal 2)
```powershell
cd frontend
npm install
npm start
```
Opens at http://localhost:3000

---

## Demo accounts (password123, admin: admin123)
| Email | Role |
|---|---|
| ahmad@apu.edu.my | Learner |
| sarah@apu.edu.my | Tutor |
| admin@apu.edu.my | Admin |

---

## Functional Requirements Mapping
| FR | Page | Description |
|---|---|---|
| FR-01 | Register | Create account with name, email, password |
| FR-02 | Login | JWT-based authentication |
| FR-03 | Profile | Skill profile: teach/learn subjects + proficiency |
| FR-04 | Find Match | Weighted algorithm — score out of 100 |
| FR-05 | Find Match | Display top 5 ranked tutors |
| FR-06 | Messages | In-platform chat for matched pairs |
| FR-07 | Profile | Weekly availability grid |
| FR-08 | Profile | Edit profile, skills, availability anytime |
| FR-09 | History | View all match relationships, accept/decline/complete |
| FR-10 | Admin | Dashboard — stats, user management |

## Troubleshooting
| Problem | Fix |
|---|---|
| Register: "Server error" | Fix DB_PASSWORD in backend/.env |
| health shows database FAILED | MySQL not running or wrong password |
| '<' operator error in PowerShell | Use `Get-Content database.sql \| mysql -u root -p` |
