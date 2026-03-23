import { prisma } from "@/lib/prisma";
import { badRequest, jsonCreated, jsonOk, parseJson } from "@/lib/api";

type CenterInput = {
	name: string;
	address?: string;
};

export async function GET() {
	const centers = await prisma.center.findMany({ orderBy: { createdAt: "desc" } });
	return jsonOk(centers);
}

export async function POST(request: Request) {
	const body = await parseJson<CenterInput>(request);
	if (!body.name) return badRequest("name is required");
	const center = await prisma.center.create({ data: body });
	return jsonCreated(center);
}
