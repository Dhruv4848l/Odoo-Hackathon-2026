# 🌿 EcoSphere — Unified ESG Management Platform

<div align="center">

**A full-stack enterprise platform for tracking, scoring, and improving Environmental, Social & Governance (ESG) performance across an entire organization.**

Built with **React 19 · Node.js · Express · MongoDB Atlas · Tailwind CSS 4**

[![Live Demo - Vercel](https://img.shields.io/badge/Live_Demo-Vercel-00C16A?style=for-the-badge&logo=vercel)](https://odoo-hackathon-2026-adrv.vercel.app/)
[![API Status - Render](https://img.shields.io/badge/Live_API-Render-46E3B7?style=for-the-badge)](https://odoo-hackathon-2026-olkv.onrender.com/api/health)

[🌐 Live Application](https://odoo-hackathon-2026-adrv.vercel.app/) · [Getting Started](#-getting-started) · [Features](#-features) · [Architecture](#-architecture) · [API Reference](#-api-reference) · [Tech Stack](#-tech-stack)

</div>

---

## 🌐 Live Demo & Instant Access

Experience the production deployment of EcoSphere directly in your browser:

- **Live Application URL (Vercel):** [https://odoo-hackathon-2026-adrv.vercel.app/](https://odoo-hackathon-2026-adrv.vercel.app/)
- **Live Backend API URL (Render):** [https://odoo-hackathon-2026-olkv.onrender.com/api](https://odoo-hackathon-2026-olkv.onrender.com/api)

### Quick Login Credentials
You can log in and test all platform features immediately using the following administrator credentials:

| Role | Email Address | Password |
|------|---------------|----------|
| **Admin** | `admin@gmail.com` | `admin@gmail.com` |

---

## 📖 About the Project

**EcoSphere** is a unified ESG management platform designed for the **Odoo Hackathon 2026**. It enables organizations to:

- **Track carbon emissions** across departments using configurable emission factors
- **Manage CSR activities** with employee participation, evidence-based approval workflows
- **Enforce governance compliance** through policy acknowledgements, audit trails, and Kanban issue tracking
- **Gamify sustainability** with challenges, badges, XP, leaderboards, and redeemable rewards
- **Generate real-time ESG scores** using a weighted scoring engine across three pillars (E, S, G)
- **Configure everything** through an admin panel — scoring weights, automation rules, departments, categories

The platform serves **three user roles**: `Admin`, `Manager`, and `Employee` — each with tailored access and dashboards.

---

## ✨ Features

### 🟢 Environmental Module
| Feature | Description |
|---------|-------------|
| **Emission Factor Library** | Configurable CO₂ conversion factors (grid electricity, natural gas, diesel, etc.) with scope classification |
| **Carbon Transaction Logging** | Employees log energy consumption, fleet fuel, and manufacturing usage — system auto-calculates carbon footprint |
| **Environmental Goals** | Department-level emission reduction targets with real-time progress tracking |
| **Product ESG Profiles** | Track carbon footprint, social score, and governance score per product/SKU |

### 🔵 Social & CSR Module
| Feature | Description |
|---------|-------------|
| **CSR Activity Management** | Create activities (Tree Plantation, Blood Donation, Beach Cleanup, etc.) with dates, locations, and XP/point rewards |
| **Employee Participation** | Employees join activities; system tracks joined count, evidence uploads, and approval status |
| **Approval Queue** | Managers/Admins review participation proof and approve or reject with one click |
| **Employee Participation Tracker** | Full history of all participation records with filtering and status tracking |
| **Diversity Dashboard** | Social analytics and diversity metrics visualization |

### 🏆 Gamification Engine
| Feature | Description |
|---------|-------------|
| **Challenges** | Time-bound challenges with targets, progress tracking, and XP rewards |
| **Badge Gallery** | Achievement badges earned by completing challenges and hitting XP thresholds |
| **Rewards Catalog** | Redeemable rewards marketplace — employees spend earned points on real rewards |
| **Leaderboard** | Organization-wide ranking by XP and points — drives healthy competition |

### 🟠 Governance Module
| Feature | Description |
|---------|-------------|
| **ESG Policy Management** | Create and publish compliance policies with version tracking |
| **Acknowledgement Tracker** | Track which employees have read and accepted each policy — audit-ready |
| **Compliance Kanban Board** | Drag-and-drop issue tracking through stages (Open → In Progress → Resolved → Closed) with evidence attachments |
| **Audit Manager** | Dashboard for managing and tracking internal ESG audits |

### 📊 Reports & Analytics
| Feature | Description |
|---------|-------------|
| **Fixed Reports** | Pre-built analytics — ESG trends, department comparisons, pillar breakdowns |
| **Custom Report Builder** | Build ad-hoc reports by selecting metrics, filters, and chart types |
| **Org Dashboard** | Executive-level ESG scorecard with department-wise breakdown |

### ⚙️ Administration
| Feature | Description |
|---------|-------------|
| **ESG Scoring Weights** | Adjustable pillar weights (Environmental / Social / Governance) with live balance validation |
| **Automation Toggles** | Toggle evidence requirements, auto-emission calculation, badge auto-awarding, and more |
| **Department Management** | Full CRUD for organizational departments with head assignment and employee counts |
| **Category Management** | Manage emission categories, social categories, and governance categories |
| **Notification Settings** | Configure platform and email notification dispatch rules |

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|-------------|---------|
| **Node.js** | v18+ (LTS recommended) |
| **npm** | v9+ (comes with Node.js) |
| **MongoDB Atlas** | Free tier cluster (M0) works perfectly |

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Dhruv4848l/Odoo-Hackathon-2026.git
cd Odoo-Hackathon-2026
```

### Step 2 — Configure Environment Variables

Create a `.env` file in the **project root** by copying the example:

```bash
cp .env.example .env
```

Open `.env` and fill in your MongoDB Atlas credentials:

```env
PORT=5000
NODE_ENV=development

# Replace <username> and <password> with your MongoDB Atlas credentials
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ecosphere-dev?retryWrites=true&w=majority

JWT_SECRET=supersecretjwtkeyforhackathon12345
JWT_EXPIRE=24h

CLIENT_URL=http://localhost:5173
```

> **💡 Tip:** If multiple developers are working locally, append a unique suffix to the database name to avoid data collisions:
> `ecosphere-dev-a`, `ecosphere-dev-b`, `ecosphere-dev-c`, `ecosphere-dev-d`

### Step 3 — Install Dependencies & Seed Database (Backend)

```bash
cd backend
npm install
```

Seed the database with sample data (departments, categories, emission factors, users, CSR activities, employee participations):

```bash
npm run seed
```

This creates:
- **5 Departments** — HR, IT, Manufacturing, Fleet & Logistics, Corporate HQ
- **9 Categories** — Emission categories (Electricity, Fleet, Manufacturing, Travel), Social, Governance
- **6 Emission Factors** — Grid Electricity (UK/IN), Natural Gas, Diesel, Business Travel, Refrigerant
- **1 Admin User** — `admin@gmail.com` / `admin123`
- **5 Employee Users** — Aditi Rao, Karan Shah, Priya Nair, Rohan Mehta, Neelam Verma
- **4 CSR Activities** — Tree Plantation, Blood Donation, ESG Workshop, Beach Cleanup
- **5 Employee Participations** — Pre-seeded approval queue records (Pending + Approved)
- **4 Badges, 4 Rewards, 3 Challenges**
- **3 ESG Policies, 3 Product ESG Profiles**
- **5 Carbon Transactions, 3 Environmental Goals**

### Step 4 — Start the Backend Server

```bash
npm run dev
```

The Express API server starts on **http://localhost:5000** with hot-reloading via Nodemon.

### Step 5 — Install & Start the Frontend (New Terminal)

```bash
cd frontend
npm install
npm run dev
```

The Vite React dev server starts on **http://localhost:5173**.

### Step 6 — Open the Application

Navigate to **http://localhost:5173** in your browser.

**Login credentials:**

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@gmail.com` | `admin123` |
| Employee | `aditi.rao@ecosphere.com` | `employee123` |
| Employee | `karan.shah@ecosphere.com` | `employee123` |

---

## 🏗️ Architecture

### High-Level Overview

```
┌──────────────────────────────────────────────────────────┐
│                      FRONTEND                            │
│  React 19 + Redux Toolkit + Tailwind CSS 4 + Vite 8     │
│                                                          │
│  ┌────────────┐ ┌──────────────┐ ┌───────────────────┐   │
│  │  Auth      │ │  Dashboard   │ │  Environmental    │   │
│  │  (Login)   │ │  (Org ESG)   │ │  (Carbon/Goals)   │   │
│  └────────────┘ └──────────────┘ └───────────────────┘   │
│  ┌────────────┐ ┌──────────────┐ ┌───────────────────┐   │
│  │  Social    │ │  Gamification│ │  Governance       │   │
│  │  (CSR)     │ │  (XP/Badges) │ │  (Compliance)     │   │
│  └────────────┘ └──────────────┘ └───────────────────┘   │
│  ┌────────────┐ ┌──────────────┐                         │
│  │  Reports   │ │  Settings    │                         │
│  │  (Charts)  │ │  (Admin)     │                         │
│  └────────────┘ └──────────────┘                         │
└──────────────────┬───────────────────────────────────────┘
                   │ Axios HTTP + Socket.io
┌──────────────────▼───────────────────────────────────────┐
│                      BACKEND                             │
│  Node.js + Express.js + Mongoose + JWT Auth              │
│                                                          │
│  ┌────────────┐ ┌──────────────┐ ┌───────────────────┐   │
│  │  Routes    │ │ Controllers  │ │  Services          │   │
│  │  (22 files)│ │ (Business)   │ │  (Scoring Engine)  │   │
│  └────────────┘ └──────────────┘ └───────────────────┘   │
│  ┌────────────┐ ┌──────────────┐ ┌───────────────────┐   │
│  │  Models    │ │ Middleware   │ │  Seed Scripts      │   │
│  │  (21 schemas)│ (Auth/Upload)│ │  (Sample Data)     │   │
│  └────────────┘ └──────────────┘ └───────────────────┘   │
└──────────────────┬───────────────────────────────────────┘
                   │ Mongoose ODM
┌──────────────────▼───────────────────────────────────────┐
│                   MongoDB Atlas                          │
│  Cloud-hosted NoSQL database (Free M0 tier)              │
└──────────────────────────────────────────────────────────┘
```

### Project Structure

```
Odoo-Hackathon-2026/
│
├── .env.example                    # Environment variable template
├── README.md                       # This file
├── AI_CONTEXT.md                   # Dev role assignments & module mapping
│
├── backend/
│   ├── server.js                   # Express app entry point
│   ├── package.json                # Backend dependencies
│   ├── seed/
│   │   └── seed.js                 # Database seeding script
│   └── src/
│       ├── config/
│       │   └── db.js               # MongoDB connection setup
│       ├── middleware/
│       │   ├── auth.js             # JWT authentication guard
│       │   └── upload.js           # Multer file upload config
│       ├── models/                 # 21 Mongoose schemas
│       │   ├── User.js             # User accounts & roles
│       │   ├── Department.js       # Organizational units
│       │   ├── Category.js         # Emission/Social/Gov categories
│       │   ├── EmissionFactor.js   # CO₂ conversion factors
│       │   ├── CarbonTransaction.js# Carbon footprint entries
│       │   ├── EnvironmentalGoal.js# Department reduction targets
│       │   ├── ProductESGProfile.js# Product-level ESG scores
│       │   ├── CSRActivity.js      # Social/CSR activities
│       │   ├── EmployeeParticipation.js # Activity participation records
│       │   ├── Challenge.js        # Gamification challenges
│       │   ├── ChallengeParticipation.js # Challenge participation
│       │   ├── Badge.js            # Achievement badges
│       │   ├── Reward.js           # Redeemable rewards
│       │   ├── RewardRedemption.js # Redemption history
│       │   ├── ESGPolicy.js        # Compliance policies
│       │   ├── PolicyAcknowledgement.js # Policy sign-offs
│       │   ├── ComplianceIssue.js  # Compliance issue tracker
│       │   ├── Audit.js            # Audit records
│       │   ├── DepartmentScore.js  # Calculated ESG scores
│       │   ├── Settings.js         # Platform configuration
│       │   └── Notification.js     # In-app notifications
│       ├── controllers/            # Business logic handlers
│       ├── routes/                 # 22 Express route files
│       ├── services/               # Scoring engine & calculators
│       ├── sockets/                # Socket.io real-time events
│       └── jobs/                   # Node-cron scheduled tasks
│
└── frontend/
    ├── index.html                  # Vite HTML entry
    ├── package.json                # Frontend dependencies
    ├── vite.config.js              # Vite build configuration
    └── src/
        ├── main.jsx                # React app bootstrap
        ├── index.css               # Tailwind CSS + design tokens
        ├── api/
        │   └── axiosClient.js      # Axios HTTP client with interceptors
        ├── store/                  # Redux Toolkit state management
        │   ├── store.js            # Redux store configuration
        │   ├── authSlice.js        # Authentication state
        │   ├── socialSlice.js      # Social/CSR state
        │   └── scoringSlice.js     # ESG scoring state
        ├── routes/
        │   └── AppRoutes.jsx       # Route definitions & guards
        ├── components/
        │   └── layout/
        │       ├── AppLayout.jsx   # Main layout wrapper
        │       ├── Sidebar.jsx     # Green navigation sidebar
        │       └── Topbar.jsx      # Top header bar
        └── features/               # Feature modules (pages)
            ├── auth/
            │   └── LoginPage.jsx
            ├── dashboard/
            │   └── MainDashboard.jsx
            ├── environmental/
            │   ├── EnvironmentalDashboard.jsx
            │   ├── CarbonEntryForm.jsx
            │   ├── CarbonTransactionBoard.jsx
            │   ├── EmissionFactorConfig.jsx
            │   ├── EnvironmentalGoalBoard.jsx
            │   └── ProductESGProfileBoard.jsx
            ├── social/
            │   ├── CSRActivityList.jsx
            │   ├── ApprovalQueue.jsx
            │   ├── EmployeeParticipationTracker.jsx
            │   ├── DiversityDashboard.jsx
            │   ├── ChallengeBoard.jsx
            │   ├── ChallengeParticipationBoard.jsx
            │   ├── BadgeGallery.jsx
            │   ├── RewardCatalog.jsx
            │   └── Leaderboard.jsx
            ├── governance/
            │   ├── PolicyList.jsx
            │   ├── AcknowledgementTracker.jsx
            │   ├── ComplianceKanban.jsx
            │   └── AuditManager.jsx
            ├── reports/
            │   ├── OrgDashboard.jsx
            │   ├── FixedReports.jsx
            │   └── CustomReportBuilder.jsx
            └── admin/
                ├── SettingsScreen.jsx
                └── DepartmentCategoryManager.jsx
```

---

## 🔌 API Reference

All API endpoints are prefixed with `http://localhost:5000/api`.

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT token |

### Environmental
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/emission-factors` | List all emission factors |
| `POST` | `/api/emission-factors` | Create emission factor |
| `PUT` | `/api/emission-factors/:id` | Update emission factor |
| `DELETE` | `/api/emission-factors/:id` | Delete emission factor |
| `GET` | `/api/carbon-transactions` | List carbon transactions |
| `POST` | `/api/carbon-transactions` | Log a new transaction |
| `GET` | `/api/environmental-goals` | List environmental goals |
| `POST` | `/api/environmental-goals` | Create a goal |
| `GET` | `/api/product-esg-profiles` | List product ESG profiles |
| `POST` | `/api/product-esg-profiles` | Create product profile |

### Social & CSR
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/csr-activities` | List all CSR activities |
| `POST` | `/api/csr-activities` | Create a CSR activity |
| `POST` | `/api/csr-activities/:id/signup` | Employee signs up for activity |
| `GET` | `/api/participations` | List employee participations |
| `PUT` | `/api/participations/:id/approve` | Approve/reject participation |

### Gamification
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/challenges` | List challenges |
| `POST` | `/api/challenges` | Create a challenge |
| `POST` | `/api/challenges/:id/join` | Join a challenge |
| `GET` | `/api/badges` | List all badges |
| `GET` | `/api/rewards` | List rewards catalog |
| `GET` | `/api/leaderboard` | Get leaderboard rankings |

### Governance
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/policies` | List ESG policies |
| `POST` | `/api/policies` | Create a policy |
| `GET` | `/api/acknowledgements` | List policy acknowledgements |
| `POST` | `/api/acknowledgements` | Acknowledge a policy |
| `GET` | `/api/compliance-issues` | List compliance issues |
| `POST` | `/api/compliance-issues` | Create compliance issue |
| `PUT` | `/api/compliance-issues/:id` | Update issue status |
| `GET` | `/api/audits` | List audits |
| `POST` | `/api/audits` | Create an audit |

### Administration
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/departments` | List departments |
| `POST` | `/api/departments` | Create department |
| `PUT` | `/api/departments/:id` | Update department |
| `DELETE` | `/api/departments/:id` | Delete department |
| `GET` | `/api/categories` | List categories |
| `POST` | `/api/categories` | Create category |
| `PUT` | `/api/categories/:id` | Update category |
| `DELETE` | `/api/categories/:id` | Delete category |
| `GET` | `/api/settings` | Get platform settings |
| `PUT` | `/api/settings` | Update platform settings |
| `GET` | `/api/scores/dashboard` | Get org-level ESG scores |

---

## 🛡️ Authentication & Authorization

The platform uses **JWT (JSON Web Token)** authentication:

1. User logs in via `/api/auth/login` → receives a JWT token
2. Token is stored in the browser (Redux state + localStorage)
3. Every subsequent API request includes the token in the `Authorization: Bearer <token>` header
4. Backend middleware (`auth.js`) validates the token and attaches `req.user`
5. Role-based access control restricts routes:
   - **Admin** — Full access to all modules + Settings + Admin Console
   - **Manager** — Access to all modules except Settings
   - **Employee** — Limited to participation, joining activities, and viewing dashboards

---

## 🎨 Design System

The UI follows a custom **"Canopy Green"** design system built with Tailwind CSS 4:

| Token | Value | Usage |
|-------|-------|-------|
| `brand-primary` | `#1F5C4D` | Buttons, sidebar, active states |
| `brand-light` | `#E8F5E9` | Success backgrounds |
| `neutral-text` | `#1A2E26` | Primary text color |
| `neutral-bg` | `#F4F1EC` | Page background |
| `neutral-surface` | `#FFFFFF` | Card backgrounds |
| `module-environmental` | `#2E7D32` | Environmental module accent |
| `module-social` | `#1565C0` | Social module accent |
| `module-governance` | `#E65100` | Governance module accent |

**Typography:** Inter (body) + Outfit (headings) from Google Fonts

---

## 🧮 ESG Scoring Engine

The platform computes ESG scores using a **weighted scoring engine**:

```
Overall ESG Score = (E × wₑ) + (S × wₛ) + (G × w_g)

Where:
  E = Environmental Score (based on carbon transactions vs. goals)
  S = Social Score (based on CSR participation & diversity metrics)
  G = Governance Score (based on compliance issue resolution & policy acknowledgements)
  wₑ, wₛ, w_g = Admin-configurable weights (default: 40%, 30%, 30%)
```

Scores are recalculated:
- On every new carbon transaction
- On CSR activity participation approval
- On compliance issue status change
- On demand via the admin dashboard

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2 | UI component library |
| Vite | 8.1 | Build tool & dev server |
| Tailwind CSS | 4.3 | Utility-first CSS framework |
| Redux Toolkit | 2.12 | State management |
| React Router | 7.18 | Client-side routing |
| Recharts | 3.9 | Data visualization charts |
| Axios | 1.18 | HTTP client |
| Lucide React | 1.24 | Icon library |
| Socket.io Client | 4.8 | Real-time WebSocket events |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18+ | JavaScript runtime |
| Express | 4.19 | Web framework |
| Mongoose | 8.3 | MongoDB ODM |
| JWT (jsonwebtoken) | 9.0 | Authentication tokens |
| bcryptjs | 2.4 | Password hashing |
| Multer | 1.4 | File upload handling |
| Socket.io | 4.7 | Real-time WebSocket server |
| Node-cron | 3.0 | Scheduled background jobs |
| ExcelJS | 4.4 | Excel report generation |
| Puppeteer | 22.6 | PDF report generation |

### Database
| Technology | Purpose |
|-----------|---------|
| MongoDB Atlas | Cloud-hosted NoSQL database |

---

## 📋 Available Scripts

### Backend (`/backend`)
```bash
npm run dev      # Start server with hot-reload (nodemon)
npm start        # Start server (production)
npm run seed     # Seed database with sample data
```

### Frontend (`/frontend`)
```bash
npm run dev      # Start Vite dev server (localhost:5173)
npm run build    # Build production bundle
npm run preview  # Preview production build locally
npm run lint     # Run OXLint code linter
```

---

## 🤝 Team

Built by **Team EcoSphere** for the **Odoo Hackathon 2026**.

| Dev | Modules Owned |
|-----|---------------|
| **Dev A** | Environmental Module, Department/Category Admin, Emission Factors, Carbon Transactions |
| **Dev B** | Social & CSR, Gamification (Challenges, Badges, Rewards, Leaderboard) |
| **Dev C** | Governance (Policies, Compliance Kanban, Audits, Acknowledgement Tracker) |
| **Dev D** | Org Dashboard, Reports & Analytics, Settings & Administration, Scoring Engine |

---

## 📄 License

This project was built as part of the **Odoo Hackathon 2026** and is intended for demonstration and educational purposes.
