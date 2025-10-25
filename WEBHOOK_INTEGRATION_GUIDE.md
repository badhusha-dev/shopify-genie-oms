# 🔄 Shopify Webhook Integration Guide

## Overview

This guide explains how to set up real-time product synchronization using Shopify webhooks. When products are created, updated, or deleted in Shopify, your ShopifyGenie OMS will automatically receive and process those changes.

## 🎯 What Are Webhooks?

Webhooks are HTTP callbacks that Shopify sends to your application when certain events occur. Instead of polling Shopify's API for changes, your app receives instant notifications.

### Supported Events

- **products/create** - Fired when a new product is created
- **products/update** - Fired when a product is updated (including variant changes)
- **products/delete** - Fired when a product is deleted
- **inventory_levels/update** - (Optional) Fired when inventory levels change

## ✅ What's Been Implemented

### 1. Webhook Handler Route
- **Endpoint:** `POST /api/shopify/webhooks/:topic`
- **Authentication:** HMAC signature verification
- **Body Parser:** Raw body (required for HMAC verification)

### 2. Webhook Management Routes
- `POST /api/admin/webhooks/register` - Register webhooks for a store
- `GET /api/admin/webhooks/list/:storeId` - List registered webhooks
- `DELETE /api/admin/webhooks/:storeId/:webhookId` - Delete a webhook
- `DELETE /api/admin/webhooks/unregister/:storeId` - Remove all webhooks
- `GET /api/admin/webhooks/test/:storeId` - Test webhook configuration

### 3. Security Features
- ✅ HMAC SHA-256 signature verification
- ✅ Timing-safe string comparison
- ✅ JWT authentication for admin endpoints
- ✅ Store validation

## 🚀 Quick Setup

### Step 1: Environment Variables

Add these to your `server/.env` file:

```env
# Shopify Webhook Configuration
SHOPIFY_CLIENT_SECRET="your-shopify-app-secret"
SHOPIFY_WEBHOOK_SECRET="your-shopify-app-secret"  # Same as client secret
WEBHOOK_BASE_URL="https://your-public-domain.com"
BACKEND_URL="https://your-public-domain.com"

# For development with ngrok
# WEBHOOK_BASE_URL="https://abc123.ngrok.io"
```

**Important:** 
- `SHOPIFY_CLIENT_SECRET` is used for HMAC verification
- `WEBHOOK_BASE_URL` must be publicly accessible via HTTPS
- Use ngrok for local development (see below)

### Step 2: Start Your Server

```bash
cd server
npm run dev
```

Server should be running on `http://localhost:3001`

### Step 3: Expose Local Server (Development Only)

Install and run ngrok:

```bash
# Install ngrok (if not already installed)
# Download from: https://ngrok.com/download

# Start ngrok tunnel
ngrok http 3001
```

You'll see output like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3001
```

Copy the HTTPS URL and update your `.env`:
```env
WEBHOOK_BASE_URL="https://abc123.ngrok.io"
```

### Step 4: Register Webhooks

Use the registration endpoint to create webhook subscriptions in Shopify:

```bash
POST http://localhost:3001/api/admin/webhooks/register
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "storeId": "your-store-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registered 3 webhook(s) for store MyStore",
  "data": {
    "created": [
      {
        "topic": "products/create",
        "id": 1234567890,
        "address": "https://abc123.ngrok.io/api/shopify/webhooks/products/create"
      },
      {
        "topic": "products/update",
        "id": 1234567891,
        "address": "https://abc123.ngrok.io/api/shopify/webhooks/products/update"
      },
      {
        "topic": "products/delete",
        "id": 1234567892,
        "address": "https://abc123.ngrok.io/api/shopify/webhooks/products/delete"
      }
    ]
  }
}
```

### Step 5: Test Webhooks

Create, update, or delete a product in your Shopify admin panel. Watch your server logs to see the webhook being processed:

```bash
# Server logs will show:
INFO: Received webhook: products/update from mystore.myshopify.com
INFO: Upserted product 1234567890 with 3 variants
INFO: Successfully processed products/update webhook for product: 1234567890
```

## 📋 API Reference

### Webhook Handler Endpoint

```
POST /api/shopify/webhooks/:topic
```

**Headers:**
- `X-Shopify-Hmac-Sha256` - HMAC signature for verification
- `X-Shopify-Shop-Domain` - Store domain (e.g., mystore.myshopify.com)
- `X-Shopify-Topic` - Event topic
- `Content-Type: application/json`

**Body:** Raw JSON from Shopify

**Response:**
```json
{
  "message": "Product synced successfully"
}
```

### Register Webhooks

```
POST /api/admin/webhooks/register
Authorization: Bearer JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "storeId": "store-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registered 3 webhook(s) for store MyStore",
  "data": {
    "created": [
      {
        "topic": "products/create",
        "id": 1234567890,
        "address": "https://your-domain.com/api/shopify/webhooks/products/create"
      }
    ],
    "errors": []
  }
}
```

### List Webhooks

```
GET /api/admin/webhooks/list/:storeId
Authorization: Bearer JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1234567890,
      "topic": "products/create",
      "address": "https://your-domain.com/api/shopify/webhooks/products/create",
      "format": "json",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Delete Webhook

