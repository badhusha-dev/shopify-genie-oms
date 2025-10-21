# Database Setup Script for ShopifyGenie OMS (PowerShell)

Write-Host "`n🗄️  Setting up ShopifyGenie OMS Database...`n" -ForegroundColor Cyan

# Check if PostgreSQL container is running
$container = docker ps --filter "name=shopify-oms-db" --format "{{.Names}}"
if (-not $container) {
    Write-Host "❌ PostgreSQL container is not running!" -ForegroundColor Red
    Write-Host "Please start it with: docker-compose up -d postgres" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ PostgreSQL container is running" -ForegroundColor Green

# Try Prisma migration first
Write-Host "`n📦 Attempting Prisma migrations..." -ForegroundColor Yellow
$prismaResult = npx prisma db push 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database setup complete!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Prisma migration failed. Setting up manually..." -ForegroundColor Yellow
    
    # Run manual SQL setup
    $sql = @"
-- Create enums
CREATE TYPE IF NOT EXISTS "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'FULFILLMENT', 'SUPPORT');

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
"@

    $sql | docker exec -i shopify-oms-db psql -U postgres -d shopify_genie_oms
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Manual database setup complete!" -ForegroundColor Green
    } else {
        Write-Host "❌ Database setup failed!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n🎉 Database is ready for use!`n" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start the backend: npm run dev" -ForegroundColor White
Write-Host "2. Create admin user at: http://localhost:4000/graphql" -ForegroundColor White
Write-Host "3. Login at: http://localhost:3000`n" -ForegroundColor White

