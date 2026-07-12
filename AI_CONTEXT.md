# 🌿 EcoSphere — AI Collaboration Context

> **Read this file first, every session.** This is the single shared source of truth we (4 devs) use to keep Claude/AI in sync with the project as we build in parallel on one GitHub repo. If anything in a past AI chat contradicts this file, **this file wins** — it reflects the latest decisions, including the Mongo switch below.

---

## 0. How to use this file (for the AI)

- This is a **build context doc**, not a spec to re-derive from scratch. Assume the architecture below is decided. Don't re-litigate MongoDB vs. MySQL, the module split, or the stack unless explicitly asked to.
- At the start of a session, the developer will state their **role** (Dev A / B / C / D — see Section 2). Scope all suggestions, code, and file paths to that dev's owned modules unless they ask about integration points or shared code.
- If asked to touch another dev's collections/routes/screens, flag it ("this is Dev B's territory — confirm before I touch `Challenge` model") rather than silently doing it.
- Default to the folder structure in Section 5. Put new files where that structure says, don't invent parallel structures.
- Keep responses focused on shippable code for an 8-hour build — favor working code over exhaustive edge-case handling unless the dev asks for hardening.

---

## 1. What EcoSphere is (one paragraph)

EcoSphere is an ESG (Environmental / Social / Governance) management platform. Daily ops data (Purchase/Manufacturing/Expense/Fleet) auto-converts into Carbon Transactions via configured Emission Factors. Employees earn XP/Badges/Points through CSR Activities and gamified Challenges. Governance activity (policy sign-off, audits, compliance issues) is tracked with mandatory ownership. All three streams roll up into per-department Environmental/Social/Governance scores, combined into department + overall ESG scores, shown on a live dashboard and exportable as reports.

Full functional spec (features, business rules, UI theme, definition of done) lives in `docs/EcoSphere_ESG_Platform_Roadmap.md` (the original roadmap doc) — this context file is the **build-time companion** to that spec, updated for our actual stack and workflow.

---

## 2. ⚠️ Stack change from original roadmap: MongoDB, not MySQL

The original roadmap doc recommends MySQL + Prisma/Sequelize. **We are using MongoDB instead.** Every reference to MySQL, foreign keys, SQL migrations, or relational joins in the roadmap doc should be mentally translated as follows:

| Roadmap doc says | We actually do |
|---|---|
| MySQL 8 | **MongoDB Atlas** (Cloud Database) |
| Prisma / Sequelize | **Mongoose** (ODM, schema-first models) |
| `schema.prisma` as shared source of truth | **`backend/src/models/*.js`** Mongoose schemas are the shared source of truth |
| `prisma migrate dev` | No migrations — Mongoose schemas are applied at runtime; use a `seed.js` script for consistent demo data (same idea as before, different mechanism) |
| Foreign keys / joins | **ObjectId refs** + `.populate()`. Denormalize where it saves a join in hot paths (e.g., store `departmentId` + `departmentName` on frequently-read documents) |
| Tables | **Collections** |
| Rows | **Documents** |

Everything else in the roadmap (features, business rules engines, scoring formulas, dev-split-by-module, UI theme, hour-by-hour timeline, definition of done) stands as originally written. Only the persistence layer changed.

### Why this doesn't break the "relational integrity matters for ESG/audit data" argument
We still enforce referential integrity at the **application layer**: every write to a collection that references another (e.g., `CarbonTransaction.departmentId`) validates the ref exists before saving, via a small `services/validation/` helper. Mongoose schema validation + `required: true` + custom pre-save hooks cover most of what foreign key constraints would have given us.

---

## 3. Roles — declare yours before you start

We're 4 devs, each owning a **full vertical slice** (models → routes → React screens) for one module, per the original roadmap's Section 9 split. **At the start of any AI session, say which role you are** (e.g. "I'm Dev B today") so the AI scopes its help correctly.

