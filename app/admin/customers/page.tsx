"use client";

import { useEffect, useState } from "react";

type Customer = { id: string; name: string; phone: string; address?: string; createdAt: string };

const emptyForm = { name: "", phone: "", address: "" };

export default function AdminCustomers() {
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [form, setForm] = useState(emptyForm);
	const [message, setMessage] = useState("");

	useEffect(() => {
		const timer = setTimeout(() => {
			void load();
		}, 0);
		return () => clearTimeout(timer);
	}, []);

	async function load() {
		const res = await fetch("/api/customers");
		const data = await res.json();
		setCustomers(data);
	}

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		if (!form.name || !form.phone) {
			setMessage("Name and phone are required");
			return;
		}
		const res = await fetch("/api/customers", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(form),
		});
		if (!res.ok) {
			const err = await res.json();
			setMessage(err.error ?? "Failed to save");
			return;
		}
		setMessage("Customer saved");
		setForm(emptyForm);
		await load();
	}

	return (
		<div className="space-y-6">
			<div>
				<p className="badge">People</p>
				<h1 className="mt-2 text-3xl font-bold">Customers</h1>
			</div>

			<div className="grid gap-4 md:grid-cols-[1.1fr_1fr]">
				<form className="panel space-y-3 p-5" onSubmit={submit}>
					<h2 className="text-xl font-semibold">Add Customer</h2>
					<label className="text-sm font-semibold">
						Full name
						<input
							required
							value={form.name}
							onChange={(e) => setForm({ ...form, name: e.target.value })}
							className="mt-1 w-full rounded border border-slate-200 p-2"
						/>
					</label>
					<label className="text-sm font-semibold">
						Phone
						<input
							required
							value={form.phone}
							onChange={(e) => setForm({ ...form, phone: e.target.value })}
							className="mt-1 w-full rounded border border-slate-200 p-2"
						/>
					</label>
					<label className="text-sm font-semibold">
						Address
						<textarea
							value={form.address}
							onChange={(e) => setForm({ ...form, address: e.target.value })}
							className="mt-1 w-full rounded border border-slate-200 p-2"
						/>
					</label>
					<button className="btn btn-primary" type="submit">
						Save Customer
					</button>
					{message ? <p className="text-sm text-emerald-700">{message}</p> : null}
				</form>

				<div className="panel p-5">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold">Customer List</h2>
						<p className="text-sm text-muted">{customers.length} records</p>
					</div>
					<div className="mt-3 overflow-x-auto">
						<table className="table">
							<thead>
								<tr>
									<th>Name</th>
									<th>Phone</th>
									<th>Address</th>
									<th>Joined</th>
								</tr>
							</thead>
							<tbody>
								{customers.map((c) => (
									<tr key={c.id}>
										<td>{c.name}</td>
										<td>{c.phone}</td>
										<td>{c.address ?? "-"}</td>
										<td>{new Date(c.createdAt).toLocaleDateString()}</td>
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
