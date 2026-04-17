import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = 'AdminPassword123!';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@authsystem.com' },
    update: {},
    create: {
      email: 'admin@authsystem.com',
      name: 'System Admin',
      passwordHash,
      role: 'ADMIN',
      isVerified: true,
    },
  });

  console.log('✅ Admin user created:');
  console.log(`Email: ${admin.email}`);
  console.log(`Password: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
