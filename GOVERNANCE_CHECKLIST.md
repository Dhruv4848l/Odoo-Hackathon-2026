# ⚖️ Governance & Notifications Module Tracker (Dev C)

This file tracks the implementation progress of the **Governance & Notifications** vertical slice for **Dev C**. Use this checklist to monitor completed systems and understand how each element works.

---

## 📈 Implementation Progress

- [x] **Phase 1: Backend Models & Services** — Core Mongoose data definitions and automated business rules.
- [x] **Phase 2: Express Routes & Controllers** — REST API controllers and guarded route endpoints.
- [x] **Phase 3: Frontend Client, Slices & Realtime Alerts** — Axios mapping, Redux store slices, and Socket.io toast alerts.
- [x] **Phase 4: Frontend UI Pages** — Interactive React views for Policies, Tracking, and Compliance Kanban.
- [x] **Phase 5: E2E Verification & Integration** — Automated testing of cron triggers, socket alerts, and local validations.

---

## 🔍 Detailed Phase & Element Explanations

### Phase 1: Backend Models & Services (Completed)
This phase establishes the database structure and the background service engines that run automated rules (such as checking for overdue deadlines and sending real-time notifications).

#### Elements:
* **`ESGPolicy` Model:** Stores versioned, categorized policy documents. Toggled `mandatory` policies require employee acknowledgement logs.
* **`PolicyAcknowledgement` Model:** Tracks employee signature logs. Uses a compound unique index `(user + policy)` to prevent double-signing.
* **`Audit` Model:** Schedules department audits. Includes a score field (0-100) and `evidenceUrl` for uploading proof documents.
* **`ComplianceIssue` Model:** Represents compliance flags. Contains an owner (Manager), severity level, due date, status, and `evidenceUrl` for upload proof.
* **`Notification` Model:** Persists in-app notifications (Alerts, Rewards, Policies, System messages) for users.
* **`Upload Middleware`:** Connects Multer storage, whitelists PDFs and images, and limits file sizes to 5MB.
* **`Notification Service`:** Main API to trigger notifications. Saves the document to MongoDB and pushes real-time socket events via Socket.io if the user is online.
* **`Overdue Flag Service` & `Cron Job`:** Runs automated checks hourly. If a compliance issue's `dueDate` has passed and status is not `Resolved`, it updates status to `Overdue` and sends alert notifications to the manager.

---

### Phase 2: Express Routes & Controllers (Completed)
This phase creates RESTful route endpoints and controller logic so that the frontend can communicate securely with the database.

#### Elements:
* **`policy.controller.js` & Routes:** Enables creating, updating, viewing, and deleting policies. Guarded so only Admins/Managers can create/update/delete.
* **`acknowledgement.controller.js` & Routes:** Handlers for employees to sign off on policies. Computes percentage statistics of sign-offs per department for managers to track.
* **`audit.controller.js` & Routes:** Handlers for scheduling audits and recording findings, scores, and evidence documents.
* **`complianceIssue.controller.js` & Routes:** Handlers to create compliance issues and resolve issues (which accepts evidence file uploads).
* **`notification.controller.js` & Routes:** Handlers for users to fetch their notifications tray and mark alerts as read.

---

### Phase 3: Frontend Client, Slices & Realtime Alerts (Completed)
This phase wires up API queries, manages global state caching, and listens for WebSocket triggers to render floating popup alert banners.

#### Elements:
* **`governance.api.js`:** Map of HTTP Axios requests pointing to your backend endpoints.
* **`governanceSlice.js`:** Redux Toolkit slice containing async thunks, loaders, error caching, and lists state management.
* **`store.js`:** Integrates the `governance` slice into the central Redux store.
* **`App.jsx` Sockets Hook:** Establishes a Socket.io client. When logged in, it registers the user session and listens for `notification` push events.
* **`Floating Toast UI`:** Floating CSS banner that pops up on new notifications. Color-coded borders signify severity (maroon for governance alerts, blue for policy signoffs, gold for rewards).

---

### Phase 4: Frontend UI Pages (Pending)
Builds the visual interface for the ESG Governance module.

#### Elements:
* **`PolicyList.jsx` Screen:**
  - Manager View: Form to title, write, specify category, and publish new mandatory policies.
  - Employee View: List of policies, showing badge details, click-to-open reader modal, and a "Sign Name" textbox to submit acknowledgement.
* **`AcknowledgementTracker.jsx` Screen:**
  - Visual tracking grid representing percentages of signed policies per department (e.g. "HR: 85% completed", "Manufacturing: 42% completed").
* **`ComplianceKanban.jsx` Screen:**
  - Columns for Audits: `Scheduled`, `In Progress`, `Completed`.
  - Columns for Compliance Issues: `Open`, `In Progress`, `Resolved`, `Overdue`.
  - Double-click card to open actions (upload proof file, reassign owner, log audit score, or set status).

---

### Phase 5: E2E Verification & Integration (Completed)
Tests connections and verifies integration hooks with other developers' stubs.

#### Elements:
* **Score Rollup Trigger:** Verifies that completing audits or resolving compliance issues automatically updates the department's governance score by calling Dev D's `recalculateDepartmentScore()`.
