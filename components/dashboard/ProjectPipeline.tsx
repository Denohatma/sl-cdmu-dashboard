"use client";

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

export default function ProjectPipeline({ projects }: { projects: Project[] }) {
  const totalCost = projects.reduce((sum, p) => sum + p.cost_usd_million, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-cdmu-navy">Priority Projects</h2>
        <span className="text-sm text-cdmu-gray-500">
          ${totalCost.toLocaleString()}M total pipeline
        </span>
      </div>

      <div className="bg-white rounded-xl border border-cdmu-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cdmu-gray-200 bg-cdmu-gray-50">
              <th className="text-left px-4 py-3 font-medium text-cdmu-gray-700">Project</th>
              <th className="text-right px-4 py-3 font-medium text-cdmu-gray-700">Cost (USD M)</th>
              <th className="text-left px-4 py-3 font-medium text-cdmu-gray-700">Status</th>
              <th className="text-left px-4 py-3 font-medium text-cdmu-gray-700 hidden md:table-cell">Notes</th>
              <th className="text-center px-4 py-3 font-medium text-cdmu-gray-700">PFS</th>
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
                    {project.notes}
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
