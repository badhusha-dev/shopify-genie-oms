# 🔧 Environment Configuration Guide

## Overview

This guide provides a complete reference for all environment variables required for ShopifyGenie OMS with Product Module and Webhook Integration.

## 📝 Complete .env File Template

Create this file at `server/.env`:

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
DATABASE_URL="postgresql://shopify:shopify_pass@localhost:5432/shopifygenie"

# ============================================
# JWT AUTHENTICATION
# ============================================
# Main JWT secret for access tokens (change in production)
JWT_SECRET="your-super-secure-secret-key-change-this-in-production-min-32-chars"

# Refresh token secret (different from main secret)
JWT_REFRESH_SECRET="your-refresh-token-secret-key-also-change-this-different-value"

# Token expiration times
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# ============================================
# ENCRYPTION
# ============================================
# 32-character encryption key for Shopify tokens
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex').slice(0,32))"
ENCRYPTION_KEY="12345678901234567890123456789012"

# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=3001
NODE_ENV=development
HOST=localhost

# ============================================
# FRONTEND CONFIGURATION
# ============================================
FRONTEND_URL="http://localhost:5173"

# ============================================
# REDIS CONFIGURATION
# ============================================
REDIS_URL="redis://localhost:6379"

# ============================================
# SHOPIFY CONFIGURATION
# ============================================
# Your Shopify App Client Secret (from Shopify Partners dashboard)
SHOPIFY_CLIENT_SECRET="your-shopify-app-client-secret-from-partner-dashboard"

# Alternative name (same value)
SHOPIFY_WEBHOOK_SECRET="your-shopify-app-client-secret-from-partner-dashboard"

# Shopify API Version (optional, defaults to 2024-10)
SHOPIFY_API_VERSION="2024-10"

# ============================================
# WEBHOOK CONFIGURATION
# ============================================
# Public HTTPS URL where webhooks will be received
# PRODUCTION: Use your actual domain
WEBHOOK_BASE_URL="https://your-production-domain.com"

# DEVELOPMENT: Use ngrok forwarding URL
# WEBHOOK_BASE_URL="https://abc123.ngrok.io"

# Alternative backend URL (fallback if WEBHOOK_BASE_URL not set)
BACKEND_URL="https://your-production-domain.com"

# ============================================
# LOGGING
# ============================================
LOG_LEVEL="info"  # Options: error, warn, info, debug

# ============================================
# OPTIONAL: BACKGROUND JOBS
# ============================================
# If using BullMQ for async webhook processing
REDIS_HOST="localhost"
REDIS_PORT=6379

# ============================================
# OPTIONAL: EMAIL NOTIFICATIONS
# ============================================
# If implementing email notifications
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="ShopifyGenie <noreply@shopifygenie.com>"

# ============================================
# OPTIONAL: SLACK NOTIFICATIONS
# ============================================
# If implementing Slack notifications
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# ============================================
# OPTIONAL: SENTRY ERROR TRACKING
# ============================================
# If using Sentry for error monitoring
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"
```

## 🔐 Security Best Practices

### 1. Generate Secure Secrets

**JWT Secret (32+ characters):**
```bash
# Method 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Method 2: Using OpenSSL
openssl rand -hex 32

# Method 3: Using pwgen (Linux/Mac)
pwgen -s 64 1
```

**Encryption Key (exactly 32 characters):**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex').slice(0,32))"
```

### 2. Different Secrets for Different Environments

| Environment | Secret Type | Example |
|-------------|-------------|---------|
| Development | Short, memorable | `dev-jwt-secret-123` |
| Staging | Medium strength | `stg-a1b2c3d4e5f6...` |
| Production | High strength | `prod-4f8a9b2c...` (64+ chars) |

### 3. Never Commit .env Files

Add to `.gitignore`:
```
# Environment variables
.env
.env.local
.env.development
.env.production
.env.test
```

## 🌍 Environment-Specific Configurations

