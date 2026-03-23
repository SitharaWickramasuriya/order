import { prisma } from "@/lib/prisma";
import { badRequest, jsonCreated, jsonOk, parseJson } from "@/lib/api";

type POItemInput = { productId: string; quantity: number; price: number };
type POInput = { supplierId: string; centerId: string; items: POItemInput[] };

export async function GET() {
	const pos = await prisma.purchaseOrder.findMany({
		orderBy: { createdAt: "desc" },
		include: { supplier: true, center: true, items: { include: { product: true } }, grn: true },
	});
	return jsonOk(
		pos.map((po) => ({
			...po,
			items: po.items.map((i) => ({
				...i,
				price: Number(i.price),
				product: { ...i.product, price: Number(i.product.price) },
			})),
		}))
	);
}

export async function POST(request: Request) {
	const body = await parseJson<POInput>(request);
	if (!body.supplierId || !body.centerId || !body.items?.length) {
		return badRequest("supplierId, centerId, and at least one item are required");
	}

	const poNumber = `PO-${Date.now()}`;
	const po = await prisma.purchaseOrder.create({
		data: {
			poNumber,
			supplierId: body.supplierId,
			centerId: body.centerId,
			items: {
				create: body.items.map((i) => ({
					productId: i.productId,
					quantity: i.quantity,
					price: i.price,
				})),
			},
		},
		include: { items: true },
	});

	return jsonCreated({
		...po,
		items: po.items.map((i) => ({ ...i, price: Number(i.price) })),
	});
}
