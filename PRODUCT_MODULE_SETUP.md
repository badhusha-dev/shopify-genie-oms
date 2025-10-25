# 🛍️ Product Module Setup Guide

## Overview

This guide walks you through setting up the complete Product Module for ShopifyGenie OMS with Shopify integration.

## ✅ What's Been Implemented

### 1. Database Models
- **ShopifyProduct** - Master product catalog from Shopify
- **ShopifyProductVariant** - Product variants with SKU, price, and inventory
- **Store** - Updated to support Shopify products relationship

### 2. Backend Services
- **ProductService** - Complete business logic for product management
  - Product sync from Shopify
  - CRUD operations
  - Search and filtering
  - Statistics and analytics
  - Inventory tracking

### 3. REST API Endpoints
All endpoints require authentication via JWT Bearer token.

#### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/search?q=keyword` - Search products
- `GET /api/products/stats/:storeId` - Get product statistics
- `POST /api/products/sync` - Sync from Shopify
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Archive product

#### Variants
- `GET /api/products/:productId/variants` - Get product variants
- `GET /api/products/variants/:id` - Get variant by ID
- `PUT /api/products/variants/:id` - Update variant

### 4. Features
- ✅ Full Shopify REST API integration
- ✅ Automatic pagination handling
- ✅ Product and variant sync
- ✅ Inventory tracking
- ✅ Search functionality
- ✅ Product statistics
- ✅ Secure token encryption/decryption
- ✅ Comprehensive error handling
- ✅ Audit logging

## 🚀 Setup Instructions

### Step 1: Start Docker Services

Make sure Docker Desktop is running, then start the services:

```bash
docker-compose up -d
```

Verify services are running:
```bash
docker-compose ps
```

You should see:
- ✅ `shopifygenie_postgres` - PostgreSQL database
- ✅ `shopifygenie_redis` - Redis cache

### Step 2: Configure Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Database
DATABASE_URL="postgresql://shopify:shopify_pass@localhost:5432/shopifygenie"

# JWT Configuration
JWT_SECRET="your-super-secure-secret-key-here"
JWT_REFRESH_SECRET="your-refresh-token-secret-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Encryption Key (32 characters)
ENCRYPTION_KEY="your-32-character-encryption-key"

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Redis
REDIS_URL="redis://localhost:6379"

# Shopify (if using webhooks)
SHOPIFY_WEBHOOK_SECRET="your-shopify-webhook-secret"
```

### Step 3: Run Database Migration

Navigate to the server directory and run the migration:

```bash
cd server
npx prisma migrate dev --name add_shopify_product_module
```

This will:
- Create the `ShopifyProduct` table
- Create the `ShopifyProductVariant` table
- Update the `Store` table with new relationships

### Step 4: Verify Migration

Check that the migration was successful:

```bash
npx prisma studio
```

This opens Prisma Studio where you can view your database schema.

### Step 5: Start the Backend Server

```bash
npm run dev
```

The server should start on `http://localhost:3001`

## 🧪 Testing the API

### 1. Login (Get JWT Token)

```bash
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "admin@shopifygenie.com",
  "password": "Admin@123"
}
```

Save the `accessToken` from the response.

### 2. Sync Products from Shopify

```bash
POST http://localhost:3001/api/products/sync
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "storeId": "your-store-uuid-here"
}
```

Response:
```json
{
  "success": true,
  "message": "Products synced successfully",
  "data": {
    "success": true,
    "productsCount": 56,
    "variantsCount": 134,
    "totalProducts": 56
  }
}
```

### 3. List All Products

```bash
GET http://localhost:3001/api/products?storeId=your-store-id
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 4. Search Products

```bash
GET http://localhost:3001/api/products/search?q=shirt&storeId=your-store-id
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 5. Get Product Statistics

