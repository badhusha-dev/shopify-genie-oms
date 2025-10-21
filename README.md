<div align="center">
  <img src="./client/public/logo.svg" alt="ShopifyGenie OMS Logo" width="200"/>
  
  # ShopifyGenie OMS
  
  ### ✨ Smarter Orders. Seamless Fulfillment. ✨
  
  <p>
    <strong>Enterprise-grade Order Management System for Shopify</strong>
  </p>
  
  <p>
    <a href="#features">Features</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#documentation">Documentation</a>
  </p>

  <img src="https://img.shields.io/badge/Vue.js-3.3-42b883?style=for-the-badge&logo=vue.js" alt="Vue 3"/>
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js" alt="Node.js"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/GraphQL-16.8-e10098?style=for-the-badge&logo=graphql" alt="GraphQL"/>
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL"/>
</div>

---

## 🎯 Overview

**ShopifyGenie OMS** is a powerful, modern order management system designed specifically for Shopify merchants who need advanced order tracking, fulfillment automation, and real-time analytics. Built with scalability and performance in mind, it seamlessly integrates with Shopify's Admin API to provide a comprehensive solution for managing e-commerce operations.

### Why ShopifyGenie OMS?

- 🚀 **Real-time Sync** - Instant order synchronization with Shopify stores
- 📊 **Advanced Analytics** - Comprehensive insights into orders, fulfillments, and returns
- 🔄 **Workflow Automation** - Rule-based order processing and notifications
- 🎨 **Modern UI/UX** - Beautiful, responsive interface with dark mode support
- 🔐 **Enterprise Security** - Role-based access control with JWT authentication
- ⚡ **High Performance** - Built with Redis caching and optimized database queries

---

## ✨ Features

### 📦 Order Management
- **Real-time Order Tracking** - Monitor order lifecycle from creation to delivery
- **Advanced Filtering** - Search by status, customer, product, date range
- **Bulk Operations** - Process multiple orders simultaneously
- **Manual Order Creation** - Create orders directly in the system
- **Order Timeline** - Visual representation of order history and updates
- **Tagging System** - Organize orders with custom tags

### 🚚 Fulfillment
- **Multi-Carrier Support** - Integration with major shipping providers
- **Batch Fulfillment** - Process multiple shipments efficiently
- **Tracking Management** - Automated tracking number updates to Shopify
- **Warehouse Integration** - Sync with multiple fulfillment locations
- **Label Printing** - Generate shipping labels directly from the platform
- **Fulfillment Analytics** - Track on-time delivery and performance metrics

### 🔄 Returns Management
- **RMA Processing** - Streamlined return merchandise authorization
- **Refund Automation** - Automated refund processing with Shopify
- **Return Reasons** - Track and analyze return causes
- **Restocking** - Automatic inventory adjustments
- **Return Analytics** - Identify return patterns and reduce rate

### 📊 Analytics & Reporting
- **Sales Dashboard** - Real-time revenue and order metrics
- **Top Products** - Best-selling items and trends
- **Geographic Analysis** - Order distribution by region
- **Performance KPIs** - Fulfillment speed, return rates, customer satisfaction
- **Custom Reports** - Exportable CSV and PDF reports
- **Revenue Forecasting** - Predictive analytics for planning

### ⚙️ Automation & Workflows
- **Rule Engine** - Create custom automation rules
- **Auto-Tagging** - Automatically tag orders based on criteria
- **Smart Notifications** - Slack, email, and webhook integrations
- **Scheduled Tasks** - Automated daily/weekly operations
- **API Webhooks** - Real-time event notifications

### 🔐 Security & Access Control
- **Role-Based Access** - Admin, Manager, Fulfillment, Support roles
- **JWT Authentication** - Secure token-based authentication
- **Audit Logs** - Complete action history tracking
- **API Key Management** - Secure Shopify integration
- **Two-Factor Auth** - Optional 2FA for enhanced security

---

