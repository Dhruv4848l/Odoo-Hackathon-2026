# 🌿 EcoSphere — ESG Management Platform

EcoSphere is a collaborative ESG (Environmental, Social, and Governance) management platform built for the MERN (React, Express, Node) stack with MongoDB Atlas.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+ or latest LTS installed)
- **MongoDB Atlas Account** (Free tier cluster works perfectly)

### 2. Environment Setup
At the root of the project, copy the environment template to create your local `.env` files.

#### Root / Backend Configuration
1. Create a `.env` file in the **root** folder:
   ```bash
   cp .env.example .env
   ```
2. Open the newly created `.env` file and replace `<username>`, `<password>` with your MongoDB Atlas database user credentials.
3. **CRITICAL: Database Name Custom Suffix**
   To avoid overwriting each other's test data during local development, update the database name in the `MONGODB_URI` string to include your dev role identifier:
   - **Dev A:** `...mongodb.net/ecosphere-dev-a?retryWrites=true...`
   - **Dev B:** `...mongodb.net/ecosphere-dev-b?retryWrites=true...`
   - **Dev C:** `...mongodb.net/ecosphere-dev-c?retryWrites=true...`
   - **Dev D:** `...mongodb.net/ecosphere-dev-d?retryWrites=true...`
   - **Integration / Demo (Pre-presentation):** `...mongodb.net/ecosphere-integration?retryWrites=true...`

---

## 🛠️ Running the Application

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the database seed script to populate default departments, roles, categories, and emission factors:
   ```bash
   npm run seed
   ```
4. Start the Express backend in development mode (runs on port `5000` with hot reloading):
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📂 Project Structure

```
ecosphere/
├── backend/
│   ├── src/
│   │   ├── config/           # Database & environment configs
│   │   ├── controllers/      # Route handler controllers
│   │   ├── models/           # Mongoose Schemas (Single source of truth)
│   │   ├── routes/           # Express Route endpoints
│   │   ├── services/         # Scoring, carbon calculation, and rules engines
│   │   ├── middleware/       # Auth validation & file upload guards
│   │   ├── sockets/          # Socket.io realtime events
│   │   └── jobs/             # Node-cron schedule workers
│   └── seed/                 # Database seed script & dummy data
│
└── frontend/
    ├── src/
    │   ├── theme/            # Theme tokens (Canopy green palette)
    │   ├── api/              # Axios HTTP client requests
    │   ├── store/            # Redux Toolkit slices / state
    │   ├── routes/           # React Guarded Routing
    │   ├── components/       # Shared reusable UI elements
    │   ├── features/         # Page components mapped to dev roles
    │   └── utils/            # Shared formatting or helper methods
```

---

## 👥 Dev Parallel Splits & Owned Modules

Refer to [docs/AI_CONTEXT.md](file:///c:/ODOO-ECOSPHERE/Odoo-Hackathon-2026/AI_CONTEXT.md) for full mapping details of routes, controllers, and schemas owned by Devs A, B, C, and D.

- Always check changes against Mongoose models in `backend/src/models/` first before starting work on controllers/routes.
- For evidence file uploads, files are uploaded locally to `/uploads/` and tracked in Mongoose documents.
