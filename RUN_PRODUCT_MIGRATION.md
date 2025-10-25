# 🚀 Quick Start: Product Module Migration

## Prerequisites
- ✅ Docker Desktop installed and running
- ✅ Node.js and npm installed
- ✅ Project dependencies installed (`npm install` in server folder)

---

## Option 1: Automatic Setup (Recommended)

### Windows (PowerShell)
```powershell
# Navigate to project root
cd D:\project\shopify-genie-oms

# Start Docker services
docker-compose up -d

# Wait for database to be ready (about 10 seconds)
Start-Sleep -Seconds 10

# Navigate to server and run migration
cd server
npx prisma migrate dev --name add_shopify_product_module

# Generate Prisma client (if not already done)
npx prisma generate

# Start the server
npm run dev
```

### macOS/Linux (Bash)
```bash
# Navigate to project root
cd ~/project/shopify-genie-oms

# Start Docker services
docker-compose up -d

# Wait for database to be ready
sleep 10

# Navigate to server and run migration
cd server
npx prisma migrate dev --name add_shopify_product_module

# Generate Prisma client (if not already done)
npx prisma generate

# Start the server
npm run dev
```

---

## Option 2: Step-by-Step Manual Setup

### Step 1: Start Docker Services
```bash
docker-compose up -d
```

**Expected output:**
```
✔ Container shopifygenie_postgres  Started
✔ Container shopifygenie_redis     Started
```

### Step 2: Verify Services Are Running
```bash
docker-compose ps
```

**Expected output:**
```
NAME                    STATUS
shopifygenie_postgres   Up (healthy)
shopifygenie_redis      Up (healthy)
```

### Step 3: Check Database Connection
```bash
# Windows PowerShell
cd server
$env:DATABASE_URL="postgresql://shopify:shopify_pass@localhost:5432/shopifygenie"

# macOS/Linux Bash
cd server
export DATABASE_URL="postgresql://shopify:shopify_pass@localhost:5432/shopifygenie"
```

### Step 4: Run Database Migration
```bash
npx prisma migrate dev --name add_shopify_product_module
```

**Expected output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "shopifygenie"

✔ Generated Prisma Client
✔ The migration was successfully generated and applied

The following migration(s) have been created and applied:

migrations/
  └─ 20241026_add_shopify_product_module/
      └─ migration.sql

Your database is now in sync with your schema.
```

### Step 5: Verify Migration
```bash
npx prisma studio
```

This opens Prisma Studio in your browser where you should see:
- ✅ ShopifyProduct table
- ✅ ShopifyProductVariant table
- ✅ Updated Store table

### Step 6: Start Backend Server
```bash
npm run dev
```

**Expected output:**
```
🚀 Server ready at http://localhost:3001
📊 GraphQL endpoint: http://localhost:3001/graphql
🌍 Environment: development
```

---

## Troubleshooting

### Problem: Docker not running
**Error:** `error during connect: Get "http://...dockerDesktopLinuxEngine..."`

**Solution:**
1. Open Docker Desktop
2. Wait for it to fully start
3. Run `docker-compose up -d` again

---

### Problem: Port 5432 already in use
**Error:** `Bind for 0.0.0.0:5432 failed: port is already allocated`

**Solution (Windows):**
```powershell
# Find process using port 5432
netstat -ano | findstr :5432

# Kill the process (replace PID with actual process ID)
Stop-Process -Id PID -Force
```

**Solution (macOS/Linux):**
```bash
# Find and kill process using port 5432
lsof -ti:5432 | xargs kill -9
```

---

### Problem: Authentication failed
**Error:** `P1000: Authentication failed against database server`

**Solution:**
1. Check if `.env` file exists in `server/` folder
2. If not, create it with:
```env
DATABASE_URL="postgresql://shopify:shopify_pass@localhost:5432/shopifygenie"
JWT_SECRET="your-super-secure-secret-key-change-this-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-key-change-this-too"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
ENCRYPTION_KEY="12345678901234567890123456789012"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
REDIS_URL="redis://localhost:6379"
```

---

### Problem: Migration already exists
**Error:** `A migration with the name 'add_shopify_product_module' already exists`

**Solution:**
```bash
# Use a different migration name
npx prisma migrate dev --name add_product_module_v2
```

---

### Problem: Prisma Client not generated
**Error:** `Cannot find module '@prisma/client'`

**Solution:**
```bash
npx prisma generate
```

---

## Verification Checklist

After running all steps, verify:

- [ ] Docker containers are running (`docker-compose ps`)
- [ ] PostgreSQL is accessible (port 5432)
- [ ] Redis is accessible (port 6379)
- [ ] Migration was applied successfully
- [ ] Prisma Client is generated
- [ ] Server starts without errors
- [ ] Server is accessible at http://localhost:3001
- [ ] Health check works: http://localhost:3001/health

---

## Test the Product API

### 1. Login (Get Token)
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@shopifygenie.com","password":"Admin@123"}'
```

**Copy the `accessToken` from the response**

### 2. Test Product Endpoints

```bash
# List products (should return empty array initially)
curl -X GET http://localhost:3001/api/products \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Expected response:
# {"success":true,"count":0,"data":[]}
```

---

## What to Do Next

1. **Add a Shopify Store** - Use your admin panel to add a store with Shopify credentials
2. **Sync Products** - Use `POST /api/products/sync` with your store ID
3. **View Products** - Access `GET /api/products` to see synced products
4. **Build Frontend** - Create Vue components to display and manage products

---

## Quick Commands Reference

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f postgres

# Restart server
cd server && npm run dev

# View database in browser
cd server && npx prisma studio

# Run migration
cd server && npx prisma migrate dev

# Generate Prisma client
cd server && npx prisma generate

# Reset database (WARNING: destroys all data)
cd server && npx prisma migrate reset
```

---

## Success! 🎉

If you see:
```
🚀 Server ready at http://localhost:3001
📊 GraphQL endpoint: http://localhost:3001/graphql
🌍 Environment: development
```

**You're all set!** The Product Module is ready to use.

---

## Documentation Links

- **Setup Guide:** [PRODUCT_MODULE_SETUP.md](./PRODUCT_MODULE_SETUP.md)
- **API Reference:** [PRODUCT_API_QUICK_REFERENCE.md](./PRODUCT_API_QUICK_REFERENCE.md)
- **Implementation Summary:** [PRODUCT_MODULE_IMPLEMENTATION_SUMMARY.md](./PRODUCT_MODULE_IMPLEMENTATION_SUMMARY.md)

---

**Need Help?** Check the server logs in `server/logs/combined.log` for detailed error messages.

