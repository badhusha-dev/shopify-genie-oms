# 🚀 Product API Quick Reference

## Base URL
```
http://localhost:3001/api/products
```

## Authentication
All endpoints require JWT Bearer token in the Authorization header:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## 📋 Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products/search?q=keyword` | Search products |
| GET | `/api/products/stats/:storeId` | Product statistics |
| GET | `/api/products/:id` | Get product by ID |
| GET | `/api/products/:productId/variants` | Get product variants |
| GET | `/api/products/variants/:id` | Get variant by ID |
| POST | `/api/products/sync` | Sync from Shopify |
| PUT | `/api/products/:id` | Update product |
| PUT | `/api/products/variants/:id` | Update variant |
| DELETE | `/api/products/:id` | Archive product |

---

## 📖 Detailed Examples

### 1. List All Products

```bash
GET /api/products?storeId={storeId}&includeVariants=true
```

**Query Parameters:**
- `storeId` (optional) - Filter by store UUID
- `includeVariants` (optional) - Include variants (default: true)

**Response:**
```json
{
  "success": true,
  "count": 56,
  "data": [
    {
      "id": "uuid",
      "shopifyId": "1234567890",
      "storeId": "store-uuid",
      "title": "Blue T-Shirt",
      "handle": "blue-t-shirt",
      "productType": "Apparel",
      "vendor": "Nike",
      "status": "active",
      "tags": ["summer", "sale"],
      "imageUrl": "https://cdn.shopify.com/...",
      "description": "Comfortable cotton t-shirt",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T14:22:00Z",
      "variants": [
        {
          "id": "variant-uuid",
          "shopifyId": "9876543210",
          "title": "Blue T-Shirt / M",
          "sku": "BLUE-TSHIRT-M",
          "price": 39.99,
          "compareAtPrice": 49.99,
          "inventoryQty": 50,
          "barcode": "123456789",
          "weight": 0.25,
          "weightUnit": "kg"
        }
      ]
    }
  ]
}
```

---

### 2. Sync Products from Shopify

```bash
POST /api/products/sync
Content-Type: application/json

{
  "storeId": "your-store-uuid"
}
```

**Response:**
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

**Features:**
- ✅ Handles pagination automatically
- ✅ Syncs up to 1000+ products
- ✅ Upserts (updates existing, creates new)
- ✅ Updates store's `lastSyncAt` timestamp

---

### 3. Search Products

```bash
GET /api/products/search?q=shirt&storeId={storeId}
```

**Query Parameters:**
- `q` (required) - Search keyword
- `storeId` (optional) - Filter by store

**Searches in:**
- Product title
- Product type
- Vendor name
- Variant SKU

**Response:**
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "id": "uuid",
      "title": "Blue Polo Shirt",
      "variants": [...]
    }
  ]
}
```

---

### 4. Get Product Statistics

```bash
GET /api/products/stats/{storeId}
```

**Response:**
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

**Definitions:**
- `lowStockVariants` - Variants with inventory ≤ 10
- `outOfStockVariants` - Variants with inventory = 0

---

### 5. Get Single Product

```bash
GET /api/products/{productId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "shopifyId": "1234567890",
    "title": "Blue T-Shirt",
    "handle": "blue-t-shirt",
    "productType": "Apparel",
    "vendor": "Nike",
    "status": "active",
    "tags": ["summer", "sale"],
    "imageUrl": "https://cdn.shopify.com/...",
    "description": "Comfortable cotton t-shirt",
    "variants": [
      {
        "id": "variant-uuid",
        "title": "Blue T-Shirt / M",
        "sku": "BLUE-TSHIRT-M",
        "price": 39.99,
        "inventoryQty": 50
      }
    ],
    "store": {
      "id": "store-uuid",
      "name": "My Store",
      "shopifyDomain": "mystore.myshopify.com"
    }
  }
}
```

---

### 6. Update Product

```bash
PUT /api/products/{productId}
Content-Type: application/json

{
  "title": "Blue T-Shirt (Limited Edition)",
  "productType": "Apparel",
  "status": "active",
  "vendor": "Nike",
  "tags": ["summer", "sale", "limited"],
  "description": "Updated description"
}
```

**Updatable Fields:**
- `title` - Product title
- `productType` - Product type/category
- `status` - Product status (active, draft, archived)
- `vendor` - Vendor/brand name
- `tags` - Array of tags
- `description` - Product description

**Response:**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": "uuid",
    "title": "Blue T-Shirt (Limited Edition)",
    "productType": "Apparel",
    "status": "active",
    "updatedAt": "2024-01-21T09:15:00Z"
  }
}
```

