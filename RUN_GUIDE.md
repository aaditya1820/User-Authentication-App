# How to Run the User Authentication System

Follow these steps to get the full-stack application running on your local machine.

## Prerequisites
- **Node.js**: v20 or higher recommended.
- **npm**: v9 or higher.
- **PostgreSQL**: Optional (Default is set to **SQLite** for instant setup).

---

## 1. Install Dependencies
Navigate to both folders and install dependencies:
```bash
# Backend
cd backend
npm install

# Frontend
cd ..
cd frontend
npm install
```

## 2. Configure Environment
Ensure the `backend/.env` file contains the correct settings. Use `backend/.env.example` as a template.

## 3. Setup Database
Navigate to the backend directory and initialize the database:
```bash
cd backend
npx prisma db push
```
*This creates the `dev.db` SQLite file and applies the schema.*

## 4. Seed the Admin User
Run the seed script to create the default admin account:
```bash
npm run seed
```
**Admin Credentials:**
- **Email**: `admin@authsystem.com`
- **Password**: `AdminPassword123!`

## 5. Start the Application
Start both services in separate terminals:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Accessing the App:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Documentation (Swagger)**: http://localhost:5000/api/docs

---

## OAuth Setup (If testing social login)
The project uses the following Redirect URIs which must match your Google/GitHub app settings:
- **Google**: `http://localhost:5000/api/v1/auth/google/callback`
- **GitHub**: `http://localhost:5000/api/v1/auth/github/callback`

## Emails (SMTP)
The project is configured to use your Gmail App Password. Verification and OTP emails will be sent directly through your account.
