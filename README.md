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

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm run install:all
   ```
3. **Configure Environment Variables**:
   Create a `server/.env` file (see `.env.example` in the root). 
   *Note: OAuth credentials for Google and GitHub are already provided in the code/env for testing.*

4. **Initialize Database**:
   ```bash
   cd server
   npx prisma db push
   npm run seed
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

## 🔑 Default Credentials
- **Admin Email**: `admin@authsystem.com`
- **Admin Password**: `AdminPassword123!`

## 🐳 Docker Usage
```bash
docker-compose up --build
```

## 📚 API Documentation
Available at `http://localhost:5000/api/docs` (Swagger).
