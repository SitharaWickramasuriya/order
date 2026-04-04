"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/currency";

type OrderItem = { id: string; product: { name: string }; quantity: number; price: number };
type Order = {
	id: string;
	orderNo: string;
	status: string;
	channel: string;
	createdAt: string;
	customer: { name: string; phone: string };
	items: OrderItem[];
};

export default function AdminOrders() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [message, setMessage] = useState("");

	useEffect(() => {
		const timer = setTimeout(() => {
			void load();
		}, 0);
		return () => clearTimeout(timer);
	}, []);

	async function load() {
		const res = await fetch("/api/orders");
		const data = await res.json();
		setOrders(data);
	}

	async function approve(id: string, channel: "SMS" | "WHATSAPP") {
		const res = await fetch(`/api/orders/${id}/approve`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ channel }),
		});
		if (!res.ok) {
			const err = await res.json();
			setMessage(err.error ?? "Approval failed");
			return;
		}
		setMessage("Order approved");
		await load();
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<p className="badge">Orders</p>
					<h1 className="mt-2 text-3xl font-bold">Order Management</h1>
				</div>
			</div>
			{message ? <div className="panel border-emerald-200 bg-emerald-50 p-3 text-emerald-800">{message}</div> : null}
			<div className="panel p-5">
				<table className="table">
					<thead>
						<tr>
							<th>Order</th>
							<th>Customer</th>
							<th>Channel</th>
							<th>Status</th>
							<th>Items</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{orders.map((o) => (
							<tr key={o.id}>
								<td>
									<div className="font-semibold">{o.orderNo}</div>
									<div className="text-xs text-muted">{new Date(o.createdAt).toLocaleString()}</div>
								</td>
								<td>
									<div className="font-semibold">{o.customer.name}</div>
									<div className="text-xs text-muted">{o.customer.phone}</div>
								</td>
								<td>{o.channel}</td>
								<td>{o.status}</td>
								<td>
									<ul className="list-disc pl-4 text-sm text-muted">
										{o.items.map((i) => (
											<li key={i.id}>
												{i.product?.name ?? "Item"} x {i.quantity} @ {formatCurrency(i.price)}
											</li>
										))}
									</ul>
								</td>
								<td className="space-x-2">
									{o.status === "PENDING" ? (
										<>
											<button className="btn btn-primary" type="button" onClick={() => approve(o.id, "WHATSAPP")}>
												Approve WA
											</button>
											<button className="btn btn-outline" type="button" onClick={() => approve(o.id, "SMS")}>
												Approve SMS
											</button>
										</>
									) : (
										<span className="text-sm text-muted">No actions</span>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
