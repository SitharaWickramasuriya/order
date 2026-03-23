"use client";

import { FormEvent, useEffect, useState } from "react";

export default function AdminCategories() {
	const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
	const [name, setName] = useState("");
	const [message, setMessage] = useState<string>("");

	useEffect(() => {
		const timer = setTimeout(() => {
			void loadCategories();
		}, 0);
		return () => clearTimeout(timer);
	}, []);

	async function loadCategories() {
		const res = await fetch("/api/categories");
		const data = await res.json();
		setCategories(data);
	}

	async function submit(e: FormEvent) {
		e.preventDefault();
		if (!name.trim()) {
			setMessage("Name is required");
			return;
		}

		const res = await fetch("/api/categories", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name }),
		});

		if (!res.ok) {
			try {
				const err = await res.json();
				setMessage(err.error ?? "Failed to create category");
			} catch {
				setMessage("Failed to create category");
			}
			return;
		}

		setMessage("Category created");
		setName("");
		await loadCategories();
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<p className="badge">Catalog</p>
					<h1 className="mt-2 text-3xl font-bold">Categories</h1>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-[1.05fr_1fr]">
				<form className="panel space-y-3 p-5" onSubmit={submit}>
					<h2 className="text-xl font-semibold">Add Category</h2>
					<label className="text-sm font-semibold">
						Name
						<input
							required
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="mt-1 w-full rounded border border-slate-200 p-2"
						/>
					</label>
					<button className="btn btn-primary" type="submit">
						Create Category
					</button>
					{message ? <p className="text-sm text-emerald-700">{message}</p> : null}
				</form>

				<div className="panel p-5">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold">Category List</h2>
						<p className="text-sm text-muted">{categories.length} items</p>
					</div>
					<div className="mt-3 overflow-x-auto">
						<table className="table">
							<thead>
								<tr>
									<th>Name</th>
								</tr>
							</thead>
							<tbody>
								{categories.map((c) => (
									<tr key={c.id}>
										<td>{c.name}</td>
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