### Development (.env.development)

```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://shopify:shopify_pass@localhost:5432/shopifygenie"
FRONTEND_URL="http://localhost:5173"
WEBHOOK_BASE_URL="https://abc123.ngrok.io"
LOG_LEVEL="debug"

# Use shorter tokens in development
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"
```

### Staging (.env.staging)

```env
NODE_ENV=staging
PORT=3001
DATABASE_URL="postgresql://user:pass@staging-db.example.com:5432/shopifygenie"
FRONTEND_URL="https://staging.shopifygenie.com"
WEBHOOK_BASE_URL="https://api-staging.shopifygenie.com"
LOG_LEVEL="info"

JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
```

### Production (.env.production)

```env
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://user:strong-pass@prod-db.example.com:5432/shopifygenie"
FRONTEND_URL="https://app.shopifygenie.com"
WEBHOOK_BASE_URL="https://api.shopifygenie.com"
LOG_LEVEL="warn"

JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Production secrets (long and random)
JWT_SECRET="<64-character-random-string>"
JWT_REFRESH_SECRET="<64-character-random-string>"
ENCRYPTION_KEY="<32-character-random-string>"
SHOPIFY_CLIENT_SECRET="<from-shopify-partner-dashboard>"
```

## 📋 Configuration Checklist

### Before Starting Development

