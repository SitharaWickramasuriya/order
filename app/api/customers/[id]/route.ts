import { prisma } from "@/lib/prisma";
import { badRequest, jsonOk, notFound, parseJson } from "@/lib/api";

export async function GET(_: Request, { params }: { params: { id: string } }) {
	const customer = await prisma.customer.findUnique({
		where: { id: params.id },
		include: {
			orders: {
				include: { items: { include: { product: true } } },
				orderBy: { createdAt: "desc" },
			},
		},
	});
	if (!customer) return notFound("Customer not found");
	return jsonOk(customer);
}

type UpdateCustomer = {
	name?: string;
	phone?: string;
	address?: string;
};

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
	const body = await parseJson<UpdateCustomer>(request);
	if (!Object.keys(body).length) return badRequest("No fields provided");
	const updated = await prisma.customer.update({ where: { id: params.id }, data: body });
	return jsonOk(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
	await prisma.customer.delete({ where: { id: params.id } });
	return jsonOk({ success: true });
}
