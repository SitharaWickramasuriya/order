import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/lib/api";

export async function GET() {
	const inventory = await prisma.inventory.findMany({
		orderBy: { updatedAt: "desc" },
		include: { center: true, product: true },
	});
	return jsonOk(inventory.map((i) => ({ ...i, product: { ...i.product, price: Number(i.product.price) } })));
}
