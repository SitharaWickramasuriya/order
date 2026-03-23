import { prisma } from "@/lib/prisma";
import { badRequest, jsonCreated, jsonOk, parseJson } from "@/lib/api";
import { pickDeliverySchedule } from "@/lib/domain";

type CustomerInput = { name: string; phone: string; address?: string };
type OrderItemInput = { productId: string; quantity: number };
type OrderInput = { customer: CustomerInput; items: OrderItemInput[]; notes?: string; channel?: "ONLINE" | "WHATSAPP" };

function serializeOrder(order: any) {
	return {
		...order,
		items: order.items.map((item: any) => ({
			...item,
			price: Number(item.price),
			product: item.product ? { ...item.product, price: Number(item.product.price) } : null,
		})),
	};
}

export async function GET() {
	const orders = await prisma.order.findMany({
		orderBy: { createdAt: "desc" },
		include: {
			customer: true,
			deliverySchedule: true,
			items: { include: { product: true } },
			notifications: true,
		},
	});
	return jsonOk(orders.map(serializeOrder));
}

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

	const orderNo = `ORD-${Date.now()}`;

	const order = await prisma.order.create({
		data: {
			orderNo,
			customerId: customer.id,
			deliveryScheduleId: schedule.id,
			status: "PENDING",
			channel: body.channel ?? "ONLINE",
			notes: body.notes,
			items: {
				create: body.items.map((i) => {
					const product = items.find((p) => p.id === i.productId)!;
					return {
						productId: i.productId,
						quantity: i.quantity,
						price: Number(product.price),
					};
				}),
			},
		},
		include: { customer: true, deliverySchedule: true, items: { include: { product: true } } },
	});

	return jsonCreated(serializeOrder(order));
}
