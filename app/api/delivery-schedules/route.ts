import { prisma } from "@/lib/prisma";
import { badRequest, jsonCreated, jsonOk, parseJson } from "@/lib/api";

type ScheduleInput = { windowStart: string; windowEnd: string; status?: "OPEN" | "CLOSED" };

export async function GET() {
	const schedules = await prisma.deliverySchedule.findMany({ orderBy: { windowStart: "asc" } });
	return jsonOk(schedules);
}

export async function POST(request: Request) {
	const body = await parseJson<ScheduleInput>(request);
	if (!body.windowStart || !body.windowEnd) return badRequest("windowStart and windowEnd are required");

	const schedule = await prisma.deliverySchedule.create({
		data: {
			windowStart: new Date(body.windowStart),
			windowEnd: new Date(body.windowEnd),
			status: body.status ?? "OPEN",
		},
	});

	return jsonCreated(schedule);
}
