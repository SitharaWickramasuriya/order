import { prisma } from "@/lib/prisma";
import { badRequest, jsonCreated, jsonOk, parseJson } from "@/lib/api";

type SupplierInput = {
	name: string;
	contact?: string;
	phone?: string;
	email?: string;
};

export async function GET() {
	const suppliers = await prisma.supplier.findMany({ orderBy: { createdAt: "desc" } });
	return jsonOk(suppliers);
}

export async function POST(request: Request) {
	const body = await parseJson<SupplierInput>(request);
	if (!body.name) return badRequest("name is required");
	const supplier = await prisma.supplier.create({ data: body });
	return jsonCreated(supplier);
}
