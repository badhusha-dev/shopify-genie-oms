import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@shopifygenie.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  const existingAdmin = await prisma.user.findUnique({ 
    where: { email: adminEmail } 
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        firstName: 'Admin',
        lastName: 'User',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      },
    });

    console.log('✅ Admin user created:', {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    });
  } else {
    console.log('ℹ️  Admin user already exists:', existingAdmin.email);
  }

  // Create sample manager user
  const managerEmail = 'manager@shopifygenie.com';
  const existingManager = await prisma.user.findUnique({ 
    where: { email: managerEmail } 
  });

  if (!existingManager) {
    const managerPassword = await bcrypt.hash('manager123', 12);
    
    const manager = await prisma.user.create({
      data: {
        email: managerEmail,
        firstName: 'John',
        lastName: 'Manager',
        password: managerPassword,
        role: 'MANAGER',
        isActive: true,
      },
    });

    console.log('✅ Manager user created:', {
      id: manager.id,
      email: manager.email,
      role: manager.role,
    });
  } else {
    console.log('ℹ️  Manager user already exists:', managerEmail);
  }

  // Create sample warehouse
  const existingWarehouse = await prisma.warehouse.findUnique({
    where: { code: 'WH-MAIN' }
  });

  if (!existingWarehouse) {
    const warehouse = await prisma.warehouse.create({
      data: {
        name: 'Main Warehouse',
        code: 'WH-MAIN',
        address: {
          street: '123 Commerce St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'USA'
        },
        isActive: true,
      },
    });

    console.log('✅ Warehouse created:', warehouse.name);
  } else {
    console.log('ℹ️  Warehouse already exists:', existingWarehouse.name);
  }

  console.log('🎉 Seed completed successfully!');
  console.log('\n📋 Login credentials:');
  console.log('━'.repeat(50));
  console.log('Admin:');
  console.log(`  Email: ${adminEmail}`);
  console.log(`  Password: ${adminPassword}`);
  console.log('\nManager:');
  console.log(`  Email: ${managerEmail}`);
  console.log(`  Password: manager123`);
  console.log('━'.repeat(50));
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

