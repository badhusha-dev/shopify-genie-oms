#!/bin/bash
# Database Setup Script for ShopifyGenie OMS

echo "🗄️  Setting up ShopifyGenie OMS Database..."

# Check if PostgreSQL container is running
if ! docker ps | grep -q shopify-oms-db; then
    echo "❌ PostgreSQL container is not running!"
    echo "Please start it with: docker-compose up -d postgres"
    exit 1
fi

echo "✓ PostgreSQL container is running"

# Run Prisma migrations
echo "📦 Running Prisma migrations..."
npx prisma db push

if [ $? -eq 0 ]; then
    echo "✅ Database setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Start the backend: npm run dev"
    echo "2. Create admin user at: http://localhost:4000/graphql"
    echo "3. Login at: http://localhost:3000"
else
    echo "⚠️  Prisma migration failed. Setting up manually..."
    
    # Run manual SQL setup
    docker exec -i shopify-oms-db psql -U postgres -d shopify_genie_oms << 'EOF'
-- Create enums
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'FULFILLMENT', 'SUPPORT');

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'SUPPORT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
EOF

    if [ $? -eq 0 ]; then
        echo "✅ Manual database setup complete!"
    else
        echo "❌ Database setup failed!"
        exit 1
    fi
fi

echo ""
echo "🎉 Database is ready for use!"

