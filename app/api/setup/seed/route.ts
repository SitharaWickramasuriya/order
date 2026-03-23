import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/lib/api";

export async function POST() {
	const [centerA, centerB] = await Promise.all([
		prisma.center.upsert({
			where: { name: "Central Warehouse" },
			update: {},
			create: { name: "Central Warehouse", address: "123 Main St" },
		}),
		prisma.center.upsert({
			where: { name: "Downtown Store" },
			update: {},
			create: { name: "Downtown Store", address: "45 City Ave" },
		}),
	]);

	await Promise.all([
		prisma.supplier.upsert({
			where: { name: "Fresh Farms" },
			update: {},
			create: { name: "Fresh Farms", contact: "Alice", phone: "111-222" },
		}),
		prisma.supplier.upsert({
			where: { name: "Global Foods" },
			update: {},
			create: { name: "Global Foods", contact: "Bob", phone: "333-444" },
		}),
	]);

	const categories = ["Dairy", "Fruits", "Vegetables"];

	await Promise.all(
		categories.map((name) =>
			prisma.category.upsert({
				where: { name },
				update: {},
				create: { name },
			}),
		),
	);

	const products = [
		{ itemCode: "APL-001", name: "Organic Apple", category: "Fruits", price: 2.5, description: "Crisp and sweet." },
		{ itemCode: "BRC-010", name: "Broccoli", category: "Vegetables", price: 1.8, description: "Fresh greens." },
		{ itemCode: "MLK-200", name: "Almond Milk", category: "Dairy", price: 3.2, description: "Unsweetened." },
	];

	for (const p of products) {
		await prisma.product.upsert({
			where: { itemCode: p.itemCode },
			update: {},
			create: p,
		});
	}

	const now = new Date();
	const start = new Date(now);
	start.setHours(8, 0, 0, 0);
	const end = new Date(now);
	end.setHours(18, 0, 0, 0);

	await prisma.deliverySchedule.upsert({
		where: { id: "seed-schedule" },
		update: {},
		create: {
			id: "seed-schedule",
			windowStart: start,
			windowEnd: end,
			status: "OPEN",
		},
	});

	return jsonOk({ message: "Seed data ready", centers: [centerA, centerB] });
}
