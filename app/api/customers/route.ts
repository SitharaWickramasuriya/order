import { prisma } from "@/lib/prisma";
import { badRequest, jsonCreated, jsonOk, parseJson } from "@/lib/api";

type CreateCustomer = {
	name: string;
	phone: string;
	address?: string;
};

export async function GET() {
	const customers = await prisma.customer.findMany({
		orderBy: { createdAt: "desc" },
		include: { _count: { select: { orders: true } } },
	});
	return jsonOk(customers);
}

export async function POST(request: Request) {
	const body = await parseJson<CreateCustomer>(request);
	if (!body.name || !body.phone) return badRequest("name and phone are required");
	const customer = await prisma.customer.create({ data: body });
	return jsonCreated(customer);
}
