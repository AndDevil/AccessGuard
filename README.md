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

## 🐳 Docker Containerization Deployment (Recommended)

To run the entire AccessGuard stack (Frontend, Backend, and Database) fully containerized with a single command:

### 1. Copy Environment File
In the root directory of the project, copy the environment template:
```bash
cp .env.example .env
```
*(The actual `.env` file should remain at the root of the project, as the Docker Compose orchestration layer reads it from there).*

### 2. Build & Launch Containers
Execute the following command at the root directory:
```bash
docker-compose up --build
```
This command builds the multi-stage frontend container, creates the backend container, mounts volumes for code hot-reloads, runs migrations automatically, and starts the services.

### 3. Access Services
- **React Frontend Dashboard**: 👉 **[http://localhost:3000](http://localhost:3000)** (mapped from container port 80).
- **Backend API & Swagger Docs**: 👉 **[http://localhost:5050/api-docs](http://localhost:5050/api-docs)** (mapped from container port 5000).

---

## 🛠️ Local Host Development (Alternative)

### Step 1: Clone & Configure Database

## 🐳 Dockerized Multi-Stage Setup

We provide a multi-stage `docker-compose.yml` configuration supporting hot-reloading (via TSX watcher and volume mounts) and automatic seeding.

### Step 1: Initialize configurations and build containers
Copy the root example environment file and launch the compose stack:
```bash
# 1. Copy environment definitions
cp .env.example .env

# 2. Build and launch services in detached mode
docker-compose up --build -d
```
*Once booted:*
- **Frontend React Dashboard**: 👉 **[http://localhost:3000](http://localhost:3000)** (mapped from container port `80` to host `3000`)
- **Backend Express API Direct**: **[http://localhost:5050](http://localhost:5050)** (mapped from container `5000` to host `5050`)
- **PostgreSQL Database Listener**: Port `5433` on host (mapped to container port `5432`)
- **Interactive Swagger Docs**: 👉 **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)** (or directly at `http://localhost:5050/api-docs`)

### Step 2: Automatic Database Seeding
On container launch, the database automatically initializes tables and inserts the following credentials:
*   **Admin Account**: `admin@accessguard.com` (password: `password123`)
*   **User Account**: `user@accessguard.com` (password: `password123`)

---

## 💻 Native Host Setup (Alternative)

If you prefer to run services natively on the host machine:

### Step 3: Run Database Service
Ensure you have a local PostgreSQL instance running. Standard database credentials can be configured inside `/backend/.env` or the root `.env`.

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
*   **Docker Compose**: 👉 **[http://localhost:3000](http://localhost:3000)**
*   **Native Host**: 👉 **[http://localhost:5173](http://localhost:5173)**

- Register as a `USER` -> Create, edit, and delete tasks. You will only see and modify your own tasks.
- Register as an `ADMIN` -> You can create tasks and optionally assign them to any user's UUID. You will also see all user tasks across the database, with full permissions to edit or delete them.
- Logout -> The backend clears the cookie session, securing the endpoint immediately.

### 3. Automated Integration Tests
AccessGuard includes a comprehensive integration test suite built with **Vitest** and **Supertest**. It verifies user registration, login, cookie assignments, and task CRUD validations.

To run the test suite:
*   **Via Docker Container**:
    ```bash
    docker-compose exec backend npm run test
    ```
*   **Natively on Host**:
    Ensure the `DATABASE_URL` environment points to an active PostgreSQL instance, then run:
    ```bash
    cd backend
    npm run test
    ```

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

