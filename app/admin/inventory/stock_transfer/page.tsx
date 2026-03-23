"use client";

import { useEffect, useState } from "react";

type Center = { id: string; name: string };
type Product = { id: string; name: string; price: number };
type Transfer = {
	id: string;
	transferNo: string;
	fromCenter: Center;
	toCenter: Center;
	product: Product;
	quantity: number;
	createdAt: string;
};

const initialForm = { fromCenterId: "", toCenterId: "", productId: "", quantity: 1 };

export default function StockTransferPage() {
	const [centers, setCenters] = useState<Center[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
	const [transfers, setTransfers] = useState<Transfer[]>([]);
	const [form, setForm] = useState(initialForm);
	const [message, setMessage] = useState("");

	useEffect(() => {
		const timer = setTimeout(() => {
			void Promise.all([loadCenters(), loadProducts(), loadTransfers()]);
		}, 0);
		return () => clearTimeout(timer);
	}, []);

	async function loadCenters() {
		const res = await fetch("/api/centers");
		setCenters(await res.json());
	}

	async function loadProducts() {
		const res = await fetch("/api/products");
		setProducts(await res.json());
	}

	async function loadTransfers() {
		const res = await fetch("/api/stock-transfer");
		setTransfers(await res.json());
	}

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		if (!form.fromCenterId || !form.toCenterId || !form.productId || form.quantity <= 0) {
			setMessage("All fields required");
			return;
		}
		const res = await fetch("/api/stock-transfer", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(form),
		});
		if (!res.ok) {
			const err = await res.json();
			setMessage(err.error ?? "Transfer failed");
			return;
		}
		setMessage("Transfer recorded");
		setForm(initialForm);
		await loadTransfers();
	}

	return (
		<div className="space-y-6">
			<div>
				<p className="badge">Inventory</p>
				<h1 className="mt-2 text-3xl font-bold">Stock Transfer</h1>
			</div>
			{message ? <div className="panel border-emerald-200 bg-emerald-50 p-3 text-emerald-800">{message}</div> : null}
			<form className="panel space-y-3 p-5" onSubmit={submit}>
				<div className="grid grid-cols-2 gap-3">
					<label className="text-sm font-semibold">
						From Center
						<select
							required
							value={form.fromCenterId}
							onChange={(e) => setForm({ ...form, fromCenterId: e.target.value })}
							className="mt-1 w-full rounded border border-slate-200 p-2"
						>
							<option value="">Select</option>
							{centers.map((c) => (
								<option key={c.id} value={c.id}>
									{c.name}
								</option>
							))}
						</select>
					</label>
					<label className="text-sm font-semibold">
						To Center
						<select
							required
							value={form.toCenterId}
							onChange={(e) => setForm({ ...form, toCenterId: e.target.value })}
							className="mt-1 w-full rounded border border-slate-200 p-2"
						>
							<option value="">Select</option>
							{centers.map((c) => (
								<option key={c.id} value={c.id}>
									{c.name}
								</option>
							))}
						</select>
					</label>
				</div>
				<label className="text-sm font-semibold">
					Product
					<select
						required
						value={form.productId}
						onChange={(e) => setForm({ ...form, productId: e.target.value })}
						className="mt-1 w-full rounded border border-slate-200 p-2"
					>
						<option value="">Select product</option>
						{products.map((p) => (
							<option key={p.id} value={p.id}>
								{p.name}
							</option>
						))}
					</select>
				</label>
				<label className="text-sm font-semibold">
					Quantity
					<input
						type="number"
						min={1}
						required
						value={form.quantity}
						onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
						className="mt-1 w-full rounded border border-slate-200 p-2"
					/>
				</label>
				<button className="btn btn-primary" type="submit">
					Transfer Stock
				</button>
			</form>

			<div className="panel p-5">
				<h2 className="text-xl font-semibold">Recent Transfers</h2>
				<div className="mt-3 overflow-x-auto">
					<table className="table">
						<thead>
							<tr>
								<th>Transfer #</th>
								<th>From</th>
								<th>To</th>
								<th>Product</th>
								<th>Quantity</th>
								<th>Date</th>
							</tr>
						</thead>
						<tbody>
							{transfers.map((t) => (
								<tr key={t.id}>
									<td>{t.transferNo}</td>
									<td>{t.fromCenter?.name}</td>
									<td>{t.toCenter?.name}</td>
									<td>{t.product?.name}</td>
									<td>{t.quantity}</td>
									<td>{new Date(t.createdAt).toLocaleString()}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
