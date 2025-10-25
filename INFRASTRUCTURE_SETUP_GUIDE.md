# 🏗️ Infrastructure Setup Guide - ShopifyGenie OMS

Complete production-ready setup with Docker, PostgreSQL, Redis, JWT authentication, and security hardening.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Testing Authentication](#testing-authentication)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

- **Docker Desktop** (for PostgreSQL & Redis)
- **Node.js** >= 18.x
- **npm** or **yarn**

---

## 🚀 Quick Start

### 1️⃣ Start Infrastructure

Start PostgreSQL and Redis containers:

```bash
docker-compose up -d
```

Verify containers are running:

```bash
docker ps
```

You should see:
- `shopifygenie_postgres` on port `5432`
- `shopifygenie_redis` on port `6379`

### 2️⃣ Install Dependencies

Backend:
```bash
cd server
npm install
```

Frontend:
```bash
cd client
npm install
```

### 3️⃣ Configure Environment

Update `server/.env`:

```env
# Database
DATABASE_URL="postgresql://shopify:shopify_pass@localhost:5432/shopifygenie"

# JWT & Auth
JWT_SECRET="your_super_secret_jwt_key_min_32_chars"
JWT_EXPIRES="15m"
REFRESH_EXPIRES_DAYS=30

# Admin User (for seeding)
ADMIN_EMAIL="admin@shopifygenie.com"
ADMIN_PASSWORD="admin123"

# Server
PORT=4000
NODE_ENV="development"

# Frontend
FRONTEND_URL="http://localhost:3000"

# Shopify (set these when you have them)
SHOPIFY_CLIENT_SECRET="your_shopify_secret"
SHOPIFY_API_KEY="your_api_key"
SHOPIFY_API_SECRET="your_api_secret"

# Encryption (32 characters exactly)
ENCRYPTION_KEY="01234567890123456789012345678901"

# Redis
REDIS_URL="redis://localhost:6379"
```

Update `client/.env`:

```env
VITE_API_URL=http://localhost:4000/api
VITE_GRAPHQL_URL=http://localhost:4000/graphql
```

### 4️⃣ Setup Database

Run migrations and seed data:

```bash
cd server
npm run db:setup
```

This will:
- Generate Prisma client
- Push schema to database
- Seed admin and manager users

### 5️⃣ Start Services

**Backend** (Terminal 1):
```bash
cd server
npm run dev
```

**Frontend** (Terminal 2):
```bash
cd client
npm run dev
```

### 6️⃣ Access Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **GraphQL Playground:** http://localhost:4000/graphql
- **Health Check:** http://localhost:4000/health

---

## 🔐 Default Credentials

After seeding, you can login with:

### Admin User
- **Email:** `admin@shopifygenie.com`
- **Password:** `admin123`
- **Role:** ADMIN

### Manager User
- **Email:** `manager@shopifygenie.com`
- **Password:** `manager123`
- **Role:** MANAGER

---

## 🗃️ Database Management

### View Database (Prisma Studio)

```bash
cd server
npm run prisma:studio
```

Opens at: http://localhost:5555

### Create Migration

```bash
cd server
npm run prisma:migrate
```

### Reset Database

```bash
cd server
npm run prisma:migrate:reset
# This will drop, recreate, and seed the database
```

### Manual Seed

```bash
cd server
npm run seed
```

---

## 🧪 Testing Authentication

### GraphQL Playground (http://localhost:4000/graphql)

#### 1. Register New User

```graphql
mutation {
  register(
    email: "test@example.com"
    password: "password123"
    firstName: "Test"
    lastName: "User"
    role: SUPPORT
  ) {
    accessToken
    refreshToken
    refreshExpiresAt
    user {
      id
      email
      firstName
      lastName
      role
    }
  }
}
```

#### 2. Login

```graphql
mutation {
  login(
    email: "admin@shopifygenie.com"
    password: "admin123"
  ) {
    accessToken
    refreshToken
    refreshExpiresAt
    user {
      id
      email
      firstName
      lastName
      role
    }
  }
}
```

#### 3. Get Current User

Set Authorization header: `Bearer YOUR_ACCESS_TOKEN`

```graphql
query {
  me {
    id
    email
    firstName
    lastName
    role
    isActive
  }
}
```

#### 4. Refresh Token

```graphql
mutation {
  refreshToken(refreshToken: "YOUR_REFRESH_TOKEN") {
    accessToken
    refreshToken
    refreshExpiresAt
    user {
      id
      email
    }
  }
}
```

#### 5. Logout

```graphql
mutation {
  logout(refreshToken: "YOUR_REFRESH_TOKEN")
}
```

#### 6. Request Password Reset

```graphql
mutation {
  requestPasswordReset(email: "admin@shopifygenie.com")
}
```

Check server console for reset token URL.

#### 7. Reset Password

```graphql
mutation {
  resetPassword(
    token: "RESET_TOKEN_FROM_EMAIL"
    newPassword: "newpassword123"
  )
}
```

---

## 📦 What's Included

### ✅ Authentication Features

- ✅ JWT access tokens (15min expiry)
- ✅ Refresh token rotation (30 days)
- ✅ Token revocation (DB-backed)
- ✅ Password reset flow
- ✅ User registration
- ✅ Role-based access control

### ✅ Security

- ✅ Helmet (security headers)
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Password hashing (bcrypt)
- ✅ Token encryption for Shopify
- ✅ Webhook HMAC verification

### ✅ Infrastructure

- ✅ Docker Compose (PostgreSQL + Redis)
- ✅ Prisma ORM
- ✅ GraphQL API (Apollo Server)
- ✅ REST API endpoints
- ✅ Request logging (Morgan + Winston)
- ✅ Health check endpoint

### ✅ Database Models

- ✅ User (with roles)
- ✅ RefreshToken
- ✅ PasswordReset
- ✅ Store (Shopify integration)
- ✅ Order, OrderItem
- ✅ Fulfillment, FulfillmentItem
- ✅ Product, Inventory
- ✅ Returns, Notifications
- ✅ AuditLog, WebhookEvent

---

## 🐳 Docker Commands

### View Logs

```bash
docker logs shopifygenie_postgres
docker logs shopifygenie_redis
```

### Stop Services

```bash
docker-compose down
```

### Stop & Remove Data

```bash
docker-compose down -v
```

### Restart Services

```bash
docker-compose restart
```

---

## 🔧 Troubleshooting

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::4000`

**Solution:**

Windows (PowerShell):
```powershell
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

Mac/Linux:
```bash
lsof -ti:4000 | xargs kill -9
```

### Database Connection Failed

**Error:** `Authentication failed against database server`

**Solutions:**

1. Verify Docker containers are running:
   ```bash
   docker ps
   ```

2. Check DATABASE_URL in `.env`:
   ```
   DATABASE_URL="postgresql://shopify:shopify_pass@localhost:5432/shopifygenie"
   ```

3. Restart containers:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### Prisma Client Errors

**Error:** `Cannot find module '@prisma/client'`

**Solution:**
```bash
cd server
npm run prisma:generate
```

### Migration Errors

**Error:** `Migration failed`

**Solution:**
```bash
cd server
npm run prisma:migrate:reset
npm run seed
```

---

## 🚀 Production Deployment

### Environment Variables

Set these in production:

```env
NODE_ENV=production
JWT_SECRET="STRONG_RANDOM_SECRET_MIN_64_CHARS"
DATABASE_URL="postgresql://user:pass@prod-host:5432/db"
REDIS_URL="redis://prod-redis:6379"
ENCRYPTION_KEY="32_CHAR_RANDOM_KEY_FOR_SHOPIFY"
FRONTEND_URL="https://yourdomain.com"
```

### Build & Deploy

```bash
cd server
npm run build
npm start
```

### Database Migrations

```bash
cd server
npm run prisma:migrate:deploy
```

### Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (64+ chars)
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS for your domain
- [ ] Set secure cookie flags
- [ ] Enable rate limiting
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure backup strategy
- [ ] Use environment secret manager (AWS Secrets, Vault)

---

## 📚 Additional Resources

- **Prisma Docs:** https://www.prisma.io/docs
- **Apollo Server:** https://www.apollographql.com/docs/apollo-server
- **Express.js:** https://expressjs.com
- **JWT Best Practices:** https://tools.ietf.org/html/rfc7519

---

## 🎉 You're All Set!

Your ShopifyGenie OMS now has:

✅ Production-ready authentication  
✅ Secure token management  
✅ Docker infrastructure  
✅ GraphQL + REST APIs  
✅ Complete database schema  

**Next Steps:**

1. Login to the app at http://localhost:3000
2. Explore GraphQL playground at http://localhost:4000/graphql
3. Integrate Shopify webhook endpoints
4. Build out order management features

---

**Need Help?** Check the troubleshooting section above or review the terminal logs for detailed error messages.