---

### 7. Get Product Variants

```bash
GET /api/products/{productId}/variants
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "variant-uuid-1",
      "shopifyId": "111111",
      "title": "Blue T-Shirt / S",
      "sku": "BLUE-TSHIRT-S",
      "price": 39.99,
      "inventoryQty": 25,
      "position": 1
    },
    {
      "id": "variant-uuid-2",
      "shopifyId": "222222",
      "title": "Blue T-Shirt / M",
      "sku": "BLUE-TSHIRT-M",
      "price": 39.99,
      "inventoryQty": 50,
      "position": 2
    },
    {
      "id": "variant-uuid-3",
      "shopifyId": "333333",
      "title": "Blue T-Shirt / L",
      "sku": "BLUE-TSHIRT-L",
      "price": 39.99,
      "inventoryQty": 30,
      "position": 3
    }
  ]
}
```

---

### 8. Get Single Variant

```bash
GET /api/products/variants/{variantId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "variant-uuid",
    "shopifyId": "1234567890",
    "productId": "product-uuid",
    "title": "Blue T-Shirt / M",
    "sku": "BLUE-TSHIRT-M",
    "price": 39.99,
    "compareAtPrice": 49.99,
    "inventoryQty": 50,
    "inventoryPolicy": "deny",
    "barcode": "123456789",
    "weight": 0.25,
    "weightUnit": "kg",
    "position": 2,
    "imageUrl": "https://cdn.shopify.com/...",
    "product": {
      "id": "product-uuid",
      "title": "Blue T-Shirt",
      "handle": "blue-t-shirt"
    }
  }
}
```

---

### 9. Update Variant

```bash
PUT /api/products/variants/{variantId}
Content-Type: application/json

{
  "price": 42.99,
  "compareAtPrice": 54.99,
  "inventoryQty": 60,
  "sku": "BLUE-TSHIRT-M-V2",
  "barcode": "987654321"
}
```

**Updatable Fields:**
- `price` - Regular price (number)
- `compareAtPrice` - Compare at price (number, optional)
- `inventoryQty` - Inventory quantity (integer)
- `sku` - Stock keeping unit (string)
- `barcode` - Product barcode (string)

**Response:**
```json
{
  "success": true,
  "message": "Variant updated successfully",
  "data": {
    "id": "variant-uuid",
    "price": 42.99,
    "compareAtPrice": 54.99,
    "inventoryQty": 60,
    "sku": "BLUE-TSHIRT-M-V2",
    "barcode": "987654321",
    "updatedAt": "2024-01-21T10:30:00Z"
  }
}
```

---

### 10. Archive Product

```bash
DELETE /api/products/{productId}
```

**Note:** This performs a soft delete by setting status to "archived"

**Response:**
```json
{
  "success": true,
  "message": "Product archived successfully",
  "data": {
    "id": "uuid",
    "title": "Blue T-Shirt",
    "status": "archived",
    "updatedAt": "2024-01-21T11:00:00Z"
  }
}
```

---

## ❌ Error Responses

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```
or
```json
{
  "error": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Product not found"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Store ID is required"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to sync products",
  "error": "Detailed error message"
}
```

---

## 🔧 cURL Examples

### Sync Products
```bash
curl -X POST http://localhost:3001/api/products/sync \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"storeId": "store-uuid"}'
```

### List Products
```bash
curl -X GET "http://localhost:3001/api/products?storeId=store-uuid" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Search Products
```bash
curl -X GET "http://localhost:3001/api/products/search?q=shirt&storeId=store-uuid" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Variant
```bash
curl -X PUT http://localhost:3001/api/products/variants/variant-uuid \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price": 42.99, "inventoryQty": 60}'
```

---

## 📊 Rate Limiting

- **Limit:** 100 requests per 15 minutes per IP
- **Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## 🎯 Best Practices

1. **Sync Daily:** Run product sync once per day during off-peak hours
2. **Cache Results:** Cache product lists on the frontend for 5-10 minutes
3. **Batch Updates:** Group variant updates when possible
4. **Error Handling:** Always check `success` field in responses
5. **Pagination:** Use query params for large datasets (to be implemented)

---

## 📚 Related Documentation

- [Complete Setup Guide](./PRODUCT_MODULE_SETUP.md)
- [Main API Documentation](./API.md)
- [Shopify Integration Guide](./INFRASTRUCTURE_SETUP_GUIDE.md)

---

**Need help?** Check the logs in `server/logs/` or enable debug mode for detailed output.

