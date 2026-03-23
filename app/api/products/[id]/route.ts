import { prisma } from "@/lib/prisma";
import { badRequest, jsonOk, notFound, parseJson } from "@/lib/api";

function serialize(item: any) {
	return { ...item, price: Number(item.price) };
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
	const product = await prisma.product.findUnique({ where: { id: params.id } });
	if (!product) return notFound("Product not found");
	return jsonOk(serialize(product));
}

type UpdateProduct = {
	name?: string;
	price?: number;
	description?: string;
	imageUrl?: string;
	category?: string;
};

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
	const body = await parseJson<UpdateProduct>(request);
	if (!Object.keys(body).length) return badRequest("No fields provided");
	const product = await prisma.product.update({ where: { id: params.id }, data: body });
	return jsonOk(serialize(product));
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
	await prisma.product.delete({ where: { id: params.id } });
	return jsonOk({ success: true });
}
