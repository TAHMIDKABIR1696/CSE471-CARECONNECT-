# 🌿 CareConnect: Personalizing Childcare with Heart & Intelligence

[![Standard](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Modern](https://img.shields.io/badge/Tailwind-CSS_4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Database](https://img.shields.io/badge/Prisma-MongoDB-2D3748?logo=prisma)](https://www.prisma.io/)
[![Chat](https://img.shields.io/badge/Powered_by-Stream-005FFF?logo=getstream)](https://getstream.io/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

**CareConnect** is a premium, high-fidelity platform designed to bridge the gap between families and trusted caregivers. By combining intelligent matching algorithms with real-time communication tools, CareConnect ensures every child gets the care they deserve in a safe, transparent, and modern environment.

---

## 🔗 Live Experience

### 🌐 [Live Demo URL](https://careconnect.vercel.app/): [CareConnect](https://careconnect.vercel.app/)

To experience the platform without creating new accounts, you can use the following test credentials:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@careconnect.com` | `admin123` |
| **Parent** | `parent@careconnect.com` | `parent123` |
| **Sitter** | `sitter@careconnect.com` | `sitter123` |

---

## ✨ Key Features

### 🧠 Smart Match™ Technology
Our proprietary matching engine analyzes:
- **Availability Patterns:** Sophisticated overlap detection (supports both JSON and natural language inputs).
- **Personality Harmony:** Matching based on caregiver traits and family needs.
- **Proximity:** Location-aware sorting for convenient care.

### 💬 Real-time Ecosystem
- **Instant Messaging:** Seamless chat between parents and sitters powered by **Stream Chat**.
- **Live Video Interviews:** Integrated video conferencing for pre-hiring peace of mind.
- **Activity Tracking:** Live timers and status updates for active care sessions.

### 🛡️ Trust & Safety
- **Sitter Approvals:** Managed verification process via a dedicated Admin Dashboard.
- **Secure ID Verification:** Integrated identity checks for all parties.
- **Background Reports:** Comprehensive reports available for premium tiers.

### 💰 Professional Billing
- **Tiered Plans:** Standard, Premium, and Diamond subscriptions to suit every family's budget.
- **Stripe Integration:** Seamless, secure, and automated payment processing.

---

## 🛠️ Technical Architecture & Stack

CareConnect is built with a focus on **performance, scalability, and security**, following a modern **MVC pattern**.

### **Core Stack**
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4
- **Backend:** Node.js (Express 5.x)
- **Database:** MongoDB with Prisma ORM
- **Communication:** GetStream (Chat & Video), Socket.IO

### **Security**
- **Rate Limiting:** Auth & sensitive endpoints protected against brute-force
- **Input Sanitization:** XSS protection on all user inputs
- **Helmet:** Security headers configured
- **Request Tracing:** Unique request IDs for debugging

---

## 📂 Project Structure

```bash
careconnect/
├── frontend/               # Next.js Application
│   ├── src/
│   │   ├── app/           # App Router (Pages & Layouts)
│   │   ├── components/    # Common UI Components
│   │   └── modules/       # Domain-specific logic (Home, Admin)
│   └── public/            # Static assets (Branding, Logo)
└── backend/                # Node.js API
    ├── src/
    │   ├── controllers/   # Request handlers
    │   ├── middleware/     # Auth, Rate Limit, Sanitization, Validation
    │   ├── services/      # Business logic (Matching, Auth, Email)
    │   └── routes/        # API Endpoints
    └── prisma/            # Database Schema & Migrations
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Backend Setup
```bash
cd backend
cp .env.example .env       # Fill in your values
npm install
npx prisma generate
npx prisma db push
npm run dev                # Runs on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
cp .env.example .env.local  # Fill in your values
npm install
npm run dev                 # Runs on http://localhost:3000
```

---

## 💎 Premium Offering

CareConnect offers a structured subscription model:

- **Standard:** Basic matching and verified sitter access.
- **Premium:** Advanced AI recommendations and priority support.
- **Diamond:** Complete peace of mind with background reports and personal family advisors.

---

## 👨‍💻 Author

Built with ❤️ by **Rakib**

---

*© 2026 CareConnect. All rights reserved.*
