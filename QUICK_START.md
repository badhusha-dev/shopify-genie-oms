# 🚀 Quick Start Guide - ShopifyGenie OMS

Get up and running in 5 minutes!

## ⚡ Prerequisites

- Docker & Docker Compose installed
- Shopify store with API access
- 10 minutes of your time

## 📝 Step-by-Step

### 1️⃣ Get Shopify Credentials (3 minutes)

1. Go to your Shopify Admin
2. Navigate to **Settings** → **Apps and sales channels** → **Develop apps**
3. Click **Create an app** → Name it "ShopifyGenie OMS"
4. Click **Configure Admin API scopes** and select:
   - ✅ `read_orders` & `write_orders`
   - ✅ `read_products` & `read_inventory`
   - ✅ `read_fulfillments` & `write_fulfillments`
   - ✅ `read_shipping` & `read_customers`
5. Click **Install app** and copy:
   - API Key
   - API Secret
   - Admin API Access Token

### 2️⃣ Configure Environment (1 minute)

```bash
# Clone and setup
cd shopify-genie-oms
cp .env.example .env
nano .env  # or use your favorite editor
```

**Minimum required in `.env`:**
```env
JWT_SECRET=generate-a-random-32-character-string
SHOPIFY_API_KEY=your-api-key-from-step-1
SHOPIFY_API_SECRET=your-api-secret-from-step-1
SHOPIFY_ACCESS_TOKEN=your-access-token-from-step-1
SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
```

### 3️⃣ Launch (1 minute)

```bash
# Start everything with one command
docker-compose up -d

# Wait ~30 seconds for services to start
# Watch the logs
docker-compose logs -f
```

### 4️⃣ Access Your System

- 🌐 **Frontend**: http://localhost:3000
- 🔧 **GraphQL Playground**: http://localhost:4000/graphql
- ❤️ **Health Check**: http://localhost:4000/health

### 5️⃣ Create Admin User

**Option A: Using GraphQL Playground**

1. Open http://localhost:4000/graphql
2. Run this mutation:

```graphql
mutation {
  register(input: {
    email: "admin@yourcompany.com"
    password: "SecurePassword123!"
    firstName: "Admin"
    lastName: "User"
    role: ADMIN
  }) {
    id
    email
    role
  }
}
```

**Option B: Using cURL**

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { register(input: { email: \"admin@yourcompany.com\", password: \"SecurePassword123!\", firstName: \"Admin\", lastName: \"User\", role: ADMIN }) { id email role } }"
  }'
```

### 6️⃣ Login and Start Using

1. Go to http://localhost:3000
2. Login with your credentials
3. Navigate to **Settings** → Add your Shopify store
4. Orders will start syncing automatically! 🎉

## 🎯 Quick Commands

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop everything
docker-compose down

# Stop and remove all data
docker-compose down -v

# Update and rebuild
docker-compose up -d --build
```

## 📱 What You Can Do Now

✅ **View Dashboard** - Real-time analytics and KPIs
✅ **Manage Orders** - View, process, and track orders
✅ **Handle Fulfillments** - Create shipments and add tracking
✅ **Track Inventory** - Monitor stock levels and get alerts
✅ **Process Returns** - Manage return requests and refunds
✅ **View Analytics** - Comprehensive business insights

## 🔧 Troubleshooting

### Services won't start?
```bash
docker-compose down -v
docker-compose up -d
```

### Can't connect to frontend?
Check if port 3000 is available:
```bash
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows
```

### Database errors?
Reset the database:
```bash
docker-compose down -v
docker-compose up -d
```

### Shopify sync not working?
1. Verify credentials in `.env`
2. Check webhook configuration in Shopify
3. View logs: `docker-compose logs server`

## 📚 Next Steps

- 📖 Read [README.md](./README.md) for full documentation
- 🔍 Check [API.md](./API.md) for GraphQL API reference
- 🛠️ See [SETUP.md](./SETUP.md) for advanced configuration
- 📊 Review [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for architecture

## 💡 Pro Tips

1. **Generate strong JWT_SECRET**:
   ```bash
   openssl rand -base64 32
   ```

2. **Check service health**:
   ```bash
   curl http://localhost:4000/health
   ```

3. **Access database directly**:
   ```bash
   docker-compose exec postgres psql -U postgres -d shopify_genie_oms
   ```

4. **Run migrations**:
   ```bash
   docker-compose exec server npx prisma migrate deploy
   ```

5. **View Redis data**:
   ```bash
   docker-compose exec redis redis-cli
   ```

## 🆘 Need Help?

- 💬 Check the documentation files
- 🐛 Review logs: `docker-compose logs -f`
- 📧 Contact support
- 🐙 Open an issue on GitHub

---

**That's it! You're ready to manage orders like a pro! 🚀**

*Estimated setup time: 5 minutes | Difficulty: Easy*

