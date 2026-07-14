# 🌿 EcoSphere Frontend — Collaborative ESG Management Platform

<div align="center">

**Modern, responsive, and rich UI built for the Odoo Hackathon 2026 ESG Management Platform.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-00C16A?style=for-the-badge&logo=vercel)](https://odoo-hackathon-2026-adrv.vercel.app/)
[![Backend API](https://img.shields.io/badge/Backend_API-Render-46E3B7?style=for-the-badge)](https://odoo-hackathon-2026-olkv.onrender.com/api)

[🌐 Live Demo](https://odoo-hackathon-2026-adrv.vercel.app/) • [Main Project README](../README.md)

</div>

---

## 🔗 Live Application

- **Live Production App:** [https://odoo-hackathon-2026-adrv.vercel.app/](https://odoo-hackathon-2026-adrv.vercel.app/)
- **Production Backend API:** [https://odoo-hackathon-2026-olkv.onrender.com/api](https://odoo-hackathon-2026-olkv.onrender.com/api)

### Quick Test Credentials
| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@gmail.com` | `admin@gmail.com` |

---

## 📖 Project Description

This is the frontend single-page application (SPA) for **EcoSphere**, an enterprise-grade Environmental, Social, and Governance (ESG) collaboration platform. It offers rich interactive dashboards, real-time metrics, Kanban workflow tracking, carbon accounting calculators, and gamified sustainability challenges.

### Tech Stack
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS 4 + Custom Glassmorphism UI
- **State Management:** Redux Toolkit
- **Routing:** React Router DOM v7
- **Charts & Visualizations:** Recharts
- **Real-time Updates:** Socket.io Client
- **HTTP Client:** Axios with JWT authentication interceptors

---

## 🛠️ Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev
```

By default, the local frontend runs on `http://localhost:5173` and automatically connects to your live Render API in production or `http://localhost:5000/api` during local development.
