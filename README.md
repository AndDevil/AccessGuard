# AccessGuard - Secure Authentication & Role-Based Task Manager

AccessGuard is a full-stack internship portfolio project demonstrating a scalable REST API architecture built with Node.js, Express, TypeScript, and Prisma (PostgreSQL), coupled with a modern React + Vite frontend dashboard.

## 🚀 Key Features

- **JWT Authentication & RBAC**: Dual role-based configurations (`USER` and `ADMIN`) secured with cryptographically signed JSON Web Tokens.
- **Secure Token Delivery**: Uses `HttpOnly`, `SameSite=Strict` cookies to block XSS and mitigate CSRF vulnerabilities.
- **CRUD Operations**: Secure entity management for "Tasks" where regular users are constrained to their own records, and admins retain full database authorization.
- **Auto-Generated API Documentation**: Integrated Swagger OpenAPI interactive portal available at `/api-docs`.
- **Modern UI**: Dark glassmorphic design featuring responsive views, real-time feedback banners, and admin control panels.

---

## 📁 Project Structure

```text
/backend
  /src
    /controllers    (authController, taskController)
    /middlewares    (auth, admin, validation, errorHandler)
    /routes         (authRoutes, taskRoutes)
    /services       (business logic)
    /utils          (prismaClient, logger, jwtUtils)
  /prisma           (schema.prisma)
  package.json
  tsconfig.json
/frontend
  /src
    /components     (Login, Register, Dashboard, TaskList, TaskForm)
    /context        (AuthContext)
    /services       (api.js)
    /styles         (App.css)
  package.json
  vite.config.js
/docker-compose.yml
/README.md
/SCALABILITY.md
```

---

## 🛠️ Local Development Quickstart

### Step 1: Clone & Configure Database

We provide a `docker-compose.yml` to spin up PostgreSQL automatically. Run:

```bash
docker-compose up -d
```

*Note: If you have a local PostgreSQL running on port 5432, you can use that instead. Simply update the database credentials in `/backend/.env`.*

---

### Step 2: Configure Backend Environment

1. Navigate to `/backend`:
   ```bash
   cd backend
   ```
2. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and verify the `DATABASE_URL` matches your local database configurations.

---

### Step 3: Install & Seed Database

With the database container running, execute migrations inside `/backend`:

```bash
# Install backend dependencies
npm install

# Push database schema rules and instantiate the database
npx prisma db push
```

---

### Step 4: Run Application Services

Start both servers concurrently.

#### Launch Backend (Runs on port 5050):
```bash
cd backend
npm run dev
```

#### Launch Frontend (Runs on port 5173):
```bash
cd ../frontend
npm install
npm run dev
```

---

## 📊 Verification & Validation

### 1. Swagger Interactive Sandbox
Open your browser and navigate to:
👉 **[http://localhost:5050/api-docs](http://localhost:5050/api-docs)**

This sandbox lists all authentication, profile retrieval, and task routes. You can sign up, log in, retrieve your token, and test task actions directly.

### 2. Frontend Interface
Open your browser and navigate to:
👉 **[http://localhost:5173](http://localhost:5173)**

- Register as a `USER` -> Create, edit, and delete tasks. You will only see and modify your own tasks.
- Register as an `ADMIN` -> You can create tasks and optionally assign them to any user's UUID. You will also see all user tasks across the database, with full permissions to edit or delete them.
- Logout -> The backend clears the cookie session, securing the endpoint immediately.

---

## 🐙 GitHub Integration & CI/CD

### Push to GitHub

To store this repository on GitHub, create a new empty repository on GitHub and run the following commands in the workspace root:

```bash
# Initialize Git repository
git init

# Stage all files (ignores node_modules and .env files automatically)
git add .

# Create initial commit
git commit -m "feat: initial commit - AccessGuard RBAC Auth and Task Manager"

# Rename branch to main
git branch -M main

# Link your local repo to GitHub
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

### GitHub Actions CI/CD Pipeline

We have pre-configured a continuous integration pipeline under [ci.yml](file:///.github/workflows/ci.yml). Upon every `push` or `pull_request` to the `main`/`master` branches, GitHub will:
1. Spin up a temporary Ubuntu runner.
2. Initialize a Docker PostgreSQL database container service for schema verification.
3. Install backend dependencies and push the Prisma schema to test schema parsing and constraints.
4. Compile the backend code using the TypeScript compiler.
5. Install frontend dependencies and build the Vite static package to ensure build validation.

