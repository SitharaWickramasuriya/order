import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/lib/api";

export async function GET() {
	const [productCount, customerCount, pendingOrders, approvedOrders, schedules, inventory] = await Promise.all([
		prisma.product.count(),
		prisma.customer.count(),
		prisma.order.count({ where: { status: "PENDING" } }),
		prisma.order.count({ where: { status: "APPROVED" } }),
		prisma.deliverySchedule.findMany({ orderBy: { windowStart: "asc" }, take: 5 }),
		prisma.inventory.findMany({ include: { product: true, center: true } }),
	]);

	const inventoryTotal = inventory.reduce((sum, item) => sum + item.quantity, 0);

	const latestOrders = await prisma.order.findMany({
		orderBy: { createdAt: "desc" },
		take: 5,
		include: { customer: true, items: { include: { product: true } } },
	});

	return jsonOk({
		productCount,
		customerCount,
		pendingOrders,
		approvedOrders,
		inventoryTotal,
		schedules,
		latestOrders: latestOrders.map((o) => ({
			...o,
			items: o.items.map((i) => ({ ...i, price: Number(i.price), product: { ...i.product, price: Number(i.product.price) } })),
		})),
	});
}
