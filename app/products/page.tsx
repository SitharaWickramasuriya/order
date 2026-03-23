"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { addToCart } from "@/lib/cart";

type Product = {
	id: string;
	itemCode: string;
	name: string;
	description?: string;
	category?: string;
	price: number;
};

export default function ProductsPage() {
	const [products, setProducts] = useState<Product[]>([]);
	const [message, setMessage] = useState("");

	useEffect(() => {
		const timer = setTimeout(() => {
			void fetch("/api/products")
				.then((res) => res.json())
				.then(setProducts);
		}, 0);
		return () => clearTimeout(timer);
	}, []);

	function onAdd(product: Product) {
		addToCart({ productId: product.id, name: product.name, price: product.price, quantity: 1 });
		setMessage(`${product.name} added to cart`);
		setTimeout(() => setMessage(""), 2000);
	}

	return (
		<div className="app-shell space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<p className="badge">Fresh Selection</p>
					<h1 className="mt-3 text-3xl font-bold">Shop Products</h1>
				</div>
				<div className="flex gap-2">
					<Link className="btn btn-outline" href="/cart">
						View Cart
					</Link>
					<Link className="btn btn-primary" href="/checkout">
						Checkout
					</Link>
				</div>
			</div>

			{message ? <div className="panel border-emerald-200 bg-emerald-50 p-3 text-emerald-800">{message}</div> : null}

			<div className="grid-cards">
				{products.map((product) => (
					<article key={product.id} className="panel p-5">
						<div className="text-xs uppercase text-muted">{product.itemCode}</div>
						<h2 className="mt-2 text-xl font-semibold">{product.name}</h2>
						<p className="text-sm text-muted">{product.category ?? "Grocery"}</p>
						<p className="mt-3 line-clamp-3 text-sm text-muted">{product.description ?? ""}</p>
						<div className="mt-4 flex items-center justify-between">
							<span className="text-2xl font-bold text-emerald-700">${product.price.toFixed(2)}</span>
							<button className="btn btn-primary" type="button" onClick={() => onAdd(product)}>
								Add
							</button>
						</div>
					</article>
				))}
			</div>
		</div>
	);
}
