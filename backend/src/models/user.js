import { prisma } from './database.js';

const profile = { id: true, name: true, email: true };

export function findCredentials(email) {
  return prisma.user.findUnique({
    where: { email },
    select: { ...profile, passwordHash: true },
  });
}

export function findProfile(id) {
  return prisma.user.findUnique({ where: { id }, select: profile });
}

export function seedUser({ email, name, passwordHash }) {
  return prisma.user.upsert({
    where: { email },
    create: { email, name, passwordHash },
    update: { name, passwordHash },
    select: profile,
  });
}
