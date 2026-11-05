# Online Legal Consultation & Lawyer Aggregation Platform
> **Unified Mentor Capstone Project**  
> A full-stack, enterprise-grade digital platform connecting clients with Bar Council-verified advocates for on-demand legal consultations via Audio, Video, and Real-time Chat.

---

## 🏛️ Platform Highlights

* **Verified Lawyer Discovery:** Multi-parameter search across 10+ legal domains (Civil, Criminal, Family, Corporate, Property, Cyber, Tax, Labour, Constitutional, and Intellectual Property).
* **Automated Calendar & Conflict Detection:** Prevents double-booking and validates appointment slots against advocates' recurring weekly schedules.
* **Multi-Mode Virtual Consultation Room:** In-room Video/Audio simulation, call timers, real-time messaging, and case brief attachments.
* **Practice Management for Advocates:** Request queue with 1-click **Accept** and **Reject**, recurring weekly availability scheduler, consultation note drafting, and an earnings dashboard.
* **Client Portal:** History of scheduled, active, and completed consultations, with 1–5 star reviews and testimonials.
* **Super Admin Governance:** Executive KPI metrics (booking rates, avg duration, user satisfaction, platform volume), lawyer verification desk with Bar certificate review, user management, and legal domain CRUD.
* **1-Click Demo Account Switcher:** Built-in switcher in the top navigation to test **Client**, **Lawyer**, and **Admin** experiences with a single click.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express 5, TypeScript, ES Modules |
| **Database & ORM** | PostgreSQL, Prisma ORM 7 with `@prisma/adapter-pg` |
| **Security & Auth** | JSON Web Tokens (JWT), BCrypt password hashing, Helmet.js, CORS |
| **File Storage** | Multer disk storage for legal certificates & case documents |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
* **Node.js** v18+ (tested on Node v24)
* **PostgreSQL** running locally on port `5432` with database `legal_consultation`

### 2. Backend Setup
```bash
cd backend
npm install
npm run build
npm run seed       # Seeds 10 domains, admin, verified lawyers, availability, sample consults
npm run dev        # Starts backend on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev        # Starts frontend on http://localhost:3000
```

Open `http://localhost:3000` in your web browser.

---

## 🔑 Pre-Seeded Demo Accounts (1-Click Login)

You can click the **"Demo Switcher"** button in the header or use these credentials:

| Role | Email | Password | Details |
|---|---|---|---|
| **Super Admin** | `admin@legalplatform.com` | `Admin@123` | Full access to KPI analytics, verification desk, and user management |
| **Legal Advocate** | `rajesh.sharma@lawyer.com` | `Password@123` | Adv. Rajesh Sharma (Criminal & Constitutional Law, 12 yrs exp) |
| **Legal Advocate** | `priya.nair@lawyer.com` | `Password@123` | Adv. Priya Nair (Family & Civil Law, 8 yrs exp) |
| **Client** | `client@example.com` | `Password@123` | Rahul Verma (Active bookings & consultation history) |
| **Client** | `ananya@example.com` | `Password@123` | Ananya Gupta (Upcoming consultation with Adv. Amitav) |

---

## 📁 Repository Structure

```
online-legal-consultation-platform/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # 9 PostgreSQL data models & enums
│   │   ├── seed.ts              # Comprehensive database seed script
│   │   └── migrations/          # 10 Prisma migration snapshots
│   ├── src/
│   │   ├── controllers/         # Admin, Appt, Auth, Availability, Consultation, Doc, Lawyer, Domain, Review
│   │   ├── middleware/          # JWT authentication and Role authorization
│   │   ├── routes/              # Modular Express routers
│   │   ├── utils/               # Prisma database client singleton
│   │   ├── app.ts               # Express configuration & static storage
│   │   └── server.ts            # Application entrypoint
│   └── uploads/                 # Storage for verification & case files
├── frontend/
│   ├── src/
│   │   ├── components/          # Navbar, Footer, LawyerCard, Modals (Profile, Room, Review, Auth, Apply)
│   │   ├── context/             # AuthContext with 1-click demo switcher
│   │   ├── pages/               # HomePage, MyAppointmentsPage, LawyerDashboardPage, AdminDashboardPage
│   │   ├── services/            # Centralized API service
│   │   ├── types/               # TypeScript interfaces
│   │   ├── App.tsx              # Application layout & modal orchestration
│   │   └── main.tsx             # React DOM root
│   └── package.json             # React 19 + Tailwind + Vite
├── docs/
│   ├── PRD.md                   # Full Product Requirements Document
│   ├── TECHNICAL_DOCUMENTATION.md # Architecture, security, APIs, algorithms
│   └── DATABASE_SCHEMA.md       # Tables, data types, indexes, and constraints
├── database/
│   └── README.md                # Database setup instructions
└── package.json                 # Monorepo management scripts
```

---

## 📊 Key Performance Indicators (KPIs)

The Admin Console calculates live platform metrics:
1. **Total Registered Users** (`COUNT(User)`)
2. **Verified Legal Advocates** (`COUNT(Lawyer WHERE verificationStatus = 'APPROVED')`)
3. **Consultation Booking Rate** (`Total Appointments / Total Clients`)
4. **Average Consultation Duration** (`AVG(Consultation.duration WHERE status = 'COMPLETED')`)
5. **User Satisfaction Score** (`AVG(Review.rating)`)
6. **Cumulative Platform Fee Volume** (`SUM(consultationFee for COMPLETED appointments)`)

---

## 📜 Compliance Disclaimer
In adherence to the **Bar Council of India Rules**, this platform serves strictly as an informational aggregator and consultation scheduling technology intermediary. It does not solicit, advertise, or represent an attorney-client retainer agreement prior to direct consultation execution.
