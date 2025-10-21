# ShopifyGenie OMS - Backend

## Overview
This is the backend API for ShopifyGenie Order Management System, built with Node.js, Express, GraphQL (Apollo Server), and Prisma.

## Tech Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **API**: GraphQL (Apollo Server)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Cache**: Redis
- **Authentication**: JWT
- **Integrations**: Shopify Admin API

## Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Setup database:
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

4. Start development server:
```bash
npm run dev
```

The server will start at `http://localhost:4000`
GraphQL Playground: `http://localhost:4000/graphql`

## Project Structure

```
src/
├── config/           # Configuration files
├── graphql/          # GraphQL schemas and resolvers
├── integrations/     # External service integrations (Shopify, etc.)
├── middleware/       # Express middleware
├── services/         # Business logic services
├── utils/            # Utility functions
└── app.ts           # Application entry point
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm test` - Run tests

## API Endpoints

### REST
- `GET /health` - Health check endpoint
- `POST /api/webhooks/shopify` - Shopify webhook receiver

### GraphQL
- `POST /graphql` - GraphQL API endpoint
- `GET /graphql` - GraphQL Playground (development only)

## Key Features

### Order Management
- Import and sync orders from Shopify
- Manual order creation
- Order lifecycle management
- Custom tagging and notes

### Fulfillment & Shipping
- Create and manage fulfillments
- Tracking number integration
- Batch shipment processing
- Real-time status updates

### Inventory Management
- Stock synchronization with Shopify
- Warehouse management
- Automatic reorder suggestions
- Reserved inventory tracking

### Returns & Refunds
- Return authorization workflow
- Refund processing
- Return status tracking

### Analytics
- Order analytics and reporting
- Fulfillment SLA tracking
- Inventory analytics
- Return analytics

### Notifications
- Email notifications
- Slack integration
- WhatsApp notifications (optional)

## Authentication

All GraphQL mutations (except login/register) require JWT authentication.

Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Shopify Integration

### Required Scopes
- read_orders, write_orders
- read_products, read_inventory
- read_fulfillments, write_fulfillments
- read_shipping, read_customers

### Webhooks
The system listens to the following Shopify webhooks:
- orders/create
- orders/updated
- orders/cancelled
- fulfillments/create
- fulfillments/update

## Environment Variables

See `.env.example` for all required environment variables.

## License
MIT

