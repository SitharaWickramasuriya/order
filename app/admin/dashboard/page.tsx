"use client";

import { useEffect, useState } from "react";

type DashboardData = {
	productCount: number;
	customerCount: number;
	pendingOrders: number;
	approvedOrders: number;
	inventoryTotal: number;
	schedules: { id: string; windowStart: string; windowEnd: string; status: string }[];
	latestOrders: { id: string; orderNo: string; status: string; customer: { name: string }; createdAt: string }[];
};

type PurchaseOrder = { id: string; status: string; poNumber: string };

export default function AdminDashboard() {
	const [data, setData] = useState<DashboardData | null>(null);
	const [poStats, setPoStats] = useState<{ total: number; received: number }>({ total: 0, received: 0 });

	useEffect(() => {
		const timer = setTimeout(() => {
			void fetch("/api/dashboard")
				.then((res) => res.json())
				.then(setData);

			void fetch("/api/purchase-orders")
				.then((res) => res.json())
				.then((pos: PurchaseOrder[]) => {
					const total = pos.length;
					const received = pos.filter((p) => p.status === "RECEIVED").length;
					setPoStats({ total, received });
				});
		}, 0);
		return () => clearTimeout(timer);
	}, []);

	const poProgress = poStats.total ? Math.round((poStats.received / poStats.total) * 100) : 0;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<p className="badge">Control Center</p>
					<h1 className="mt-2 text-3xl font-bold">Dashboard</h1>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<div className="kpi-card">
					<p className="text-xs uppercase text-muted">Products</p>
					<h3 className="text-3xl font-bold">{data?.productCount ?? "-"}</h3>
				</div>
				<div className="kpi-card">
					<p className="text-xs uppercase text-muted">Customers</p>
					<h3 className="text-3xl font-bold">{data?.customerCount ?? "-"}</h3>
				</div>
				<div className="kpi-card">
					<p className="text-xs uppercase text-muted">Inventory Units</p>
					<h3 className="text-3xl font-bold">{data?.inventoryTotal ?? "-"}</h3>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<div className="panel p-5">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold">Delivery Calendar</h2>
						<span className="badge">Schedules</span>
					</div>
					<div className="calendar-grid mt-4">
						{data?.schedules?.length ? (
							data.schedules.map((s) => {
								const start = new Date(s.windowStart);
								const end = new Date(s.windowEnd);
								return (
									<div key={s.id} className="panel p-3">
										<p className="text-xs uppercase text-muted">{s.status}</p>
										<p className="font-semibold">{start.toDateString()}</p>
										<p className="text-sm text-muted">
											{start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -
											{end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
										</p>
									</div>
								);
							})
						) : (
							<p className="text-muted">No schedules yet.</p>
						)}
					</div>
				</div>

				<div className="panel space-y-4 p-5">
					<h2 className="text-xl font-semibold">Purchase Progress</h2>
					<p className="text-sm text-muted">POs received</p>
					<div className="h-3 w-full rounded-full bg-slate-200">
						<div className="h-3 rounded-full bg-emerald-500" style={{ width: `${poProgress}%` }} />
					</div>
					<p className="text-sm font-semibold">
						{poStats.received} of {poStats.total} POs received ({poProgress}%)
					</p>
					<div className="flex gap-4 text-sm text-muted">
						<div className="flex-1 rounded-lg bg-emerald-50 p-3">
							Pending Orders: {data?.pendingOrders ?? "-"}
						</div>
						<div className="flex-1 rounded-lg bg-sky-50 p-3">Approved Orders: {data?.approvedOrders ?? "-"}</div>
					</div>
				</div>
			</div>

			<div className="panel p-5">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold">Latest Orders</h2>
					<p className="text-sm text-muted">Newest first</p>
				</div>
				<table className="table">
					<thead>
						<tr>
							<th>Order</th>
							<th>Customer</th>
							<th>Status</th>
							<th>Created</th>
						</tr>
					</thead>
					<tbody>
						{data?.latestOrders?.map((o) => (
							<tr key={o.id}>
								<td>{o.orderNo}</td>
								<td>{o.customer.name}</td>
								<td>{o.status}</td>
								<td>{new Date(o.createdAt).toLocaleString()}</td>
							</tr>
						)) ?? null}
					</tbody>
				</table>
			</div>
		</div>
	);
}
