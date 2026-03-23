import { prisma } from "@/lib/prisma";
import { badRequest, jsonCreated, parseJson } from "@/lib/api";
import { pickDeliverySchedule } from "@/lib/domain";

type CustomerInput = { name: string; phone: string; address?: string };
type OrderItemInput = { productId: string; quantity: number };
type OrderInput = { customer: CustomerInput; items: OrderItemInput[]; notes?: string };

export async function POST(request: Request) {
	const body = await parseJson<OrderInput>(request);
	if (!body.customer?.phone || !body.customer.name) return badRequest("customer name and phone are required");
	if (!body.items?.length) return badRequest("At least one item is required");

	const items = await prisma.product.findMany({ where: { id: { in: body.items.map((i) => i.productId) } } });
	if (items.length !== body.items.length) return badRequest("Invalid product in items");

	const customer = await prisma.customer.upsert({
		where: { phone: body.customer.phone },
		create: { ...body.customer },
		update: { name: body.customer.name, address: body.customer.address },
	});

	const schedule = await pickDeliverySchedule();
	const orderNo = `ORD-${Date.now()}-WA`;

	const order = await prisma.order.create({
		data: {
			orderNo,
			customerId: customer.id,
			deliveryScheduleId: schedule.id,
			status: "PENDING",
			channel: "WHATSAPP",
			notes: body.notes,
			items: {
				create: body.items.map((i) => {
					const product = items.find((p) => p.id === i.productId)!;
					return { productId: i.productId, quantity: i.quantity, price: Number(product.price) };
				}),
			},
		},
	});

	return jsonCreated(order);
}
