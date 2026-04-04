"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CartItem, getCart, setCart } from "@/lib/cart";
import { formatCurrency } from "@/lib/currency";

export default function CartPage() {
	const [items, setItems] = useState<CartItem[]>(() => getCart());

	useEffect(() => {
		setCart(items);
	}, [items]);

	const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

	function updateQty(id: string, qty: number) {
		setItems((prev) => prev.map((i) => (i.productId === id ? { ...i, quantity: Math.max(1, qty) } : i)));
	}

	function removeItem(id: string) {
		setItems((prev) => prev.filter((i) => i.productId !== id));
	}

	return (
		<div className="app-shell space-y-6">
			<h1 className="text-3xl font-bold">Your Cart</h1>
			{items.length === 0 ? (
				<div className="panel p-6 text-muted">Cart is empty. Browse products to add items.</div>
			) : (
				<div className="panel p-4">
					<table className="table">
						<thead>
							<tr>
								<th>Product</th>
								<th>Price</th>
								<th>Qty</th>
								<th>Total</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{items.map((item) => (
								<tr key={item.productId}>
									<td>{item.name}</td>
									<td>{formatCurrency(item.price)}</td>
									<td>
										<input
											type="number"
											min={1}
											value={item.quantity}
											onChange={(e) => updateQty(item.productId, Number(e.target.value))}
											className="w-16 rounded border border-slate-200 p-1"
										/>
									</td>
									<td>{formatCurrency(item.price * item.quantity)}</td>
									<td>
										<button className="text-red-600" onClick={() => removeItem(item.productId)} type="button">
											Remove
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
					<div className="mt-4 flex items-center justify-between">
						<span className="text-lg font-semibold">Subtotal</span>
						<span className="text-2xl font-bold text-emerald-700">{formatCurrency(total)}</span>
					</div>
				</div>
			)}

			<div className="flex gap-3">
				<Link href="/products" className="btn btn-outline">
					Continue shopping
				</Link>
				<Link href="/checkout" className="btn btn-primary">
					Proceed to checkout
				</Link>
			</div>
		</div>
	);
}
