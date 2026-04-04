"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/currency";

type Product = {
	id: string;
	itemCode: string;
	name: string;
	price: number;
	description?: string;
	category?: string;
	imageUrl?: string;
};

type Category = {
	id: string;
	name: string;
};

const emptyForm: Partial<Product> = {
	itemCode: "",
	name: "",
	price: 0,
	description: "",
	category: "",
	imageUrl: "",
};

export default function AdminProducts() {
	const [products, setProducts] = useState<Product[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [form, setForm] = useState(emptyForm);
	const [message, setMessage] = useState<string>("");

	useEffect(() => {
		const timer = setTimeout(() => {
			void loadProducts();
			void loadCategories();
		}, 0);
		return () => clearTimeout(timer);
	}, []);

	async function loadProducts() {
		const res = await fetch("/api/products");
		if (!res.ok) {
			setMessage("Failed to load products");
			return;
		}
		const data = await res.json();
		setProducts(data);
	}

	async function loadCategories() {
		const res = await fetch("/api/categories");
		if (!res.ok) {
			setMessage("Failed to load categories");
			return;
		}
		const data = await res.json();
		setCategories(data);
	}

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		if (!form.itemCode || !form.name || !form.price) {
			setMessage("Item code, name, and price are required");
			return;
		}
		const res = await fetch("/api/products", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(form),
		});
		if (!res.ok) {
			const err = await res.json();
			setMessage(err.error ?? "Failed to create product");
			return;
		}
		setMessage("Product created");
		setForm(emptyForm);
		await loadProducts();
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<p className="badge">Catalog</p>
					<h1 className="mt-2 text-3xl font-bold">Products</h1>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-[1.1fr_1fr]">
				<form className="panel space-y-3 p-5" onSubmit={submit}>
					<h2 className="text-xl font-semibold">Add Product</h2>
					<div className="grid grid-cols-2 gap-3">
						<label className="text-sm font-semibold">
							Item Code
							<input
								required
								value={form.itemCode}
								onChange={(e) => setForm({ ...form, itemCode: e.target.value })}
								className="mt-1 w-full rounded border border-slate-200 p-2"
							/>
						</label>
						<label className="text-sm font-semibold">
							Name
							<input
								required
								value={form.name}
								onChange={(e) => setForm({ ...form, name: e.target.value })}
								className="mt-1 w-full rounded border border-slate-200 p-2"
							/>
						</label>
						<label className="text-sm font-semibold">
							Price
							<input
								type="number"
								step="0.01"
								required
								value={form.price}
								onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
								className="mt-1 w-full rounded border border-slate-200 p-2"
							/>
						</label>
						<label className="text-sm font-semibold">
							Category
							<select
								value={form.category}
								onChange={(e) => setForm({ ...form, category: e.target.value })}
								className="mt-1 w-full rounded border border-slate-200 p-2"
							>
								<option value="">Select category</option>
								{categories.map((c) => (
									<option key={c.id} value={c.name}>
										{c.name}
									</option>
								))}
							</select>
						</label>
					</div>
					<label className="text-sm font-semibold">
						Description
						<textarea
							value={form.description}
							onChange={(e) => setForm({ ...form, description: e.target.value })}
							className="mt-1 w-full rounded border border-slate-200 p-2"
						/>
					</label>
					<label className="text-sm font-semibold">
						Image URL
						<input
							value={form.imageUrl}
							onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
							className="mt-1 w-full rounded border border-slate-200 p-2"
						/>
					</label>
					<button className="btn btn-primary" type="submit">
						Create Product
					</button>
					{message ? <p className="text-sm text-emerald-700">{message}</p> : null}
				</form>

				<div className="panel p-5">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold">Product List</h2>
						<p className="text-sm text-muted">{products.length} items</p>
					</div>
					<div className="mt-3 overflow-x-auto">
						<table className="table">
							<thead>
								<tr>
									<th>Code</th>
									<th>Name</th>
									<th>Category</th>
									<th>Price</th>
								</tr>
							</thead>
							<tbody>
								{products.map((p) => (
									<tr key={p.id}>
										<td>{p.itemCode}</td>
										<td>{p.name}</td>
										<td>{p.category ?? "-"}</td>
										<td>{formatCurrency(p.price)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}
