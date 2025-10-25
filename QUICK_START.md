# 🚀 Quick Start Commands - ShopifyGenie OMS

## ⚡ First Time Setup (Run Once)

```bash
# 1. Start Docker containers
docker-compose up -d

# 2. Install server dependencies
cd server && npm install

# 3. Install client dependencies  
cd ../client && npm install

# 4. Setup database (from server directory)
cd ../server
npm run db:setup

# 5. Done! Proceed to "Daily Development" section below
```

---

## 💻 Daily Development

```bash
# Terminal 1 - Start Backend
cd server
npm run dev

# Terminal 2 - Start Frontend  
cd client
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- GraphQL: http://localhost:4000/graphql

**Login:**
- Email: `admin@shopifygenie.com`
- Password: `admin123`

---

## 🔧 Useful Commands

### Database

```bash
# View database in browser
npm run prisma:studio

# Reset database (delete all data)
npm run prisma:migrate:reset

# Create new admin user
npm run seed
```

### Docker

```bash
# View running containers
docker ps

# View logs
docker logs shopifygenie_postgres
docker logs shopifygenie_redis

# Restart containers
docker-compose restart

# Stop containers
docker-compose down

# Stop and delete all data
docker-compose down -v
```

### Testing

```bash
# Test GraphQL (in GraphQL playground at http://localhost:4000/graphql)

# Login
mutation {
  login(email: "admin@shopifygenie.com", password: "admin123") {
    accessToken
    refreshToken
    user { id email firstName lastName role }
  }
}

# Get current user (set Authorization: Bearer TOKEN in headers)
query {
  me { id email firstName lastName role }
}
```

---

## 🐛 Troubleshooting

### Port 4000 already in use?

```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:4000 | xargs kill -9
```

### Database connection error?

```bash
# Restart Docker containers
docker-compose down
docker-compose up -d

# Wait 10 seconds, then:
cd server
npm run db:setup
```

### Prisma client errors?

```bash
cd server
npm run prisma:generate
```

---

**Full documentation:** See `INFRASTRUCTURE_SETUP_GUIDE.md`