| Role | Owns (collections) | Owns (routes/features) | Key screens |
|---|---|---|---|
| **Dev A — Environmental & Core Setup** | `EmissionFactor`, `CarbonTransaction`, `EnvironmentalGoal`, `ProductESGProfile`, plus base scaffold (auth, DB connection, shared UI shell, `User`, `Department`, `Category`) | `/api/auth`, `/api/departments`, `/api/emission-factors`, `/api/carbon-transactions`, `/api/environmental-goals` | Login, Emission Factor config, Carbon entry, Environmental Dashboard |
| **Dev B — Social & Gamification** | `CSRActivity`, `EmployeeParticipation`, `Challenge`, `ChallengeParticipation`, `Badge`, `Reward`, `RewardRedemption` | `/api/csr-activities`, `/api/participation`, `/api/challenges`, `/api/badges`, `/api/rewards`, `/api/leaderboard` | CSR CRUD, Challenge CRUD, Approval queue, Leaderboard, Reward catalog |
| **Dev C — Governance & Notifications** | `ESGPolicy`, `PolicyAcknowledgement`, `Audit`, `ComplianceIssue`, `Notification` | `/api/policies`, `/api/acknowledgements`, `/api/audits`, `/api/compliance-issues`, `/api/notifications` | Policy CRUD, Acknowledgement tracking, Audit/Compliance Kanban, Notification settings |
| **Dev D — Scoring, Dashboard & Reports** | `DepartmentScore`, `Settings` (+ read access to all other collections) | `/api/scores`, `/api/settings`, `/api/reports` | Org Dashboard, Settings (toggles + weighting), Reports module (fixed + custom builder) |