```bash
GET http://localhost:3001/api/products/stats/your-store-id
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Response:
```json
{
  "success": true,
  "data": {
    "totalProducts": 56,
    "totalVariants": 134,
    "activeProducts": 54,
    "lowStockVariants": 12,
    "outOfStockVariants": 3
  }
}
```

### 6. Update Product

```bash
PUT http://localhost:3001/api/products/product-uuid-here
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "title": "Blue T-Shirt (Limited Edition)",
  "productType": "Apparel",
  "status": "active"
}
```

### 7. Update Variant Price/Inventory

```bash
PUT http://localhost:3001/api/products/variants/variant-uuid-here
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "price": 42.99,
  "inventoryQty": 60
}
```

## 📋 Shopify Requirements

### Required Scopes

Ensure your Shopify App has these scopes:

1. **read_products** - Read product data
2. **write_products** - Update product data
3. **read_inventory** - Read inventory levels
4. **write_inventory** - Update inventory levels

### Configure in Shopify Partner Dashboard

1. Go to your app in the Shopify Partners dashboard
2. Navigate to **Configuration** → **App setup**
3. Under **Admin API access scopes**, select:
   - `read_products`
   - `write_products`
   - `read_inventory`
   - `write_inventory`
4. Save and reinstall the app if needed

## 🔐 Security Features

- ✅ JWT authentication on all endpoints
- ✅ Encrypted Shopify access tokens (AES-256-CBC)
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Request validation

## 📊 Database Schema

### ShopifyProduct
```prisma
model ShopifyProduct {
  id          String   @id @default(uuid())
  shopifyId   String   @unique
  storeId     String
  title       String
  handle      String?
  productType String?
  vendor      String?
  status      String   @default("active")
  tags        String[]
  imageUrl    String?
  description String?  @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  store       Store                   @relation("ShopifyProducts")
  variants    ShopifyProductVariant[]
}
```

### ShopifyProductVariant
```prisma
model ShopifyProductVariant {
  id              String   @id @default(uuid())
  shopifyId       String   @unique
  productId       String
  title           String
  sku             String?
  price           Decimal  @db.Decimal(10, 2)
  compareAtPrice  Decimal? @db.Decimal(10, 2)
  inventoryQty    Int      @default(0)
  inventoryPolicy String?
  barcode         String?
  weight          Decimal? @db.Decimal(10, 3)
  weightUnit      String?  @default("kg")
  position        Int?
  imageUrl        String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  product ShopifyProduct @relation(fields: [productId])
}
```

## 🔄 Next Steps (Optional Enhancements)

### 1. Webhook Integration
Add Shopify webhooks for real-time sync:
- `products/create` - Auto-import new products
- `products/update` - Auto-update product changes
- `products/delete` - Auto-archive deleted products
- `inventory_levels/update` - Real-time inventory sync

### 2. Caching Layer
Add Redis caching for frequently accessed data:
- Product lists
- Search results
- Statistics

### 3. Batch Operations
Add bulk update endpoints:
- Bulk price updates
- Bulk inventory updates
- Bulk status changes

### 4. Analytics & Reports
- Most sold products
- Low stock alerts
- Price history tracking
- Inventory forecasting

### 5. Product Import/Export
- CSV import for bulk product creation
- CSV export for reporting
- Product templates

## 🐛 Troubleshooting

### Migration Fails
```bash
# Reset database (WARNING: destroys all data)
npx prisma migrate reset

# Then run migration again
npx prisma migrate dev --name add_shopify_product_module
```

### Sync Fails with 401 Error
- Check that the Store has a valid `encryptedToken`
- Verify the ENCRYPTION_KEY in .env matches the key used to encrypt the token
- Ensure the Shopify access token hasn't expired

### Docker Connection Issues
```bash
# Restart Docker containers
docker-compose down
docker-compose up -d

# Check logs
docker-compose logs postgres
docker-compose logs redis
```

### Port Already in Use
```bash
# Change the port in docker-compose.yml or stop the conflicting service
lsof -ti:5432 | xargs kill -9  # macOS/Linux
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5432).OwningProcess  # Windows
```

## 📚 API Documentation

For complete API documentation with examples, see [API.md](./API.md)

## 🎉 Success!

Your Product Module is now fully integrated with:
- ✅ PostgreSQL database with Prisma ORM
- ✅ RESTful API endpoints
- ✅ Shopify integration
- ✅ Secure authentication
- ✅ Production-ready architecture

Start syncing products and building amazing features! 🚀

