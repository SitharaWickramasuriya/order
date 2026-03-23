import { prisma } from "@/lib/prisma";
import { badRequest, jsonOk } from "@/lib/api";

export async function POST(_: Request, { params }: { params: { id: string } }) {
	const po = await prisma.purchaseOrder.findUnique({
		where: { id: params.id },
		include: { items: true, grn: true },
	});

	if (!po) return badRequest("Purchase order not found");
	if (po.grn) return badRequest("GRN already created for this PO");
	if (!po.items.length) return badRequest("Purchase order has no items");

	const grnNumber = `GRN-${Date.now()}`;

	const grn = await prisma.$transaction(async (tx) => {
		const createdGrn = await tx.goodsReceivedNote.create({
			data: {
				grnNumber,
				purchaseOrderId: po.id,
				items: {
					create: po.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
				},
			},
			include: { items: true },
		});

		await tx.purchaseOrder.update({ where: { id: po.id }, data: { status: "RECEIVED" } });

		for (const item of po.items) {
			const existing = await tx.inventory.findUnique({
				where: { centerId_productId: { centerId: po.centerId, productId: item.productId } },
			});
			if (existing) {
				await tx.inventory.update({
					where: { id: existing.id },
					data: { quantity: existing.quantity + item.quantity },
				});
			} else {
				await tx.inventory.create({
					data: { centerId: po.centerId, productId: item.productId, quantity: item.quantity },
				});
			}
		}

		return createdGrn;
	});

	return jsonOk(grn);
}
