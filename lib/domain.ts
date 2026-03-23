import { prisma } from "./prisma";

export async function upsertInventory(centerId: string, productId: string, delta: number) {
  const existing = await prisma.inventory.findUnique({
    where: { centerId_productId: { centerId, productId } },
  });

  const newQty = (existing?.quantity ?? 0) + delta;
  if (newQty < 0) {
    throw new Error("Insufficient stock for transfer");
  }

  if (existing) {
    return prisma.inventory.update({
      where: { id: existing.id },
      data: { quantity: newQty },
    });
  }

  return prisma.inventory.create({
    data: { centerId, productId, quantity: newQty },
  });
}

export async function pickDeliverySchedule() {
  const now = new Date();
  const open = await prisma.deliverySchedule.findFirst({
    where: {
      windowStart: { lte: now },
      windowEnd: { gte: now },
      status: "OPEN",
    },
    orderBy: { windowStart: "asc" },
  });

  if (open) return open;

  const upcoming = await prisma.deliverySchedule.findFirst({
    where: { status: "OPEN", windowStart: { gt: now } },
    orderBy: { windowStart: "asc" },
  });

  if (upcoming) return upcoming;

  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(8, 0, 0, 0);
  const end = new Date(start);
  end.setHours(12, 0, 0, 0);

  return prisma.deliverySchedule.create({
    data: {
      windowStart: start,
      windowEnd: end,
      status: "OPEN",
    },
  });
}
