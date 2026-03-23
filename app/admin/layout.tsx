import Link from "next/link";
import type { ReactNode } from "react";

const navLinks = [
	{ href: "/admin/dashboard", label: "Dashboard" },
	{ href: "/admin/products", label: "Products" },
	{ href: "/admin/categories", label: "Categories" },
	{ href: "/admin/customers", label: "Customers" },
	{ href: "/admin/orders", label: "Orders" },
	{ href: "/admin/inventory/purchase_order", label: "Purchase Orders" },
	{ href: "/admin/inventory/GRN", label: "GRN" },
	{ href: "/admin/inventory/stock_transfer", label: "Stock Transfer" },
	{ href: "/admin/delivery", label: "Delivery Schedules" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen bg-slate-50">
			<div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
				<aside className="sidebar w-64 rounded-2xl p-4 shadow-lg">
					<div className="mb-6 text-lg font-bold text-white">OrderFlow Admin</div>
					<nav className="space-y-1 text-sm font-semibold">
						{navLinks.map((link) => (
							<Link key={link.href} href={link.href} className="hover:no-underline">
								{link.label}
							</Link>
						))}
					</nav>
				</aside>
				<main className="flex-1 space-y-6">{children}</main>
			</div>
		</div>
	);
}