- [ ] `.env` file created in `server/` directory
- [ ] `DATABASE_URL` points to running PostgreSQL instance
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` are set (different values)
- [ ] `ENCRYPTION_KEY` is exactly 32 characters
- [ ] `SHOPIFY_CLIENT_SECRET` from Shopify Partners dashboard
- [ ] `FRONTEND_URL` matches your frontend dev server
- [ ] `REDIS_URL` points to running Redis instance

### Before Webhook Testing

- [ ] `WEBHOOK_BASE_URL` is publicly accessible HTTPS URL
- [ ] ngrok running (for local development)
- [ ] `SHOPIFY_CLIENT_SECRET` matches webhook secret in Shopify
- [ ] Server restarted after .env changes

### Before Production Deployment

- [ ] All secrets are production-strength (64+ characters)
- [ ] `NODE_ENV=production`
- [ ] `WEBHOOK_BASE_URL` uses production domain (HTTPS)
- [ ] Database URL uses production credentials
- [ ] .env file NOT committed to git
- [ ] Environment variables set in hosting platform
- [ ] Secrets stored in secure vault (e.g., AWS Secrets Manager)

## 🔑 Where to Find Shopify Credentials

### 1. Shopify Client Secret

1. Go to [Shopify Partners Dashboard](https://partners.shopify.com/)
2. Click on your app
3. Navigate to **App setup** → **API credentials**
4. Copy **Client secret**
5. Set as `SHOPIFY_CLIENT_SECRET` in .env

### 2. Shopify Access Token (Per Store)

- Generated during OAuth flow
- Stored encrypted in `Store.encryptedToken` field
- Automatically handled by the app
- Never put access tokens in .env file

### 3. Shopify API Scopes

Required scopes for Product Module:
- `read_products`
- `write_products`
- `read_inventory`
- `write_inventory`

Configure in Shopify Partners → App setup → Configuration → API scopes

## 🧪 Testing Your Configuration

### Test Database Connection

```bash
cd server
npx prisma db pull
```

Expected: ✅ Successfully connected

### Test Redis Connection

```bash
redis-cli ping
```

Expected: `PONG`

### Test Environment Loading

Create `server/test-env.js`:
```javascript
require('dotenv').config();
console.log('Environment variables loaded:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('- ENCRYPTION_KEY:', process.env.ENCRYPTION_KEY ? '✅ Set' : '❌ Missing');
console.log('- SHOPIFY_CLIENT_SECRET:', process.env.SHOPIFY_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
console.log('- WEBHOOK_BASE_URL:', process.env.WEBHOOK_BASE_URL || '❌ Missing');
```

Run:
```bash
node test-env.js
```

### Test Webhook URL Accessibility

```bash
# Test if webhook URL is accessible
curl -X POST https://your-webhook-url.com/api/shopify/webhooks/products/create \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

Expected: Your server receives the request (check logs)

## 🚨 Common Issues & Solutions

### Issue: "Cannot find module 'dotenv'"

**Solution:**
```bash
npm install dotenv
```

Add to top of `server/src/app.ts`:
```typescript
import dotenv from 'dotenv';
dotenv.config();
```

### Issue: "Invalid ENCRYPTION_KEY length"

**Error:** `Error: Invalid key length`

**Solution:** ENCRYPTION_KEY must be exactly 32 characters
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex').slice(0,32))"
```

### Issue: Webhooks receive 401 HMAC error

**Solution:**
1. Verify `SHOPIFY_CLIENT_SECRET` matches Shopify Partner dashboard
2. Ensure same secret used when creating webhooks
3. Check for extra spaces or quotes in .env file
4. Restart server after changing .env

### Issue: Database connection fails

**Error:** `P1000: Authentication failed against database server`

**Solutions:**
1. Check PostgreSQL is running: `docker-compose ps`
2. Verify credentials in `DATABASE_URL`
3. Check database exists: `docker exec -it shopifygenie_postgres psql -U shopify -l`
4. Test connection: `psql "postgresql://shopify:shopify_pass@localhost:5432/shopifygenie"`

### Issue: JWT tokens expire immediately

**Solution:** Check `JWT_EXPIRES_IN` format:
- ✅ `"15m"` (15 minutes)
- ✅ `"1h"` (1 hour)  
- ✅ `"7d"` (7 days)
- ❌ `"15"` (invalid)
- ❌ `15` (no quotes, invalid)

## 📦 Environment Variable Loading

### Loading Priority (Node.js)

1. System environment variables
2. `.env.local` (git-ignored)
3. `.env.[NODE_ENV].local` (e.g., `.env.production.local`)
4. `.env.[NODE_ENV]` (e.g., `.env.production`)
5. `.env`

### Docker Compose

For Docker, add to `docker-compose.yml`:
```yaml
services:
  server:
    build: ./server
    env_file:
      - ./server/.env
    environment:
      - NODE_ENV=production
      - PORT=3001
```

### Kubernetes

For Kubernetes, use ConfigMap and Secrets:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: shopifygenie-secrets
type: Opaque
stringData:
  jwt-secret: "your-jwt-secret"
  encryption-key: "your-encryption-key"
  shopify-client-secret: "your-shopify-secret"
```

## 🎯 Quick Reference

### Minimum Required Variables

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
JWT_REFRESH_SECRET="..."
ENCRYPTION_KEY="..."
SHOPIFY_CLIENT_SECRET="..."
WEBHOOK_BASE_URL="https://..."
FRONTEND_URL="http://..."
```

### Optional but Recommended

```env
REDIS_URL="redis://..."
LOG_LEVEL="info"
NODE_ENV="development"
PORT=3001
```

### Production Only

```env
SENTRY_DSN="https://..."
SMTP_HOST="smtp.gmail.com"
SLACK_WEBHOOK_URL="https://..."
```

## 🔗 Related Documentation

- [Product Module Setup](./PRODUCT_MODULE_SETUP.md)
- [Webhook Integration Guide](./WEBHOOK_INTEGRATION_GUIDE.md)
- [Quick Start Guide](./QUICK_START.md)

## ✅ Final Checklist

Before you start:
- [ ] All required variables set
- [ ] Secrets are secure (32+ characters)
- [ ] Database connection tested
- [ ] Redis connection tested
- [ ] .env file in .gitignore
- [ ] WEBHOOK_BASE_URL is HTTPS (or ngrok for dev)
- [ ] Server restarts successfully
- [ ] No errors in startup logs

**You're ready to go!** 🚀

