import { prisma } from "@/lib/prisma";
import { badRequest, jsonCreated, jsonOk, parseJson } from "@/lib/api";

type TransferInput = {
	fromCenterId: string;
	toCenterId: string;
	productId: string;
	quantity: number;
};

export async function GET() {
	const transfers = await prisma.stockTransfer.findMany({
		orderBy: { createdAt: "desc" },
		include: { fromCenter: true, toCenter: true, product: true },
	});
	return jsonOk(
		transfers.map((t) => ({
			...t,
			product: { ...t.product, price: Number(t.product.price) },
		}))
	);
}

export async function POST(request: Request) {
	const body = await parseJson<TransferInput>(request);
	if (!body.fromCenterId || !body.toCenterId || !body.productId || !body.quantity) {
		return badRequest("fromCenterId, toCenterId, productId, and quantity are required");
	}
	if (body.fromCenterId === body.toCenterId) return badRequest("Centers must be different");
	if (body.quantity <= 0) return badRequest("Quantity must be positive");

	const transferNo = `ST-${Date.now()}`;

	try {
		const result = await prisma.$transaction(async (tx) => {
		const source = await tx.inventory.findUnique({
			where: { centerId_productId: { centerId: body.fromCenterId, productId: body.productId } },
		});

		if (!source || source.quantity < body.quantity) {
				throw new Error("Insufficient stock in source center");
		}

		await tx.inventory.update({
			where: { id: source.id },
			data: { quantity: source.quantity - body.quantity },
		});

		const dest = await tx.inventory.findUnique({
			where: { centerId_productId: { centerId: body.toCenterId, productId: body.productId } },
		});

		if (dest) {
			await tx.inventory.update({
				where: { id: dest.id },
				data: { quantity: dest.quantity + body.quantity },
			});
		} else {
			await tx.inventory.create({
				data: { centerId: body.toCenterId, productId: body.productId, quantity: body.quantity },
			});
		}

			return tx.stockTransfer.create({
				data: {
					transferNo,
					fromCenterId: body.fromCenterId,
					toCenterId: body.toCenterId,
					productId: body.productId,
					quantity: body.quantity,
				},
			});
		});

		return jsonCreated(result);
	} catch (error) {
		return badRequest((error as Error).message);
	}
}
