# ShopifyGenie OMS - Setup Guide

This guide will walk you through setting up the ShopifyGenie Order Management System from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Docker** and **Docker Compose** - [Download](https://www.docker.com/products/docker-desktop)
- **PostgreSQL** (v14 or higher) - Only if running without Docker
- **Redis** (v6 or higher) - Only if running without Docker
- **Shopify Store** with Admin API access

## Step 1: Clone and Configure

### 1.1 Clone the Repository

```bash
git clone <repository-url>
cd shopify-genie-oms
```

### 1.2 Configure Environment Variables

Create environment files from examples:

```bash
# Root environment for Docker Compose
cp .env.example .env

# Server environment (if running manually)
cp server/.env.example server/.env

# Client environment (if running manually)
cp client/.env.example client/.env
```

### 1.3 Update Environment Variables

Edit `.env` and configure:

#### Required Settings

```env
# Strong JWT secret (use a password generator)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Shopify API credentials
SHOPIFY_API_KEY=your-shopify-api-key
SHOPIFY_API_SECRET=your-shopify-api-secret
SHOPIFY_ACCESS_TOKEN=your-shopify-access-token
SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
```

#### Optional Settings

```env
# Email notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@shopifygenie.com

# Slack integration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Shipping provider (Shippo)
SHIPPO_API_KEY=your-shippo-api-key
```

## Step 2: Get Shopify API Credentials

### 2.1 Create a Shopify Private App

1. Log in to your Shopify admin
2. Go to **Settings** → **Apps and sales channels**
3. Click **Develop apps** → **Create an app**
4. Name your app "ShopifyGenie OMS"
5. Click **Configure Admin API scopes**

### 2.2 Select Required Scopes

Check the following scopes:
- ✅ `read_orders`
- ✅ `write_orders`
- ✅ `read_products`
- ✅ `read_inventory`
- ✅ `read_fulfillments`
- ✅ `write_fulfillments`
- ✅ `read_shipping`
- ✅ `read_customers`

### 2.3 Install the App

1. Click **Install app**
2. Copy the **Admin API access token** (save this securely!)
3. Copy the **API key** and **API secret key**

### 2.4 Configure Webhooks

1. In your app, go to **API credentials** → **Webhooks**
2. Add the following webhooks (pointing to your domain):

```
https://your-domain.com/api/webhooks/shopify
```

Subscribe to these topics:
- `orders/create`
- `orders/updated`
- `orders/cancelled`
- `fulfillments/create`
- `fulfillments/update`

## Step 3: Installation Methods

Choose one of the following methods:

### Option A: Docker (Recommended)

This is the easiest method and includes all services.

```bash
# Start all services
docker-compose up -d

# Wait for services to start (about 30 seconds)
docker-compose logs -f

# Run database migrations
docker-compose exec server npx prisma migrate deploy

# Create initial admin user (run this once)
docker-compose exec server npx prisma db seed
```

Access the application:
- **Frontend**: http://localhost:3000
- **GraphQL API**: http://localhost:4000/graphql
- **API Health**: http://localhost:4000/health

### Option B: Manual Setup (Development)

Run services manually for development.

#### 1. Start PostgreSQL and Redis

```bash
# Option 1: Use Docker for databases only
docker run -d -p 5432:5432 \
  -e POSTGRES_DB=shopify_genie_oms \
  -e POSTGRES_PASSWORD=postgres \
  --name shopify-oms-db postgres:15

docker run -d -p 6379:6379 --name shopify-oms-redis redis:7-alpine

# Option 2: Use locally installed PostgreSQL and Redis
# Make sure they're running on default ports
```

#### 2. Setup Backend

```bash
cd server

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Start development server
npm run dev
```

Backend will start on http://localhost:4000

#### 3. Setup Frontend

Open a new terminal:

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will start on http://localhost:3000

## Step 4: Create First Admin User

### Using Prisma Studio

```bash
cd server
npm run prisma:studio
```

1. Open http://localhost:5555
2. Go to the `User` model
3. Click **Add record**
4. Fill in:
   - email: `admin@shopifygenie.com`
   - password: Use bcrypt hash (you'll need to hash it first)
   - firstName: `Admin`
   - lastName: `User`
   - role: `ADMIN`
   - isActive: `true`

### Using GraphQL Mutation

1. Go to http://localhost:4000/graphql
2. Run this mutation:

```graphql
mutation {
  register(input: {
    email: "admin@shopifygenie.com"
    password: "YourSecurePassword123!"
    firstName: "Admin"
    lastName: "User"
    role: ADMIN
  }) {
    id
    email
    firstName
    lastName
    role
  }
}
```

## Step 5: Login and Test

1. Open http://localhost:3000
2. Login with your admin credentials
3. You should see the dashboard

## Step 6: Connect Your Shopify Store

### 6.1 Add Store via Settings

1. Go to **Settings** in the app
2. Click **Connect Shopify Store**
3. Enter your store details:
   - Store Name
   - Shopify Domain
   - Store ID (from Shopify admin)
   - Access Token

### 6.2 Initial Sync

The system will automatically:
- Import existing orders
- Sync product catalog
- Update inventory levels
- Set up webhook listeners

## Step 7: Production Deployment

### 7.1 Update Environment

```bash
# Set production environment
NODE_ENV=production

# Use strong secrets
JWT_SECRET=<generate-with-openssl-rand-base64-32>

# Update frontend URL
FRONTEND_URL=https://your-domain.com
```

### 7.2 SSL Certificate

Place your SSL certificates in `nginx/ssl/`:
- `cert.pem` - Certificate
- `key.pem` - Private key

### 7.3 Update Nginx Configuration

Edit `nginx/nginx.conf` and uncomment the HTTPS server block, updating the domain name.

### 7.4 Deploy

```bash
# Build and start in production mode
docker-compose up -d --build

# Check health
curl https://your-domain.com/health
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d
```

### Port Conflicts

If ports 3000, 4000, 5432, or 6379 are in use, update `docker-compose.yml`:

```yaml
services:
  server:
    ports:
      - "4001:4000"  # Change external port
```

### Shopify Webhook Issues

1. Check webhook endpoint is publicly accessible
2. Verify HTTPS is configured
3. Check webhook secret matches `.env`
4. View webhook delivery attempts in Shopify admin

### Permission Issues

```bash
# Fix file permissions
chmod -R 755 shopify-genie-oms

# Fix Docker permissions
sudo chown -R $USER:$USER shopify-genie-oms
```

## Next Steps

- 📚 Read the [README.md](./README.md) for full documentation
- 🎯 Explore the GraphQL API at http://localhost:4000/graphql
- 📊 Check the analytics dashboard
- ⚙️ Configure automation rules
- 📧 Set up email notifications
- 🔔 Connect Slack for real-time alerts

## Support

For issues or questions:
- Check the [README.md](./README.md)
- Review Docker logs: `docker-compose logs`
- Open an issue on GitHub

---

Happy order management! 🚀

