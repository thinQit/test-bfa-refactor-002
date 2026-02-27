import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice Johnson',
      passwordHash
    }
  });

  const bob = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob Smith',
      passwordHash
    }
  });

  await prisma.todo.create({
    data: {
      ownerId: alice.id,
      title: 'Finish onboarding',
      description: 'Review project requirements and set up environment',
      completed: false
    }
  });

  await prisma.todo.create({
    data: {
      ownerId: alice.id,
      title: 'Plan weekly tasks',
      description: 'Create a list of tasks for the week',
      completed: true
    }
  });

  await prisma.todo.create({
    data: {
      ownerId: bob.id,
      title: 'Buy groceries',
      description: 'Milk, eggs, bread, and vegetables',
      completed: false
    }
  });

  await prisma.todo.create({
    data: {
      ownerId: bob.id,
      title: 'Workout session',
      description: '30 minutes of cardio and stretching',
      completed: false
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
