CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'FULFILLMENT', 'SUPPORT');

CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  role "UserRole" DEFAULT 'SUPPORT',
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create admin user with password: admin123
-- Password hash generated with bcrypt rounds=10
INSERT INTO "User" (email, password, "firstName", "lastName", role) 
VALUES (
  'admin@shopifygenie.com',
  '$2a$10$XqZWLh/Mj.zMVGu6y6n7MOXZJYEk5ILZ.aSjH/cK3yNGKjVXqNLJG',
  'Admin',
  'User',
  'ADMIN'
) ON CONFLICT (email) DO NOTHING;

