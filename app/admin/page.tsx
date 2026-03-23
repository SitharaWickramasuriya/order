import Link from "next/link";

export default function AdminHome() {
	return (
		<div className="space-y-4">
			<h1 className="text-3xl font-bold">Admin Management</h1>
			<p className="text-muted">Use the sidebar to navigate. Quick links below:</p>
			<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
				<Link className="panel p-4 hover:shadow" href="/admin/dashboard">
					<p className="text-sm text-muted">Overview</p>
					<h2 className="text-lg font-semibold">Dashboard</h2>
				</Link>
				<Link className="panel p-4 hover:shadow" href="/admin/orders">
					<p className="text-sm text-muted">Orders</p>
					<h2 className="text-lg font-semibold">Review & approve</h2>
				</Link>
				<Link className="panel p-4 hover:shadow" href="/admin/products">
					<p className="text-sm text-muted">Catalog</p>
					<h2 className="text-lg font-semibold">Manage products</h2>
				</Link>
			</div>
		</div>
	);
}
