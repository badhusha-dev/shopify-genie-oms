# ⚡ Webhook Integration - Quick Start

## 🎯 60-Second Setup

### 1. Add Environment Variables
```env
# server/.env
SHOPIFY_CLIENT_SECRET="your-shopify-app-secret"
WEBHOOK_BASE_URL="https://your-domain.com"  # or ngrok URL for dev
```

### 2. Start Server
```bash
cd server
npm run dev
```

### 3. Expose Local Server (Development Only)
```bash
# In a new terminal
ngrok http 3001

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Update WEBHOOK_BASE_URL in .env with this URL
# Restart server
```

### 4. Register Webhooks
```bash
# Get JWT token first
POST http://localhost:3001/api/auth/login
{
  "email": "admin@shopifygenie.com",
  "password": "Admin@123"
}

# Register webhooks
POST http://localhost:3001/api/admin/webhooks/register
Authorization: Bearer YOUR_ACCESS_TOKEN
{
  "storeId": "your-store-uuid"
}
```

### 5. Test It
1. Go to your Shopify Admin
2. Create or update a product
3. Check server logs - you should see:
```
INFO: Received webhook: products/update from mystore.myshopify.com
INFO: Successfully processed products/update webhook
```

## ✅ Done!

Products now sync automatically from Shopify to your OMS!

---

## 📋 API Endpoints

### Receive Webhooks (Shopify calls this)
```
POST /api/shopify/webhooks/:topic
```

### Manage Webhooks (You call these)
```
POST   /api/admin/webhooks/register            Register webhooks
GET    /api/admin/webhooks/list/:storeId       List webhooks
DELETE /api/admin/webhooks/unregister/:storeId Delete all webhooks
GET    /api/admin/webhooks/test/:storeId       Test configuration
```

---

## 🔧 Quick Troubleshooting

### "Invalid HMAC signature"
- Check SHOPIFY_CLIENT_SECRET matches your Shopify app secret
- Restart server after changing .env

### "Store not found"
- Verify store exists in database
- Check shopifyDomain field matches Shopify store

### Webhook not received
- Ensure WEBHOOK_BASE_URL is publicly accessible HTTPS
- Check ngrok is running (dev)
- Verify webhooks are registered in Shopify

---

## 📚 Full Documentation

- **Complete Guide:** [WEBHOOK_INTEGRATION_GUIDE.md](./WEBHOOK_INTEGRATION_GUIDE.md)
- **Environment Setup:** [ENVIRONMENT_CONFIG_GUIDE.md](./ENVIRONMENT_CONFIG_GUIDE.md)
- **Implementation Details:** [WEBHOOK_IMPLEMENTATION_SUMMARY.md](./WEBHOOK_IMPLEMENTATION_SUMMARY.md)

---

## 🎉 What You Get

✅ **Real-time product sync** - Updates within seconds  
✅ **Automatic inventory tracking** - No manual sync needed  
✅ **Secure HMAC verification** - Industry-standard security  
✅ **Admin management API** - Full webhook control  
✅ **Production-ready** - Handles errors gracefully

**Your OMS is now real-time!** 🚀

