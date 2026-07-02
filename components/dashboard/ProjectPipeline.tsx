"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Project } from "@/lib/types";
import { useRole } from "@/lib/role-context";
import { calcCDMUScore, scoreLabel, formatUSD } from "@/lib/scoring";

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string; dot: string }> = {
  funded: { bg: "bg-green-100", text: "text-green-800", label: "Funded", dot: "bg-green-500" },
  in_progress: { bg: "bg-blue-100", text: "text-blue-800", label: "In Progress", dot: "bg-blue-500" },
  procurement: { bg: "bg-amber-100", text: "text-amber-800", label: "Procurement", dot: "bg-amber-500" },
  feasibility: { bg: "bg-purple-100", text: "text-purple-800", label: "Feasibility", dot: "bg-purple-500" },
  development: { bg: "bg-orange-100", text: "text-orange-800", label: "Development", dot: "bg-orange-500" },
};

const PILLAR_NAMES: Record<number, string> = {
  1: "Generation",
  2: "Transmission & Distribution",
  3: "On-Grid Distribution",
  4: "Off-Grid & Last-Mile",
  5: "Clean Cooking",
};

const TYPE_LABELS: Record<string, string> = {
  generation: "Generation",
  transmission: "Transmission",
  infrastructure: "Infrastructure",
  off_grid: "Off-Grid",
};

type FilterTab = "all" | "generation" | "transmission" | "infrastructure" | "off_grid";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All projects" },
  { key: "generation", label: "Generation" },
  { key: "transmission", label: "Transmission" },
  { key: "infrastructure", label: "Infrastructure" },
  { key: "off_grid", label: "Off-Grid & Cooking" },
];

