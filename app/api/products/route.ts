import { prisma } from "@/lib/prisma";
import { badRequest, jsonCreated, jsonOk, parseJson } from "@/lib/api";

function serializePrice<T extends { price: unknown }>(item: T) {
	return { ...item, price: Number(item.price) };
}

export async function GET() {
	const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
	return jsonOk(products.map(serializePrice));
}

type CreateProduct = {
	itemCode: string;
	name: string;
	price: number;
	description?: string;
	imageUrl?: string;
	category?: string;
};

export async function POST(request: Request) {
	const body = await parseJson<CreateProduct>(request);
	if (!body.itemCode || !body.name || !body.price) {
		return badRequest("itemCode, name, and price are required");
	}

	const product = await prisma.product.create({
		data: {
			itemCode: body.itemCode,
			name: body.name,
			price: body.price,
			description: body.description,
			imageUrl: body.imageUrl,
			category: body.category,
		},
	});

	return jsonCreated(serializePrice(product));
}
