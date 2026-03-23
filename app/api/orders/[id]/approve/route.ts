import { prisma } from "@/lib/prisma";
import { badRequest, jsonOk, notFound, parseJson } from "@/lib/api";

type ApprovalInput = { channel?: "SMS" | "WHATSAPP"; message?: string };

export async function POST(request: Request, { params }: { params: { id: string } }) {
	const body = await parseJson<ApprovalInput>(request).catch(() => ({} as ApprovalInput));
	const order = await prisma.order.findUnique({ where: { id: params.id } });
	if (!order) return notFound("Order not found");

	const channel = body.channel ?? "SMS";
	const message = body.message ?? "Your order has been approved.";

	const updated = await prisma.order.update({
		where: { id: params.id },
		data: {
			status: "APPROVED",
			notifications: {
				create: {
					channel,
					message,
				},
			},
		},
		include: { notifications: true },
	});

	return jsonOk(updated);
}