```
DELETE /api/admin/webhooks/:storeId/:webhookId
Authorization: Bearer JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook deleted successfully"
}
```

### Unregister All Webhooks

```
DELETE /api/admin/webhooks/unregister/:storeId
Authorization: Bearer JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Deleted 3 webhook(s)",
  "data": {
    "deleted": [1234567890, 1234567891, 1234567892],
    "errors": []
  }
}
```

### Test Webhook Configuration

```
GET /api/admin/webhooks/test/:storeId
Authorization: Bearer JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "storeId": "store-uuid",
    "storeName": "My Store",
    "shopDomain": "mystore.myshopify.com",
    "webhookBaseUrl": "https://your-domain.com",
    "expectedWebhookUrl": "https://your-domain.com/api/shopify/webhooks/:topic",
    "isHttps": true,
    "warning": null
  }
}
```

## 🔒 Security

### HMAC Verification

Every webhook is verified using HMAC SHA-256 signature:

1. Shopify calculates HMAC of the request body using your app secret
2. HMAC is sent in `X-Shopify-Hmac-Sha256` header
3. Your server recalculates HMAC and compares using timing-safe comparison
4. If HMAC doesn't match, request is rejected with 401

**Implementation:**
```typescript
export function verifyShopifyWebhook(
  hmacHeader: string, 
  body: Buffer, 
  secret: string
): boolean {
  if (!hmacHeader || !secret) return false;
  
  const digest = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(digest), 
    Buffer.from(hmacHeader)
  );
}
```

### Why Raw Body?

The HMAC is calculated on the **exact raw bytes** of the request body. If you parse the JSON first, the HMAC verification will fail because:
- JSON parsers may reorder keys
- Whitespace may be normalized
- Encoding may change

That's why the webhook route uses `express.raw()` middleware.

## 🧪 Testing

### Using ngrok Inspector

1. Start ngrok: `ngrok http 3001`
2. Open ngrok inspector: `http://localhost:4040`
3. Create/update a product in Shopify
4. View the webhook request in ngrok inspector
5. Check HMAC header and payload

### Manual Testing with cURL

You can't easily test HMAC verification manually, but you can test the endpoint structure:

```bash
# This will fail HMAC verification but tests the route
curl -X POST http://localhost:3001/api/shopify/webhooks/products/create \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Shop-Domain: test.myshopify.com" \
  -H "X-Shopify-Hmac-Sha256: fake-hmac" \
  -d '{"id": 123, "title": "Test Product"}'
```

Expected response: `401 Invalid HMAC signature`

### Testing in Shopify Admin

1. Go to **Settings → Notifications → Webhooks** in Shopify Admin
2. Find your registered webhook
3. Click "Send test notification"
4. Check your server logs for processing

## 📊 Webhook Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Shopify Store                             │
│  (Product Created/Updated/Deleted)                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP POST with HMAC
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               Your Server (ShopifyGenie OMS)                 │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. Receive Webhook                                  │  │
│  │     POST /api/shopify/webhooks/:topic                │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
│                   ▼                                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  2. Verify HMAC Signature                            │  │
│  │     - Calculate HMAC of raw body                     │  │
│  │     - Compare with X-Shopify-Hmac-Sha256            │  │
│  │     - Reject if mismatch (401)                       │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
│                   ▼                                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  3. Parse JSON Payload                               │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
│                   ▼                                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  4. Find Store by Shop Domain                        │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
│                   ▼                                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  5. Process Event                                     │  │
│  │     - products/create → Upsert product               │  │
│  │     - products/update → Upsert product & variants    │  │
│  │     - products/delete → Delete product               │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
│                   ▼                                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  6. Update Database                                   │  │
│  │     - ShopifyProduct                                  │  │
│  │     - ShopifyProductVariant                           │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
│                   ▼                                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  7. Return 200 OK                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ 200 OK
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Shopify                                   │
│  (Marks webhook as delivered)                                │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Troubleshooting

### Webhook Not Received

**Problem:** Product changes in Shopify, but webhook not received

