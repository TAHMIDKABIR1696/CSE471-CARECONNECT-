# CareConnect — Setup Instructions

## Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **MongoDB Atlas** account or local MongoDB instance
- **npm** (comes with Node.js)

---

## 1. Clone the Repository

```bash
git clone <repo-url>
cd careconnect
```

## 2. Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:
- `DATABASE_URL` — your MongoDB connection string
- `JWT_SECRET` — a random secret (min 32 characters)
- `SMTP_*` — Gmail credentials (use App Password with 2FA enabled)
- `STRIPE_SECRET_KEY` — (optional) for Stripe payments
- `OPENAI_API_KEY` — (optional) for AI chatbot

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

The backend will run on **http://localhost:5000**.

### Seed the Database (Optional)

```bash
npm run prisma:seed
```

---

## 3. Frontend Setup

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local` with:
- `NEXT_PUBLIC_API_URL` — backend URL (default: `http://localhost:5000/api`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — (optional) for Stripe
- `NEXT_PUBLIC_STREAM_API_KEY` — (optional) for video calls

```bash
npm install
npm run dev
```

The frontend will run on **http://localhost:3000**.

---

## 4. Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@careconnect.com` | `admin123` |
| Parent | `parent@careconnect.com` | `parent123` |
| Sitter | `sitter@careconnect.com` | `sitter123` |

---

## 5. Feature Testing Workflow

1. **Registration & Approval** — Register as parent/sitter → Admin approves → Email notification
2. **Find Babysitter** — Use Smart Match™ or browse sitters → Book → Sitter receives notification
3. **Live Session** — Sitter starts session → GPS tracking → Parent monitors → Session ends
4. **Payment** — Pay via Stripe after booking is confirmed
5. **Review** — Leave reviews after completed bookings

---

## Troubleshooting

### Database Connection Failed
- Verify `DATABASE_URL` in `.env`
- Ensure MongoDB Atlas allows your IP in Network Access

### Email Not Sending
- Use Gmail App Password (not regular password)
- Enable 2FA on your Google account first
- Guide: https://support.google.com/accounts/answer/185833

### Port Already in Use
- Backend: Change `PORT` in `.env`
- Frontend: Run `npm run dev -- -p 3001`
