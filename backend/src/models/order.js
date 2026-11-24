import { prisma } from './database.js';

export function listOrders(search, status) {
  // Escape PostgreSQL pattern characters so the search text is literal.
  const term = search.replace(/[\\%_]/g, '\\$&');
  return prisma.laundryOrder.findMany({
    where: {
      status,
      OR: term ? [
        { customerName: { contains: term, mode: 'insensitive' } },
        { customerPhone: { contains: term } },
      ] : undefined,
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });
}

export function findOrder(id) {
  return prisma.laundryOrder.findUnique({ where: { id } });
}

export function createOrder(data) {
  return prisma.laundryOrder.create({ data });
}

export function updateOrder(id, data) {
  return prisma.laundryOrder.update({ where: { id }, data }).catch(handleMissingOrder);
}

export function deleteOrder(id) {
  return prisma.laundryOrder.delete({ where: { id } }).catch(handleMissingOrder);
}

function handleMissingOrder(error) {
  if (error.code === 'P2025') return null;
  throw error;
}
