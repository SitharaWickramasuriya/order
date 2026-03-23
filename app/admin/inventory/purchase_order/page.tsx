"use client";

import { useEffect, useState } from "react";

type Supplier = { id: string; name: string };
type Center = { id: string; name: string };
type Product = { id: string; name: string; price: number };
type POItem = { productId: string; quantity: number; price: number };
type PurchaseOrder = {
	id: string;
	poNumber: string;
	status: string;
	supplier: Supplier;
	center: Center;
	items: { id: string; product: Product; quantity: number; price: number }[];
};

export default function PurchaseOrdersPage() {
	const [suppliers, setSuppliers] = useState<Supplier[]>([]);
	const [centers, setCenters] = useState<Center[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
	const [items, setItems] = useState<POItem[]>([{ productId: "", quantity: 1, price: 0 }]);
	const [supplierId, setSupplierId] = useState("");
	const [centerId, setCenterId] = useState("");
	const [pos, setPos] = useState<PurchaseOrder[]>([]);
	const [message, setMessage] = useState("");

	useEffect(() => {
		const timer = setTimeout(() => {
			void Promise.all([loadSuppliers(), loadCenters(), loadProducts(), loadPOs()]);
		}, 0);
		return () => clearTimeout(timer);
	}, []);

	async function loadSuppliers() {
		const res = await fetch("/api/suppliers");
		setSuppliers(await res.json());
	}

	async function loadCenters() {
		const res = await fetch("/api/centers");
		setCenters(await res.json());
	}

	async function loadProducts() {
		const res = await fetch("/api/products");
		setProducts(await res.json());
	}

	async function loadPOs() {
		const res = await fetch("/api/purchase-orders");
		setPos(await res.json());
	}

	function updateItem(index: number, patch: Partial<POItem>) {
		setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
	}

	function addRow() {
		setItems((prev) => [...prev, { productId: "", quantity: 1, price: 0 }]);
	}

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		if (!supplierId || !centerId) {
			setMessage("Supplier and center are required");
			return;
		}
		const validItems = items.filter((i) => i.productId && i.quantity > 0 && i.price >= 0);
		if (!validItems.length) {
			setMessage("At least one item is required");
			return;
		}
		const res = await fetch("/api/purchase-orders", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ supplierId, centerId, items: validItems }),
		});
		if (!res.ok) {
			const err = await res.json();
			setMessage(err.error ?? "Failed to create PO");
			return;
		}
		setMessage("Purchase order created");
		setItems([{ productId: "", quantity: 1, price: 0 }]);
		await loadPOs();
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<p className="badge">Inventory</p>
					<h1 className="mt-2 text-3xl font-bold">Purchase Orders</h1>
				</div>
			</div>
			{message ? <div className="panel border-emerald-200 bg-emerald-50 p-3 text-emerald-800">{message}</div> : null}

			<form className="panel space-y-4 p-5" onSubmit={submit}>
				<div className="grid grid-cols-2 gap-4">
					<label className="text-sm font-semibold">
						Supplier
						<select
							required
							value={supplierId}
							onChange={(e) => setSupplierId(e.target.value)}
							className="mt-1 w-full rounded border border-slate-200 p-2"
						>
							<option value="">Select supplier</option>
							{suppliers.map((s) => (
								<option key={s.id} value={s.id}>
									{s.name}
								</option>
							))}
						</select>
					</label>
					<label className="text-sm font-semibold">
						Center / Store
						<select
							required
							value={centerId}
							onChange={(e) => setCenterId(e.target.value)}
							className="mt-1 w-full rounded border border-slate-200 p-2"
						>
							<option value="">Select center</option>
							{centers.map((c) => (
								<option key={c.id} value={c.id}>
									{c.name}
								</option>
							))}
						</select>
					</label>
				</div>

				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-semibold">Items</h3>
						<button className="btn btn-outline" type="button" onClick={addRow}>
							+ Add Item
						</button>
					</div>
					<div className="space-y-2">
						{items.map((item, idx) => (
							<div key={idx} className="grid grid-cols-3 gap-2">
								<select
									required
									value={item.productId}
									onChange={(e) => updateItem(idx, { productId: e.target.value })}
									className="rounded border border-slate-200 p-2"
								>
									<option value="">Product</option>
									{products.map((p) => (
										<option key={p.id} value={p.id}>
											{p.name}
										</option>
									))}
								</select>
								<input
									type="number"
									min={1}
									value={item.quantity}
									onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
									className="rounded border border-slate-200 p-2"
									placeholder="Qty"
								/>
								<input
									type="number"
									step="0.01"
									min={0}
									value={item.price}
									onChange={(e) => updateItem(idx, { price: Number(e.target.value) })}
									className="rounded border border-slate-200 p-2"
									placeholder="Price"
								/>
							</div>
						))}
					</div>
				</div>

				<button className="btn btn-primary" type="submit">
					Create Purchase Order
				</button>
			</form>

			<div className="panel p-5">
				<h2 className="text-xl font-semibold">Recent POs</h2>
				<div className="mt-3 overflow-x-auto">
					<table className="table">
						<thead>
							<tr>
								<th>PO #</th>
								<th>Supplier</th>
								<th>Center</th>
								<th>Status</th>
								<th>Items</th>
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
													{i.product.name} x {i.quantity} @ ${i.price.toFixed(2)}
												</li>
											))}
										</ul>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