function EditNotesModal({
  projectName, value, onChange, onSave, onCancel,
}: {
  projectName: string; value: string; onChange: (v: string) => void; onSave: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-cdmu-navy/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-xl border border-cdmu-gray-200 w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-semibold text-cdmu-navy mb-1">Edit Notes</h3>
        <p className="text-sm text-cdmu-gray-500 mb-4">{projectName}</p>
        <textarea
          className="w-full border border-cdmu-gray-200 rounded-xl px-3 py-2 text-sm text-cdmu-gray-900 focus:outline-none focus:ring-2 focus:ring-cdmu-blue focus:border-cdmu-blue resize-y min-h-[120px]"
          rows={5}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-medium text-cdmu-gray-700 bg-cdmu-gray-100 hover:bg-cdmu-gray-200 transition-colors">Cancel</button>
          <button type="button" onClick={onSave} className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-cdmu-blue hover:bg-cdmu-navy transition-colors">Save</button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectPipeline({ projects }: { projects: Project[] }) {
  const { permissions } = useRole();
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>(() =>
    Object.fromEntries(projects.map((p) => [p.id, p.notes || ""]))
  );
  const [draftNote, setDraftNote] = useState("");

  const scored = useMemo(() =>
    projects.map((p) => ({ ...p, cdmuScore: calcCDMUScore(p) })),
    [projects]
  );

  const filtered = useMemo(() => {
    let list = scored;
    if (filterTab !== "all") list = list.filter((p) => p.type === filterTab);
    if (statusFilter !== "all") list = list.filter((p) => p.status === statusFilter);
    return list;
  }, [scored, filterTab, statusFilter]);

  const totalCost = projects.reduce((sum, p) => sum + p.cost_usd_million, 0);
  const highReadiness = scored.filter((p) => p.cdmuScore >= 70).length;
  const avgScore = scored.length > 0 ? Math.round(scored.reduce((s, p) => s + p.cdmuScore, 0) / scored.length) : 0;
  const totalCapacity = projects.reduce((s, p) => s + (p.capacity_mw || 0), 0);

  const editingProject = editingId ? projects.find((p) => p.id === editingId) : null;

  function openEditor(projectId: string) {
    setDraftNote(notes[projectId] || "");
    setEditingId(projectId);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-cdmu-navy">Deal Pipeline</h2>
          <p className="text-xs text-cdmu-gray-500">Q2 2026 · Updated {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-cdmu-gray-200 p-4">
          <p className="text-[10px] uppercase tracking-wider text-cdmu-gray-500 font-medium">Total Pipeline Value</p>
          <p className="text-2xl font-bold text-cdmu-navy mt-1">{formatUSD(totalCost)}</p>
          <p className="text-[10px] text-cdmu-gray-400 mt-0.5">across {projects.length} projects</p>
        </div>
        <div className="bg-white rounded-xl border border-cdmu-gray-200 p-4">
          <p className="text-[10px] uppercase tracking-wider text-cdmu-gray-500 font-medium">High Readiness</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{highReadiness}</p>
          <p className="text-[10px] text-cdmu-gray-400 mt-0.5">CDMU score &ge; 70</p>
        </div>
        <div className="bg-white rounded-xl border border-cdmu-gray-200 p-4">
          <p className="text-[10px] uppercase tracking-wider text-cdmu-gray-500 font-medium">Total Capacity</p>
          <p className="text-2xl font-bold text-cdmu-navy mt-1">{totalCapacity.toLocaleString()} MW</p>
          <p className="text-[10px] text-cdmu-gray-400 mt-0.5">generation pipeline</p>
        </div>
        <div className="bg-white rounded-xl border border-cdmu-gray-200 p-4">
          <p className="text-[10px] uppercase tracking-wider text-cdmu-gray-500 font-medium">Avg. CDMU Score</p>
          <p className="text-2xl font-bold text-cdmu-navy mt-1">{avgScore}</p>
          <p className="text-[10px] text-cdmu-gray-400 mt-0.5">scored projects</p>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-cdmu-gray-200">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key)}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              filterTab === tab.key
                ? "border-cdmu-navy text-cdmu-navy"
                : "border-transparent text-cdmu-gray-500 hover:text-cdmu-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 pb-1">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-cdmu-gray-200 rounded-lg px-2 py-1 bg-white text-cdmu-gray-600"
          >
            <option value="all">Any status</option>
            <option value="in_progress">In Progress</option>
            <option value="funded">Funded</option>
            <option value="procurement">Procurement</option>
            <option value="development">Development</option>
            <option value="feasibility">Feasibility</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-cdmu-gray-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b border-cdmu-gray-200 bg-cdmu-gray-50 text-cdmu-gray-500">
              <th className="text-left px-4 py-3 font-medium">Project</th>
              <th className="text-left px-4 py-3 font-medium">Pillar</th>
              <th className="text-left px-4 py-3 font-medium">Lead / Sponsor</th>
              <th className="text-right px-4 py-3 font-medium">Investment</th>
              <th className="text-center px-4 py-3 font-medium">CDMU Score</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              {permissions.canEditNotes && <th className="text-center px-4 py-3 font-medium w-10"></th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((project) => {
              const statusStyle = STATUS_CONFIG[project.status] || STATUS_CONFIG.feasibility;
              const sl = scoreLabel(project.cdmuScore);
              return (
                <tr
                  key={project.id}
                  className="border-b border-cdmu-gray-100 last:border-0 hover:bg-cdmu-gray-50 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <Link href={`/project/${project.id}`} className="block">
                      <p className="font-semibold text-cdmu-gray-900 group-hover:text-cdmu-blue transition-colors">
                        {project.name}
                      </p>
                      <p className="text-[10px] text-cdmu-gray-400 mt-0.5">
                        {TYPE_LABELS[project.type] || project.type} · {project.region}
                      </p>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-cdmu-gray-600">
                    {project.pillar ? PILLAR_NAMES[project.pillar] || `Pillar ${project.pillar}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-cdmu-gray-600 max-w-[160px]">
                    {project.lead || "—"}
                  </td>
                  <td className="text-right px-4 py-3 font-semibold text-cdmu-navy">
                    {formatUSD(project.cost_usd_million)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-bold text-cdmu-navy">{project.cdmuScore}</span>
                      <span className={`text-[9px] font-bold uppercase ${sl.color}`}>{sl.text}</span>
                    </div>
                    <div className="w-16 h-1 rounded-full bg-cdmu-gray-200 mx-auto mt-1">
                      <div
                        className={`h-1 rounded-full ${project.cdmuScore >= 70 ? "bg-green-500" : project.cdmuScore >= 50 ? "bg-amber-500" : "bg-red-400"}`}
                        style={{ width: `${project.cdmuScore}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
                      <span className="text-xs text-cdmu-gray-700">{statusStyle.label}</span>
                    </span>
                  </td>
                  {permissions.canEditNotes && (
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); openEditor(project.id); }}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-cdmu-gray-400 hover:text-cdmu-blue hover:bg-cdmu-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                        title="Edit Notes"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                          <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                        </svg>
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-cdmu-gray-400 py-8">No projects match the current filters.</p>
      )}

      {editingId && editingProject && (
        <EditNotesModal
          projectName={editingProject.name}
          value={draftNote}
          onChange={setDraftNote}
          onSave={() => { if (editingId) setNotes((prev) => ({ ...prev, [editingId]: draftNote })); setEditingId(null); }}
          onCancel={() => setEditingId(null)}
        />
      )}
    </div>
  );
}