## 🛠️ Tech Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework with Composition API
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Pinia** - State management
- **Apollo Client** - GraphQL client
- **Vue Router** - Client-side routing
- **Heroicons** - Beautiful hand-crafted icons

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Fast, minimalist web framework
- **Apollo GraphQL** - GraphQL server
- **Prisma ORM** - Type-safe database client
- **PostgreSQL** - Robust relational database
- **Redis** - In-memory caching
- **JWT** - JSON Web Token authentication
- **Shopify API** - Official Shopify Node.js library

### DevOps & Tools
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and load balancing
- **Winston** - Logging
- **Jest** - Testing framework

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 20+ and npm
- **Docker** and Docker Compose
- **Shopify Store** with API access
- **PostgreSQL** 15+ (or use Docker)
- **Redis** 7+ (or use Docker)

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/badhusha-dev/shopify-genie-oms.git
cd shopify-genie-oms
```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server && npm install

   # Install client dependencies
   cd ../client && npm install
   ```

3. **Configure environment**
```bash
   # Copy example env file
   cp server/.env.example server/.env
   
   # Edit with your credentials
   nano server/.env
   ```

4. **Start database services**
```bash
   # Start PostgreSQL and Redis with Docker
   docker-compose up -d postgres redis
   ```

5. **Run database migrations**
```bash
cd server
   npx prisma migrate dev
   npx prisma generate
   ```

6. **Start the application**
```bash
   # Terminal 1 - Backend
   cd server && npm run dev
   
   # Terminal 2 - Frontend
   cd client && npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - GraphQL API: http://localhost:4000/graphql
   - Health Check: http://localhost:4000/health

---

## 📖 Documentation

### Configuration

Create a `server/.env` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres_password@localhost:5432/shopify_genie_oms

# Redis
REDIS_URL=redis://localhost:6379

# Server
NODE_ENV=development
PORT=4000

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# Shopify Integration
SHOPIFY_API_KEY=your-shopify-api-key
SHOPIFY_API_SECRET=your-shopify-api-secret
SHOPIFY_ACCESS_TOKEN=your-access-token
SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
SHOPIFY_SCOPES=read_orders,write_orders,read_products,read_inventory,read_fulfillments,write_fulfillments

# Frontend
FRONTEND_URL=http://localhost:3000

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@shopifygenie.com

# Slack (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Shopify Setup

1. **Create a Custom App** in your Shopify Admin
2. **Configure API Scopes** - Select required permissions
3. **Install the App** and copy API credentials
4. **Set up Webhooks** for real-time synchronization
- `orders/create`
- `orders/updated`
- `orders/cancelled`
- `fulfillments/create`
- `fulfillments/update`

### API Documentation

Full API documentation available at:
- GraphQL Playground: http://localhost:4000/graphql
- API Reference: [API.md](./API.md)

---

## 🎨 Branding

### Color Palette

- **Primary Blue**: #1F8EF1 - Trust, technology, efficiency
- **Emerald Green**: #2ECC71 - Growth, success, fulfillment
- **Gradients**: Smooth transitions between blue and emerald

### Logo Usage

The ShopifyGenie logo combines:
- A **magic lamp** representing the "Genie" - wish fulfillment
- A **shopping bag** representing Shopify commerce
- **Flow lines** representing data synchronization

---

## 🧪 Testing

```bash
# Run backend tests
cd server && npm test

# Run frontend tests
cd client && npm test

# Run e2e tests
npm run test:e2e
```

---

## 📦 Deployment

### Docker Production

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Production Build

```bash
# Build frontend
cd client && npm run build

# Build backend
cd server && npm run build

# Start production server
cd server && npm start
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Shopify** for their excellent API and developer tools
- **Vue.js Team** for the amazing framework
- **Prisma** for the best-in-class ORM
- All our contributors and users

---

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/badhusha-dev/shopify-genie-oms/issues)
- **Email**: support@shopifygenie.com
- **Documentation**: [Full Documentation](./docs/)

---

<div align="center">
  <p>Made with ❤️ by the ShopifyGenie Team</p>
  <p>
    <a href="https://github.com/badhusha-dev/shopify-genie-oms">GitHub</a> •
    <a href="https://shopifygenie.com">Website</a> •
    <a href="https://twitter.com/shopifygenie">Twitter</a>
  </p>
</div>