**Solutions:**
1. Check webhook URL is publicly accessible (HTTPS required in production)
2. Verify ngrok is running for local development
3. Check firewall isn't blocking incoming requests
4. Ensure webhook is registered: `GET /api/admin/webhooks/list/:storeId`

### HMAC Verification Failed

**Problem:** `401 Invalid HMAC signature`

**Solutions:**
1. Verify `SHOPIFY_CLIENT_SECRET` matches your Shopify app secret
2. Check you're using `express.raw()` middleware for webhook routes
3. Ensure no middleware is parsing body before webhook handler
4. Verify the secret used when creating the webhook is the same

### Store Not Found

**Problem:** `Store not found, webhook ignored`

**Solutions:**
1. Check `shopifyDomain` in database matches `X-Shopify-Shop-Domain` header
2. Verify store exists: `SELECT * FROM "Store" WHERE "shopifyDomain" = 'mystore.myshopify.com'`
3. Check store is active: `isActive = true`

### Webhook Times Out

**Problem:** Shopify marks webhook as failed (timeout)

**Solutions:**
1. Optimize database queries (add indexes)
2. Use background job queue (see Advanced section)
3. Return 200 OK immediately, process asynchronously
4. Check server resources (CPU, memory)

## 🚀 Advanced: Background Processing

For production systems handling high volume, process webhooks asynchronously:

### Step 1: Install BullMQ

```bash
npm install bullmq
```

### Step 2: Create Webhook Queue

```typescript
// server/src/queues/webhook.queue.ts
import { Queue, Worker } from 'bullmq';
import { productService } from '../services/product.service';

const webhookQueue = new Queue('webhooks', {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});

export const addWebhookJob = async (topic: string, payload: any, storeId: string) => {
  await webhookQueue.add('process-webhook', {
    topic,
    payload,
    storeId,
    receivedAt: new Date(),
  });
};

// Worker to process jobs
const worker = new Worker('webhooks', async job => {
  const { topic, payload, storeId } = job.data;
  
  if (topic === 'products/create' || topic === 'products/update') {
    await handleProductUpsert(payload, storeId, topic);
  } else if (topic === 'products/delete') {
    await handleProductDelete(payload, storeId);
  }
}, {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});

export { webhookQueue, worker };
```

### Step 3: Update Webhook Handler

```typescript
router.post('/:topic', async (req: Request, res: Response) => {
  // ... HMAC verification ...
  
  // Add to queue instead of processing immediately
  await addWebhookJob(topic, payload, store.id);
  
  // Return 200 immediately
  return res.status(200).json({ message: 'Webhook queued' });
});
```

**Benefits:**
- ✅ Fast response time (< 100ms)
- ✅ No timeout issues
- ✅ Built-in retry logic
- ✅ Better error handling
- ✅ Queue monitoring

## 📈 Monitoring

### Log Webhook Activity

All webhooks are logged with:
- Topic
- Store domain
- Timestamp
- Processing status
- Error details (if any)

Check logs:
```bash
tail -f server/logs/combined.log | grep webhook
```

### Monitor Webhook Health in Shopify

1. Go to **Settings → Notifications → Webhooks**
2. Check "Last delivery status" column
3. Green checkmark = successful
4. Red X = failed (click for details)

### Database Audit

Track when products were last synced:
```sql
SELECT 
  "id",
  "title",
  "updatedAt",
  "createdAt"
FROM "ShopifyProduct"
ORDER BY "updatedAt" DESC
LIMIT 10;
```

## 🎯 Best Practices

1. **Always Verify HMAC** - Never skip signature verification in production
2. **Return 200 Quickly** - Process webhooks asynchronously if they take > 1 second
3. **Handle Duplicates** - Webhooks may fire multiple times, use upsert logic
4. **Log Everything** - Log all webhook requests for debugging and audit
5. **Use HTTPS** - Required in production, use ngrok for development
6. **Monitor Failures** - Set up alerts for failed webhooks
7. **Test Thoroughly** - Test all webhook topics before going live
8. **Rotate Secrets** - Change `SHOPIFY_CLIENT_SECRET` periodically

## 📚 Additional Resources

- [Shopify Webhooks Documentation](https://shopify.dev/docs/api/admin-rest/latest/resources/webhook)
- [ngrok Documentation](https://ngrok.com/docs)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Product Module Setup](./PRODUCT_MODULE_SETUP.md)
- [Product API Reference](./PRODUCT_API_QUICK_REFERENCE.md)

## 🎉 Success!

You now have real-time product synchronization! Changes in Shopify will automatically sync to your OMS within seconds.

**What's Next?**
- Add inventory webhooks for stock level sync
- Implement order webhooks for order management
- Set up webhook monitoring dashboard
- Add Slack notifications for webhook failures

Happy coding! 🚀