**Shared integration points (build against the stub signatures below, don't wait on each other):**
- `awardXP(userId, amount, reason)` — called by Dev B's approval/completion logic, defined in `backend/src/services/gamification/xpEngine.js`
- `notify(userId, type, payload)` — called from Dev A/B's approval & creation logic, Dev C owns the implementation in `backend/src/services/notifications/notificationService.js`
- `recalculateDepartmentScore(departmentId)` — Dev D owns this in `backend/src/services/scoring/scoringEngine.js`, called on-demand or via cron

---

## 4. Tech stack (current, MongoDB version)

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React (Vite) + Tailwind CSS + Redux Toolkit / React Query | Fast HMR, utility CSS, simplified API state |
| Backend | Node.js + Express | Split into per-module route files |
| Database | **MongoDB Atlas** (Cloud Database) | See stack-change note above |
| ODM | **Mongoose** | Schema-first models = shared source of truth |
| Auth | JWT + bcrypt, role middleware (Admin/Manager/Employee/Auditor) | Stateless |
| Realtime | Socket.io | Live leaderboard & notification badges |
| File uploads | Multer (local disk for demo; shared folder if devs split machines) | CSR/Challenge proof files |
| Charts | Recharts or Chart.js | Env/Social/Gov dashboards |
| PDF/Excel/CSV export | Puppeteer (PDF) + ExcelJS (Excel) + json2csv (CSV) | Custom Report Builder |
| Dev environment | MongoDB Atlas Connection (No Docker needed for database) | Connect using shared/isolated Atlas clusters. See Section 7. |
| Scheduled jobs | `node-cron` | Overdue compliance flags, optional periodic score recompute |

---

## 5. Folder structure

```
ecosphere/
├── docs/
│   ├── EcoSphere_ESG_Platform_Roadmap.md      # original full spec (features, formulas, timeline, DoD)
│   └── AI_CONTEXT.md                          # this file
│
├── [Deprecated] docker-compose.yml             # MongoDB (No longer needed, using Atlas)
├── .env.example                                # shared env template
├── .gitignore
├── README.md
│
├── backend/
│   ├── package.json
│   ├── server.js                               # entry point, starts Express + Socket.io
│   ├── seed/
│   │   └── seed.js                             # consistent demo data: departments, employees, emission factors, etc.
│   └── src/
│       ├── config/
│       │   ├── db.js                           # mongoose.connect()
│       │   └── env.js
│       │
│       ├── models/                             # Mongoose schemas — the shared source of truth
│       │   ├── User.js
│       │   ├── Department.js
│       │   ├── Category.js
│       │   ├── EmissionFactor.js                # Dev A
│       │   ├── CarbonTransaction.js             # Dev A
│       │   ├── EnvironmentalGoal.js             # Dev A
│       │   ├── ProductESGProfile.js             # Dev A
│       │   ├── CSRActivity.js                   # Dev B
│       │   ├── EmployeeParticipation.js         # Dev B
│       │   ├── Challenge.js                     # Dev B
│       │   ├── ChallengeParticipation.js        # Dev B
│       │   ├── Badge.js                         # Dev B
│       │   ├── Reward.js                        # Dev B
│       │   ├── RewardRedemption.js              # Dev B
│       │   ├── ESGPolicy.js                     # Dev C
│       │   ├── PolicyAcknowledgement.js         # Dev C
│       │   ├── Audit.js                         # Dev C
│       │   ├── ComplianceIssue.js                # Dev C
│       │   ├── Notification.js                  # Dev C
│       │   ├── DepartmentScore.js                # Dev D
│       │   └── Settings.js                       # Dev D
│       │
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── department.routes.js
│       │   ├── emissionFactor.routes.js          # Dev A
│       │   ├── carbonTransaction.routes.js       # Dev A
│       │   ├── environmentalGoal.routes.js       # Dev A
│       │   ├── csrActivity.routes.js             # Dev B
│       │   ├── participation.routes.js           # Dev B
│       │   ├── challenge.routes.js               # Dev B
│       │   ├── badge.routes.js                   # Dev B
│       │   ├── reward.routes.js                  # Dev B
│       │   ├── leaderboard.routes.js             # Dev B
│       │   ├── policy.routes.js                  # Dev C
│       │   ├── acknowledgement.routes.js         # Dev C
│       │   ├── audit.routes.js                   # Dev C
│       │   ├── complianceIssue.routes.js         # Dev C
│       │   ├── notification.routes.js            # Dev C
│       │   ├── score.routes.js                   # Dev D
│       │   ├── settings.routes.js                # Dev D
│       │   └── report.routes.js                  # Dev D
│       │
│       ├── controllers/                          # one controller per route file, same naming
│       │   └── ...
│       │
│       ├── services/                              # business rule engines — the "smart" part
│       │   ├── emission/
│       │   │   └── autoEmissionCalculator.js      # Dev A — Rule 7.1
│       │   ├── scoring/
│       │   │   └── scoringEngine.js               # Dev D — Rule 7.2, recalculateDepartmentScore()
│       │   ├── gamification/
│       │   │   ├── xpEngine.js                    # Dev B — awardXP()
│       │   │   └── badgeEngine.js                 # Dev B — Rule 7.3, auto-award
│       │   ├── rewards/
│       │   │   └── redemptionService.js           # Dev B — Rule 7.4
│       │   ├── compliance/
│       │   │   └── overdueFlagService.js          # Dev C — Rule 7.6
│       │   ├── notifications/
│       │   │   └── notificationService.js         # Dev C — notify(), Rule 7.7
│       │   └── validation/
│       │       └── refIntegrity.js                # shared — validates ObjectId refs exist before save
│       │
│       ├── middleware/
│       │   ├── auth.middleware.js                 # JWT verify
│       │   ├── role.middleware.js                 # Admin/Manager/Employee/Auditor guard
│       │   ├── evidenceRequirement.middleware.js  # Rule 7.5 toggle enforcement
│       │   └── errorHandler.js
│       │
│       ├── sockets/
│       │   └── index.js                           # Socket.io setup, leaderboard + notification events
│       │
│       ├── jobs/
│       │   └── cron.js                            # node-cron: overdue checks, optional score recompute
│       │
│       └── utils/
│           └── ...
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── theme/
        │   └── tokens.js                          # Canopy palette (Section 11 of roadmap) as Tailwind tokens
        │
        ├── api/
        │   ├── axiosClient.js                      # shared instance, interceptors for JWT + errors
        │   ├── environmental.api.js                # Dev A
        │   ├── social.api.js                       # Dev B
        │   ├── governance.api.js                   # Dev C
        │   └── scoring.api.js                      # Dev D
        │
        ├── store/                                  # Redux Toolkit slices (or React Query hooks if preferred)
        │   ├── store.js
        │   ├── authSlice.js
        │   ├── environmentalSlice.js               # Dev A
        │   ├── socialSlice.js                      # Dev B
        │   ├── governanceSlice.js                  # Dev C
        │   └── scoringSlice.js                     # Dev D
        │
        ├── routes/
        │   └── AppRoutes.jsx                        # role-based route guards
        │
        ├── components/                              # shared, cross-module UI (buttons, cards, modals, nav)
        │   ├── layout/
        │   ├── ui/
        │   └── charts/
        │
        ├── features/
        │   ├── auth/
        │   │   └── LoginPage.jsx
        │   ├── environmental/                       # Dev A
        │   │   ├── EmissionFactorConfig.jsx
        │   │   ├── CarbonEntryForm.jsx
        │   │   └── EnvironmentalDashboard.jsx
        │   ├── social/                               # Dev B
        │   │   ├── CSRActivityList.jsx
        │   │   ├── ChallengeBoard.jsx
        │   │   ├── ApprovalQueue.jsx
        │   │   ├── Leaderboard.jsx
        │   │   └── RewardCatalog.jsx
        │   ├── governance/                           # Dev C
        │   │   ├── PolicyList.jsx
        │   │   ├── AcknowledgementTracker.jsx
        │   │   └── ComplianceKanban.jsx
        │   ├── admin/                                 # Dev D (settings) + Dev A (dept/category)
        │   │   ├── SettingsScreen.jsx
        │   │   └── DepartmentCategoryManager.jsx
        │   └── reports/                                # Dev D
        │       ├── OrgDashboard.jsx
        │       ├── FixedReports.jsx
        │       └── CustomReportBuilder.jsx
        │
        └── utils/
            └── ...
```

---

## 6. Business rule engines — quick reference

(Full detail in the roadmap doc, Section 7 — this is just the pointer to where each lives in code now.)

1. **Auto Emission Calculation** → `services/emission/autoEmissionCalculator.js` (Dev A)
2. **ESG Scoring Roll-up** → `services/scoring/scoringEngine.js` (Dev D) — default weights 40% Env / 30% Social / 30% Gov, configurable via `Settings` collection
3. **Badge Auto-Award** → `services/gamification/badgeEngine.js` (Dev B)
4. **Reward Redemption** → `services/rewards/redemptionService.js` (Dev B)
5. **Evidence Requirement** → `middleware/evidenceRequirement.middleware.js` (Dev B/C, enforced at approval transitions)
6. **Compliance Ownership & Overdue Flagging** → `services/compliance/overdueFlagService.js` (Dev C)
7. **Notification System** → `services/notifications/notificationService.js` (Dev C), single `notify(user, type, message)` respecting per-user Notification Settings

---

## 7. Git & environment workflow

- One shared GitHub repo, `main` protected. Branches: `feature/environmental`, `feature/social`, `feature/governance`, `feature/scoring-reports`.
- Mongoose schemas in `backend/src/models/` are the first thing agreed in the kickoff 15 minutes — everyone reviews before splitting off, since these are the single most important shared artifact (same principle as the roadmap's Prisma-schema-first approach, just Mongoose now).
- Merge to `main` at 3 fixed checkpoints (~hour 3, ~5.5, ~7), not continuously.
- **No Docker Required for DB:** We are using **MongoDB Atlas** (Cloud Database) instead of local Docker. Developers connect directly using a `MONGODB_URI` connection string in their `.env` file.
- **Preventing Dev Conflicts & Database Isolation (Crucial):**
  - To avoid developers overwriting each other's test data during local development, use **isolated database namespaces** inside the connection string.
  - In your local `.env`, append your dev identifier to the database name in the URI:
    - Dev A: `mongodb+srv://<user>:<password>@cluster.mongodb.net/ecosphere-dev-a?retryWrites=true&w=majority`
    - Dev B: `mongodb+srv://<user>:<password>@cluster.mongodb.net/ecosphere-dev-b?retryWrites=true&w=majority`
    - Dev C: `mongodb+srv://<user>:<password>@cluster.mongodb.net/ecosphere-dev-c?retryWrites=true&w=majority`
    - Dev D: `mongodb+srv://<user>:<password>@cluster.mongodb.net/ecosphere-dev-d?retryWrites=true&w=majority`
  - This ensures each dev has their own sandbox and seed data runs independently.
- **Seeding Data:** Run the seeding script locally (`node backend/seed/seed.js`) to populate your specific dev database namespace on Atlas with consistent default data (departments, employees, emission factors, etc.).
- **Integration & Demo:** For integration testing and the final demo, all devs will configure their `.env` to point to the shared `ecosphere-integration` (or `ecosphere-demo`) database. Ensure a final clean seed (`node backend/seed/seed.js`) is run against this namespace before the demo.

---

## 8. Definition of done

See the original roadmap doc, Section 12, for the full checklist (scoring roll-up, badge auto-award, evidence toggle, overdue flagging, 4 fixed reports + custom builder, etc.) — unchanged by the Mongo switch, just implemented against Mongoose models instead of SQL tables.
