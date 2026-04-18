# Production-Grade User Authentication System

A comprehensive, secure, and beautiful authentication system built from scratch.

## 🚀 Features
- **OAuth 2.0**: Google and GitHub integration using Passport.js.
- **MFA / 2FA**: TOTP-based two-factor authentication with QR code setup.
- **Session Management**: View and revoke active sessions/devices.
- **RBAC**: Role-based access control (USER, MODERATOR, ADMIN).
- **Security**: RS256 JWT, Refresh Tokens (HTTP-only), Rate Limiting, Helmet headers.
- **Forms**: React Hook Form + Zod validation, password strength meter (zxcvbn).
- **UX**: Framer Motion animations, Split-screen auth layout, Toast notifications.

## 🛠 Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Zustand, Axios, Framer Motion.
- **Backend**: Node.js 20, Express 5, Prisma ORM, Passport.js, Winston Logger.
- **Database**: SQLite (Local Dev) / PostgreSQL (Production).

## 📥 Installation

1. **Backend Setup**:
   ```bash
   cd backend
   npm install
   npx prisma db push
   npm run seed
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   ```

## 🚀 Running the Application

Since there are no root scripts, you should start each service in its own terminal:

- **Start Backend**: `cd backend && npm run dev`
- **Start Frontend**: `cd frontend && npm run dev`

## 🌍 Deployment (Render.com)

This project is optimized for Render as a **Web Service**:

1. **Connect your Repo**: Set `backend` as the **Root Directory**.
2. **Build Command**: 
   ```bash
   npm install && npm run build --prefix ../frontend && npm run prisma:generate
   ```
3. **Start Command**: `npm start`
4. **Environment Variables**: Add your `.env` variables (DATABASE_URL, JWT_SECRET, etc.) in the Render dashboard.

## 🔑 Default Credentials
- **Admin Email**: `admin@authsystem.com`
- **Admin Password**: `AdminPassword123!`

## 📚 API Documentation
Available at `http://localhost:5000/api/docs` (Swagger).
