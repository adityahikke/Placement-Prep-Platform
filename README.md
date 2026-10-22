# ?? PlacementPrep Platform

A full-stack web application designed to help students prepare for campus placements. It covers aptitude tests, DSA problem tracking, CS fundamentals, and provides an admin panel to manage content and monitor student progress.

---

## ?? Live Demo

| Service | URL |
|---------|-----|
| Frontend | [Deployed on Vercel](https://your-app.vercel.app) |
| Backend API | [Deployed on Render](https://your-api.onrender.com) |
| Swagger UI | `https://your-api.onrender.com/swagger-ui.html` |

---

## ?? Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| Vite | Build Tool |
| React Router DOM v6 | Client-side Routing |
| Tailwind CSS | Styling |
| Axios | HTTP Client |
| Lucide React | Icons |
| Canvas Confetti | Animations |

### Backend
| Technology | Purpose |
|------------|---------|
| Java 21 | Language |
| Spring Boot 3 | Application Framework |
| Spring Security + JWT | Authentication and Authorization |
| Spring Data JPA / Hibernate | ORM and Database Access |
| PostgreSQL | Production Database |
| Supabase | Managed PostgreSQL (Production) |
| SpringDoc OpenAPI | Swagger API Documentation |
| Apache POI | Excel file parsing for Bulk Upload |
| Google OAuth2 | Social Login |

---

## ? Features

### ????? Student Features
- **Register / Login** — Email and password or Google OAuth2
- **Dashboard** — Overview of tests taken, DSA progress, study streaks
- **Aptitude Tests** — Subject-wise MCQ tests with timer and auto-submit
- **Test History** — View all past test attempts with scores and timestamps
- **Test Results** — Detailed result page with correct/wrong answer review
- **CS Fundamentals** — Chapter-based study material for OS, DBMS, CN, OOPs
- **DSA Tracker** — Track LeetCode-style problems by topic and difficulty
- **Progress Analytics** — Charts showing performance trends over time

### ??? Admin Features
- **Admin Dashboard** — Summary stats (students, questions, test attempts)
- **Question Bank** — Add, edit, delete MCQ questions with bulk Excel upload
- **Curriculum Manager** — Manage Subjects ? Chapters ? Sections hierarchy
- **DSA Problems Manager** — Add/edit DSA problems with topic/difficulty tags
- **Student Management** — View all registered students
- **Student Detail View** — Inspect individual student test history and progress

---

## ??? Project Structure

```
Placement-Prep-Platform/
+-- backend/                        # Spring Boot Java application
¦   +-- src/
¦   ¦   +-- main/
¦   ¦       +-- java/com/placementprep/
¦   ¦       ¦   +-- config/         # CORS, Security, Swagger config
¦   ¦       ¦   +-- controller/     # REST API controllers
¦   ¦       ¦   +-- dto/            # Data Transfer Objects
¦   ¦       ¦   +-- entity/         # JPA Entity classes
¦   ¦       ¦   +-- exception/      # Global exception handling
¦   ¦       ¦   +-- repository/     # Spring Data JPA repositories
¦   ¦       ¦   +-- security/       # JWT + Google token verifier
¦   ¦       ¦   +-- service/        # Business logic services
¦   ¦       +-- resources/
¦   ¦           +-- application.yml
¦   +-- pom.xml
¦
+-- frontend/                       # React + Vite application
¦   +-- src/
¦   ¦   +-- api/                    # Axios client and API calls
¦   ¦   +-- components/             # Reusable UI components
¦   ¦   +-- context/                # React context (Auth)
¦   ¦   +-- hooks/                  # Custom React hooks
¦   ¦   +-- pages/
¦   ¦   ¦   +-- admin/              # Admin panel pages
¦   ¦   ¦   +-- Dashboard.jsx
¦   ¦   ¦   +-- Aptitude.jsx
¦   ¦   ¦   +-- DsaTracker.jsx
¦   ¦   ¦   +-- CsFundamentals.jsx
¦   ¦   ¦   +-- ProgressAnalytics.jsx
¦   ¦   ¦   +-- TestHistory.jsx
¦   ¦   ¦   +-- TestEnvironment.jsx
¦   ¦   ¦   +-- TestResult.jsx
¦   ¦   +-- routes/
¦   ¦   +-- App.jsx
¦   ¦   +-- main.jsx
¦   +-- package.json
¦   +-- vercel.json
¦
+-- README.md
```

---

## ?? Local Development Setup

### Prerequisites
- Java 21+
- Maven 3.9+
- Node.js 18+
- PostgreSQL (local) **or** a Supabase project URL

---

### 1. Clone the Repository

```bash
git clone https://github.com/adityahikke/placement-prep-platform.git
cd placement-prep-platform
```

---

### 2. Backend Setup

Set the following environment variables (or create an `.env` file and export them):

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/placementprep
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=yourpassword
JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

> **Using Supabase?** Replace `SPRING_DATASOURCE_URL` with your Supabase JDBC URL:
> `jdbc:postgresql://aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?user=postgres.xxxx&password=xxxx`

Run the backend:

```bash
cd backend
mvn spring-boot:run
```

- API runs at: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

---

### 3. Frontend Setup

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

Install and run:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## ?? Deployment Guide

### Frontend ? Vercel

1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) ? **New Project** ? Import GitHub repo.
3. Set **Root Directory** to `frontend`.
4. Add Environment Variables:
   - `VITE_API_BASE_URL` ? your Render backend URL (e.g., `https://your-api.onrender.com`)
   - `VITE_GOOGLE_CLIENT_ID` ? your Google OAuth client ID
5. Click **Deploy**.

---

### Backend ? Render

1. Go to [render.com](https://render.com) ? **New Web Service**.
2. Connect your GitHub repository.
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -jar target/*.jar`
4. Add Environment Variables in Render dashboard:

| Variable | Value |
|----------|-------|
| `SPRING_DATASOURCE_URL` | Supabase JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | Supabase DB username |
| `SPRING_DATASOURCE_PASSWORD` | Supabase DB password |
| `JWT_SECRET` | Long random secret string |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `PORT` | `8080` |

5. Click **Deploy**.

---

### Database ? Supabase

1. Go to [supabase.com](https://supabase.com) ? Create new project.
2. Navigate to **Settings ? Database ? Connection String ? JDBC**.
3. Copy the JDBC URL and use it as `SPRING_DATASOURCE_URL` in Render.
4. Tables are created automatically on first startup (`ddl-auto: update`).

---

## ?? Environment Variables Reference

### Backend

| Variable | Description | Required |
|----------|-------------|----------|
| `SPRING_DATASOURCE_URL` | JDBC database connection URL | ? |
| `SPRING_DATASOURCE_USERNAME` | Database username | ? |
| `SPRING_DATASOURCE_PASSWORD` | Database password | ? |
| `DATABASE_DRIVER` | JDBC driver class | Auto-detected |
| `JWT_SECRET` | Secret key for signing JWT tokens | ? |
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID | ? |
| `PORT` | Server port | Defaults to `8080` |

### Frontend

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_BASE_URL` | Base URL of the backend REST API | ? |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth2 client ID | ? |

---

## ?? API Overview

| Module | Base Path | Description |
|--------|-----------|-------------|
| Auth | `/api/auth` | Register, Login, Google OAuth login |
| Dashboard | `/api/dashboard` | Student stats summary |
| Tests | `/api/tests` | Start, submit, and get test results |
| Progress | `/api/progress` | DSA and test analytics |
| DSA | `/api/dsa` | Problems list and status tracking |
| Content | `/api/content` | Subjects, chapters, sections |
| Admin | `/api/admin` | Admin CRUD for all resources |
| Health | `/api/health` | API health check |

> Full interactive docs at `/swagger-ui.html`

---

## ??? Security

- Passwords hashed with **BCrypt**
- Protected routes require a **JWT Bearer Token** in the `Authorization` header
- Google ID tokens verified server-side using Google public keys
- Role-based access control: `ROLE_STUDENT` and `ROLE_ADMIN`
- CORS configured to allow only the Vercel frontend origin

---

## ??? Database Schema

| Entity | Key Fields |
|--------|-----------|
| `User` | id, name, email, password, role, authProvider |
| `Subject` | id, name, description |
| `Chapter` | id, title, subject_id |
| `Section` | id, title, content, chapter_id |
| `Question` | id, questionText, options, correctAnswer, subject_id, difficulty |
| `TestAttempt` | id, user_id, subject_id, score, totalQuestions, status, startedAt |
| `TestAnswer` | id, attempt_id, question_id, selectedAnswer, isCorrect |
| `DsaProblem` | id, title, topic, difficulty, leetcodeUrl |
| `UserDsaProgress` | id, user_id, problem_id, status |

---

## ?? User Roles

| Role | Access |
|------|--------|
| `ROLE_STUDENT` | Dashboard, Aptitude Tests, DSA Tracker, CS Fundamentals, Progress Analytics |
| `ROLE_ADMIN` | All student features + Admin Panel (Students, Questions, Curriculum, DSA Problems) |

---

## ?? Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature-name`
3. Commit changes: `git commit -m "feat: add your feature"`
4. Push: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## ?? License

This project is licensed under the MIT License.

---

## ????? Author

**Aditya Hikke**
GitHub: [@adityahikke](https://github.com/adityahikke)

---

> Built with ?? to help students crack placements ??
