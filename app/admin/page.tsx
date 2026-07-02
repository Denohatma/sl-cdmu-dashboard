"use client";

import { useState } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [jsonContent, setJsonContent] = useState("");
  const [selectedFile, setSelectedFile] = useState("kpis");
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const FILES = [
    { key: "kpis", label: "KPI Targets" },
    { key: "pillars", label: "Pillar Progress" },
    { key: "investments", label: "Investment Data" },
    { key: "projects", label: "Priority Projects" },
    { key: "metrics", label: "Sector Metrics" },
  ];

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAuthenticated(true);
        loadFile(selectedFile);
      } else {
        setStatus({ type: "error", message: "Invalid password" });
      }
    } catch {
      setStatus({ type: "error", message: "Authentication failed" });
    }
  }

  async function loadFile(file: string) {
    try {
      const res = await fetch(`/data/${file}.json`);
      const data = await res.json();
      setJsonContent(JSON.stringify(data, null, 2));
      setSelectedFile(file);
      setStatus(null);
    } catch {
      setStatus({ type: "error", message: `Failed to load ${file}.json` });
    }
  }

  async function handleSave() {
    setLoading(true);
    try {
      JSON.parse(jsonContent);
      const res = await fetch("/api/admin/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          file: selectedFile,
          content: jsonContent,
        }),
      });
      if (res.ok) {
        setStatus({ type: "success", message: `${selectedFile}.json updated successfully` });
      } else {
        const err = await res.json();
        setStatus({ type: "error", message: err.error || "Update failed" });
      }
    } catch {
      setStatus({ type: "error", message: "Invalid JSON format" });
    }
    setLoading(false);
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-cdmu-gray-50 flex items-center justify-center">
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm"
        >
          <div className="w-12 h-12 rounded-xl bg-cdmu-navy flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-cdmu-navy text-center mb-1">
            CDMU Admin
          </h1>
          <p className="text-sm text-cdmu-gray-500 text-center mb-6">
            Enter password to update dashboard data
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full px-4 py-2.5 border border-cdmu-gray-200 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-cdmu-teal"
          />
          <button
            type="submit"
            className="w-full bg-cdmu-navy text-white py-2.5 rounded-lg text-sm font-medium hover:bg-cdmu-navy-light transition-colors"
          >
            Sign In
          </button>
          {status && (
            <p className={`mt-3 text-sm text-center ${status.type === "error" ? "text-cdmu-red" : "text-cdmu-green"}`}>
              {status.message}
            </p>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cdmu-gray-50">
      <header className="bg-cdmu-navy px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-white font-bold">CDMU Admin</h1>
          <span className="text-white/50 text-sm">Data Management</span>
        </div>
        <a
          href="/"
          className="text-white/70 text-sm hover:text-white transition-colors"
        >
          Back to Dashboard
        </a>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {FILES.map((f) => (
            <button
              key={f.key}
              onClick={() => loadFile(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedFile === f.key
                  ? "bg-cdmu-navy text-white"
                  : "bg-white text-cdmu-gray-700 hover:bg-cdmu-gray-100 border border-cdmu-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-cdmu-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-cdmu-gray-200 flex items-center justify-between bg-cdmu-gray-50">
            <span className="text-sm font-medium text-cdmu-gray-700">
              {selectedFile}.json
            </span>
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-cdmu-green text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
          <textarea
            value={jsonContent}
            onChange={(e) => setJsonContent(e.target.value)}
            className="w-full h-[60vh] p-4 font-mono text-sm text-cdmu-gray-900 focus:outline-none resize-none"
            spellCheck={false}
          />
        </div>

        {status && (
          <div
            className={`mt-4 px-4 py-3 rounded-lg text-sm ${
              status.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}
