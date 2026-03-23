import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { badRequest, jsonCreated, jsonOk, parseJson, serverError } from "@/lib/api";

function handlePrismaError(error: unknown) {
	if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
		return serverError("Categories table is missing. Run migrations (npx prisma migrate dev).", { status: 500 });
	}
	throw error;
}

function ensureCategoryModel() {
	if (!prisma.category) {
		return serverError("Prisma client is out of date. Run npx prisma generate after adding the Category model.");
	}
	return null;
}

export async function GET() {
	const missing = ensureCategoryModel();
	if (missing) return missing;
	try {
		const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
		return jsonOk(categories);
	} catch (error) {
		return handlePrismaError(error);
	}
}

type CreateCategory = {
	name: string;
};

export async function POST(request: Request) {
	const body = await parseJson<CreateCategory>(request);
	const name = body.name?.trim();
	if (!name) return badRequest("name is required");

	const missing = ensureCategoryModel();
	if (missing) return missing;

	try {
		const existing = await prisma.category.findUnique({ where: { name } });
		if (existing) return badRequest("Category already exists");

		const category = await prisma.category.create({ data: { name } });
		return jsonCreated(category);
	} catch (error) {
		return handlePrismaError(error);
	}
}
