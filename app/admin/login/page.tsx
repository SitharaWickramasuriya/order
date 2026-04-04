"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Login failed");
      return;
    }
    router.push("/admin/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-10">
        <div>
          <p className="badge">Admin Access</p>
          <h1 className="mt-2 text-3xl font-bold">Sign in to Admin</h1>
          <p className="text-sm text-muted">Use your admin credentials to continue.</p>
        </div>

        <form onSubmit={submit} className="panel space-y-4 p-5">
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Username
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded border border-slate-200 p-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Password
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded border border-slate-200 p-2"
            />
          </label>
          <button className="btn btn-primary w-full" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </form>

        <div className="text-center text-sm text-muted">
          <Link href="/">Return to storefront</Link>
        </div>
      </div>
    </div>
  );
}
