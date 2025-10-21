# ShopifyGenie OMS - Order Management System

A comprehensive order lifecycle management platform that integrates Shopify with advanced logistics, fulfillment, and analytics.

## 🚀 Features

### Core Modules

1. **Order Management**
   - Import and sync orders via Shopify API
   - Order lifecycle management (Pending → Processed → Shipped → Delivered)
   - Custom tagging and notes per order
   - Multi-store order handling
   - Manual order creation

2. **Fulfillment & Shipping**
   - Integration with delivery providers (Shippo, EasyParcel, or manual tracking)
   - Batch shipment creation
   - Label generation and print support
   - Real-time status update webhooks

3. **Inventory Management**
   - Stock sync with Shopify products
   - Warehouse management
   - Automatic reorder suggestions
   - Reserved inventory tracking

4. **Returns & Refunds**
   - Return authorization and status tracking
   - Refund processing integration
   - Reporting dashboard

5. **Analytics & Reporting**
   - Order summary dashboard
   - Top-selling products
   - Fulfillment SLA reports
   - Delayed shipment analysis

6. **Notifications & Automation**
   - Email / Slack / WhatsApp notifications for order status changes
   - Rule-based automation (e.g., auto-fulfill small orders)

## 🏗️ Architecture

| Layer | Technology | Description |
|-------|-----------|-------------|
| Frontend | Vue 3 + TypeScript + Vite + Tailwind | Modern animated UI for real-time order tracking |
| Backend | Node.js (Express + GraphQL) | Unified API for Shopify data + internal operations |
| Database | PostgreSQL (Prisma ORM) | Persistent store for orders, fulfillment, and analytics |
| Integration | Shopify Admin API 2025 + Webhooks | Full Shopify sync (orders, inventory, refunds, shipping) |
| Auth | JWT + Role-based Access | Admin, Fulfillment, Support, and Manager roles |
| Deployment | Docker + Nginx + PM2 | Production-ready containerized setup |

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Docker & Docker Compose (for containerized deployment)
- Shopify Store with API access

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd shopify-genie-oms
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your Shopify credentials and other configuration:
- `SHOPIFY_API_KEY` - Your Shopify API key
- `SHOPIFY_API_SECRET` - Your Shopify API secret
- `SHOPIFY_ACCESS_TOKEN` - Shopify access token
- `SHOPIFY_SHOP_DOMAIN` - Your Shopify store domain
- `JWT_SECRET` - Strong secret for JWT tokens (change in production!)

### 3. Docker Deployment (Recommended)

Run the entire stack with Docker Compose:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Redis cache on port 6379
- Backend API server on port 4000
- Frontend client on port 3000
- Nginx reverse proxy on port 80

Access the application:
- Frontend: http://localhost:3000
- GraphQL API: http://localhost:4000/graphql
- Nginx (Production): http://localhost

### 4. Manual Setup (Development)

#### Backend Setup

```bash
cd server
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

#### Frontend Setup

```bash
cd client
npm install

# Start development server
npm run dev
```

## 📁 Project Structure

```
shopify-genie-oms/
├── server/                 # Backend API
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── graphql/       # GraphQL schemas and resolvers
│   │   ├── integrations/  # External service integrations
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Business logic services
│   │   ├── utils/         # Utility functions
│   │   └── app.ts        # Application entry point
│   ├── prisma/           # Database schema
│   └── Dockerfile        # Backend Docker configuration
│
├── client/               # Frontend Application
│   ├── src/
│   │   ├── assets/      # Static assets
│   │   ├── components/  # Vue components
│   │   ├── layouts/     # Layout components
│   │   ├── router/      # Vue Router configuration
│   │   ├── stores/      # Pinia stores
│   │   ├── views/       # Page components
│   │   └── main.ts     # Application entry point
│   └── Dockerfile       # Frontend Docker configuration
│
├── nginx/               # Nginx configuration
│   └── nginx.conf      # Reverse proxy configuration
│
└── docker-compose.yml  # Docker Compose configuration
```

## 🔑 API Documentation

### GraphQL API

The GraphQL API is available at `/graphql` and provides a complete interface for:
- Order management
- Fulfillment operations
- Inventory tracking
- Return processing
- Analytics and reporting

### Authentication

All API requests (except login/register) require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **ADMIN**: Full system access
- **MANAGER**: Order and fulfillment management
- **FULFILLMENT**: Fulfillment and shipping operations
- **SUPPORT**: Read-only access and customer support

## 🔗 Shopify Integration

### Required Scopes

- `read_orders`, `write_orders`
- `read_products`, `read_inventory`
- `read_fulfillments`, `write_fulfillments`
- `read_shipping`, `read_customers`

### Webhooks

The system listens to these Shopify webhooks:
- `orders/create`
- `orders/updated`
- `orders/cancelled`
- `fulfillments/create`
- `fulfillments/update`

Configure webhooks in your Shopify admin to point to:
```
https://your-domain.com/api/webhooks/shopify
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose up -d --build

# Run database migrations
docker-compose exec server npx prisma migrate deploy

# Access database
docker-compose exec postgres psql -U postgres -d shopify_genie_oms
```

## 🛠️ Development

### Backend Development

```bash
cd server
npm run dev          # Start development server
npm run build        # Build for production
npm run prisma:studio # Open Prisma Studio
npm test            # Run tests
```

### Frontend Development

```bash
cd client
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
```

## 📊 Database Management

### Migrations

```bash
# Create a new migration
npm run prisma:migrate

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Prisma Studio

Access the database GUI:

```bash
npm run prisma:studio
```

## 🔒 Security

- JWT-based authentication
- Role-based access control (RBAC)
- Rate limiting on API endpoints
- HTTPS support (configure in nginx)
- Environment variable protection
- SQL injection prevention (Prisma ORM)
- XSS protection headers

## 🚀 Production Deployment

1. Update environment variables in `.env`
2. Set strong `JWT_SECRET`
3. Configure SSL certificates in `nginx/ssl/`
4. Update `nginx/nginx.conf` with your domain
5. Run `docker-compose up -d --build`

## 📝 License

MIT

## 🤝 Support

For support, please open an issue in the repository or contact the development team.

---

Built with ❤️ using Vue 3, Node.js, GraphQL, and Shopify API

