"use client";

import { useEffect, useState } from "react";

type Schedule = { id: string; windowStart: string; windowEnd: string; status: string };

const empty = { windowStart: "", windowEnd: "" };

export default function DeliverySchedulesPage() {
	const [schedules, setSchedules] = useState<Schedule[]>([]);
	const [form, setForm] = useState(empty);
	const [message, setMessage] = useState("");

	useEffect(() => {
		const timer = setTimeout(() => {
			void load();
		}, 0);
		return () => clearTimeout(timer);
	}, []);

	async function load() {
		const res = await fetch("/api/delivery-schedules");
		setSchedules(await res.json());
	}

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		if (!form.windowStart || !form.windowEnd) {
			setMessage("Start and end required");
			return;
		}
		const res = await fetch("/api/delivery-schedules", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ ...form, status: "OPEN" }),
		});
		if (!res.ok) {
			const err = await res.json();
			setMessage(err.error ?? "Failed to create schedule");
			return;
		}
		setMessage("Schedule created");
		setForm(empty);
		await load();
	}

	return (
		<div className="space-y-6">
			<div>
				<p className="badge">Logistics</p>
				<h1 className="mt-2 text-3xl font-bold">Delivery Schedules</h1>
			</div>
			{message ? <div className="panel border-emerald-200 bg-emerald-50 p-3 text-emerald-800">{message}</div> : null}
			<form className="panel space-y-3 p-5" onSubmit={submit}>
				<h2 className="text-xl font-semibold">Create schedule</h2>
				<label className="text-sm font-semibold">
					Window start
					<input
						type="datetime-local"
						required
						value={form.windowStart}
						onChange={(e) => setForm({ ...form, windowStart: e.target.value })}
						className="mt-1 w-full rounded border border-slate-200 p-2"
					/>
				</label>
				<label className="text-sm font-semibold">
					Window end
					<input
						type="datetime-local"
						required
						value={form.windowEnd}
						onChange={(e) => setForm({ ...form, windowEnd: e.target.value })}
						className="mt-1 w-full rounded border border-slate-200 p-2"
					/>
				</label>
				<button className="btn btn-primary" type="submit">
					Create Schedule
				</button>
			</form>

			<div className="panel p-5">
				<h2 className="text-xl font-semibold">Upcoming windows</h2>
				<div className="mt-3 grid gap-3 md:grid-cols-3">
					{schedules.map((s) => {
						const start = new Date(s.windowStart);
						const end = new Date(s.windowEnd);
						return (
							<div key={s.id} className="kpi-card">
								<p className="text-xs uppercase text-muted">{s.status}</p>
								<h3 className="text-lg font-semibold">{start.toDateString()}</h3>
								<p className="text-sm text-muted">
									{start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -
									{end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
								</p>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
