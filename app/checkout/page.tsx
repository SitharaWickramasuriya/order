"use client";

import { useState } from "react";
import { CartItem, getCart, setCart } from "@/lib/cart";

export default function CheckoutPage() {
	const [items, setItems] = useState<CartItem[]>(() => getCart());
	const [customer, setCustomer] = useState({ name: "", phone: "", address: "" });
	const [notes, setNotes] = useState("");
	const [message, setMessage] = useState("");
	const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

	async function submitOrder(e: React.FormEvent) {
		e.preventDefault();
		if (!items.length) {
			setMessage("Cart is empty");
			return;
		}
		const payload = {
			customer,
			items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
			notes,
		};
		const res = await fetch("/api/orders", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});
		const data = await res.json();
		if (!res.ok) {
			setMessage(data.error ?? "Order failed");
			return;
		}
		setMessage(`Order placed! Reference: ${data.orderNo}`);
		setCart([]);
		setItems([]);
	}

	return (
		<div className="app-shell grid gap-8 md:grid-cols-[1.5fr_1fr]">
			<form className="panel space-y-4 p-6" onSubmit={submitOrder}>
				<div>
					<p className="badge">Secure Checkout</p>
					<h1 className="mt-2 text-3xl font-bold">Customer Details</h1>
				</div>

				<label className="flex flex-col gap-1 text-sm font-semibold">
					Full name
					<input
						required
						value={customer.name}
						onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
						className="rounded border border-slate-200 p-2"
					/>
				</label>
				<label className="flex flex-col gap-1 text-sm font-semibold">
					Phone number
					<input
						required
						value={customer.phone}
						onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
						className="rounded border border-slate-200 p-2"
					/>
				</label>
				<label className="flex flex-col gap-1 text-sm font-semibold">
					Address
					<textarea
						required
						value={customer.address}
						onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
						className="rounded border border-slate-200 p-2"
					/>
				</label>
				<label className="flex flex-col gap-1 text-sm font-semibold">
					Notes (optional)
					<textarea
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						className="rounded border border-slate-200 p-2"
					/>
				</label>

				<button className="btn btn-primary" type="submit">
					Place order
				</button>
				{message ? <p className="text-sm text-emerald-700">{message}</p> : null}
			</form>

			<div className="panel p-6">
				<h2 className="text-xl font-semibold">Order Summary</h2>
				{items.length === 0 ? (
					<p className="mt-3 text-muted">No items in cart.</p>
				) : (
					<div className="mt-3 space-y-3">
						{items.map((item) => (
							<div key={item.productId} className="flex items-center justify-between">
								<div>
									<p className="font-semibold">{item.name}</p>
									<p className="text-sm text-muted">Qty {item.quantity}</p>
								</div>
								<p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
							</div>
						))}
						<div className="flex items-center justify-between border-t border-slate-200 pt-3 text-lg font-bold">
							<span>Total</span>
							<span className="text-emerald-700">${total.toFixed(2)}</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
