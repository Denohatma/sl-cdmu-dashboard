"use client";

import { useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/types";

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  funded: { bg: "bg-green-100", text: "text-green-800", label: "Funded" },
  in_progress: { bg: "bg-blue-100", text: "text-blue-800", label: "In Progress" },
  procurement: { bg: "bg-amber-100", text: "text-amber-800", label: "Procurement" },
  feasibility: { bg: "bg-purple-100", text: "text-purple-800", label: "Feasibility" },
  development: { bg: "bg-orange-100", text: "text-orange-800", label: "Development" },
};

const TYPE_ICONS: Record<string, string> = {
  generation: "⚡",
  transmission: "🔌",
  infrastructure: "🏗️",
  off_grid: "☀️",
};

function EditNotesModal({
  projectName,
  value,
  onChange,
  onSave,
  onCancel,
}: {
  projectName: string;
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-cdmu-navy/40 backdrop-blur-sm"
        onClick={onCancel}
      />
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
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium text-cdmu-gray-700 bg-cdmu-gray-100 hover:bg-cdmu-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-cdmu-blue hover:bg-cdmu-navy transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectPipeline({ projects }: { projects: Project[] }) {
  const totalCost = projects.reduce((sum, p) => sum + p.cost_usd_million, 0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>(() =>
    Object.fromEntries(projects.map((p) => [p.id, p.notes || ""]))
  );
  const [draftNote, setDraftNote] = useState("");

  const editingProject = editingId
    ? projects.find((p) => p.id === editingId)
    : null;

  function openEditor(projectId: string) {
    setDraftNote(notes[projectId] || "");
    setEditingId(projectId);
  }

  function handleSave() {
    if (editingId) {
      setNotes((prev) => ({ ...prev, [editingId]: draftNote }));
    }
    setEditingId(null);
  }

  function handleCancel() {
    setEditingId(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-cdmu-navy">Priority Projects</h2>
        <span className="text-sm text-cdmu-gray-500">
          ${totalCost.toLocaleString()}M total pipeline
        </span>
      </div>

      <div className="bg-white rounded-xl border border-cdmu-gray-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-cdmu-gray-200 bg-cdmu-gray-50">
              <th className="text-left px-4 py-3 font-medium text-cdmu-gray-700">Project</th>
              <th className="text-right px-4 py-3 font-medium text-cdmu-gray-700">Cost (USD M)</th>
              <th className="text-left px-4 py-3 font-medium text-cdmu-gray-700">Status</th>
              <th className="text-left px-4 py-3 font-medium text-cdmu-gray-700 hidden md:table-cell">Notes</th>
              <th className="text-center px-4 py-3 font-medium text-cdmu-gray-700">PFS</th>
              <th className="text-center px-4 py-3 font-medium text-cdmu-gray-700">Edit</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const statusStyle = STATUS_CONFIG[project.status] || STATUS_CONFIG.feasibility;
              return (
                <tr
                  key={project.id}
                  className="border-b border-cdmu-gray-100 last:border-0 hover:bg-cdmu-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span>{TYPE_ICONS[project.type] || "📋"}</span>
                      <div>
                        <p className="font-medium text-cdmu-gray-900">{project.name}</p>
                        <p className="text-xs text-cdmu-gray-500 capitalize">{project.region}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-right px-4 py-3 font-semibold text-cdmu-navy">
                    ${project.cost_usd_million}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                    >
                      {statusStyle.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-cdmu-gray-500 hidden md:table-cell max-w-[200px] truncate">
                    {notes[project.id]}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/pfs/${project.id}`}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-cdmu-teal text-white hover:bg-cdmu-teal-light transition-colors"
                      target="_blank"
                    >
                      View PFS
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => openEditor(project.id)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-cdmu-gray-500 hover:text-cdmu-blue hover:bg-cdmu-gray-100 transition-colors"
                      title="Edit Notes"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingId && editingProject && (
        <EditNotesModal
          projectName={editingProject.name}
          value={draftNote}
          onChange={setDraftNote}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
