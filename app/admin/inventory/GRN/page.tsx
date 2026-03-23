"use client";

import { useEffect, useState } from "react";

type PO = {
	id: string;
	poNumber: string;
	status: string;
	center: { name: string };
	supplier: { name: string };
	items: { id: string; product: { name: string }; quantity: number }[];
	grn?: { id: string } | null;
};

export default function GrnPage() {
	const [pos, setPos] = useState<PO[]>([]);
	const [message, setMessage] = useState("");

	useEffect(() => {
		const timer = setTimeout(() => {
			void load();
		}, 0);
		return () => clearTimeout(timer);
	}, []);

	async function load() {
		const res = await fetch("/api/purchase-orders");
		setPos(await res.json());
	}

	async function confirm(id: string) {
		const res = await fetch(`/api/purchase-orders/${id}/confirm-grn`, { method: "POST" });
		if (!res.ok) {
			const err = await res.json();
			setMessage(err.error ?? "Failed to confirm GRN");
			return;
		}
		setMessage("GRN created and inventory updated");
		await load();
	}

	return (
		<div className="space-y-6">
			<div>
				<p className="badge">Inventory</p>
				<h1 className="mt-2 text-3xl font-bold">Goods Received Notes</h1>
			</div>
			{message ? <div className="panel border-emerald-200 bg-emerald-50 p-3 text-emerald-800">{message}</div> : null}
			<div className="panel p-5">
				<table className="table">
					<thead>
						<tr>
							<th>PO #</th>
							<th>Supplier</th>
							<th>Center</th>
							<th>Status</th>
							<th>Items</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						{pos.map((po) => (
							<tr key={po.id}>
								<td>{po.poNumber}</td>
								<td>{po.supplier?.name}</td>
								<td>{po.center?.name}</td>
								<td>{po.status}</td>
								<td>
									<ul className="list-disc pl-4 text-sm text-muted">
										{po.items.map((i) => (
											<li key={i.id}>
												{i.product.name} x {i.quantity}
											</li>
										))}
									</ul>
								</td>
								<td>
									{po.grn ? (
										<span className="text-sm text-muted">GRN created</span>
									) : (
										<button className="btn btn-primary" type="button" onClick={() => confirm(po.id)}>
											Confirm GRN
										</button>
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
