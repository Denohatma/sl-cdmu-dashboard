"use client";

import { useState } from "react";
import type { Pillar, Status } from "@/lib/types";

const STATUS_STYLES: Record<Status, { bg: string; text: string; label: string; rowBg: string }> = {
  not_started: { bg: "bg-cdmu-gray-200", text: "text-cdmu-gray-700", label: "Not Started", rowBg: "bg-gray-50" },
  in_progress: { bg: "bg-blue-100", text: "text-blue-800", label: "In Progress", rowBg: "bg-blue-50/50" },
  completed: { bg: "bg-green-100", text: "text-green-800", label: "Completed", rowBg: "bg-green-50/50" },
  delayed: { bg: "bg-red-100", text: "text-red-800", label: "Delayed", rowBg: "bg-red-50/50" },
};

const CDMU_OWNERS: Record<string, string> = {
  "1.1": "Dr. Alhaji Kamara",
  "1.2": "Eng. Mohamed Conteh",
  "1.3": "Dr. Alhaji Kamara",
  "2.1": "Eng. Aminata Sesay",
  "2.2": "Eng. Aminata Sesay",
  "2.3": "Eng. Aminata Sesay",
  "3.1": "Mr. Ibrahim Bangura",
  "3.2": "Mr. Ibrahim Bangura",
  "3.3": "Ms. Fatmata Koroma",
  "3.4": "Mr. Ibrahim Bangura",
  "4.1": "Ms. Mariama Jalloh",
  "4.2": "Ms. Mariama Jalloh",
  "4.3": "Ms. Fatmata Koroma",
  "4.4": "Ms. Mariama Jalloh",
  "5.1": "Mr. Abu Bakarr Turay",
  "5.2": "Mr. Abu Bakarr Turay",
  "5.3": "Mr. Abu Bakarr Turay",
};

const NOTES: Record<string, string> = {
  "1.1": "Organogram review completed. Awaiting EGCG approval for new structure. 3 new posts identified.",
  "1.2": "Pending IRP completion. ToR drafted for T&D consultant.",
  "1.3": "Planning software procurement in progress. IRP 2021-2040 data collection ongoing.",
  "2.1": "Guinea PPA (10 MW) signed May 2025. Negotiations ongoing for additional 30 MW from CI.",
  "2.2": "WAPP tariff harmonisation study commissioned. EWRC capacity building ongoing.",
  "2.3": "Grid code review initiated with WAPP support. Draft expected Q3 2026.",
  "3.1": "EDSA OM&M concession process on track. Transaction advisor appointed.",
  "3.2": "Sector-wide collections account framework agreed with MoF. Implementation Q4 2025.",
  "3.3": "EWRC capacity building supported by ESMAP/World Bank. Training programme active.",
  "3.4": "REA Act drafted. Cabinet review scheduled for Q2 2026.",
  "4.1": "104 mini-grids operational. RBF mechanism being designed with DARES support.",
  "4.2": "PAYG market growing. 85,000 SHS distributed as of June 2026.",
  "4.3": "Net metering regulations under development. EWRC consultation in Q3 2026.",
  "4.4": "Productive use pilot programmes launched in 15 mini-grid sites.",
  "5.1": "LPG strategy endorsed by Cabinet. Distribution infrastructure assessment completed.",
  "5.2": "ICS market assessment completed. Manufacturer engagement underway.",
  "5.3": "E-cooking pilot planned for Freetown grid areas. 500 units for Phase 1.",
};

function StatusBadge({ status }: { status: Status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.not_started;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}

function EditModal({
  item,
  onClose,
}: {
  item: Pillar["action_items"][0];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-cdmu-navy text-sm">Edit Activity: {item.id}</h3>
          <button onClick={onClose} className="text-cdmu-gray-400 hover:text-cdmu-gray-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-cdmu-gray-600 block mb-1">Activity</label>
            <p className="text-sm text-cdmu-gray-800 bg-cdmu-gray-50 rounded-lg p-2">{item.indicator}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-cdmu-gray-600 block mb-1">Status</label>
            <select className="w-full text-sm border border-cdmu-gray-200 rounded-lg px-3 py-2" defaultValue={item.status}>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="delayed">Delayed</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-cdmu-gray-600 block mb-1">Notes</label>
            <textarea
              className="w-full text-sm border border-cdmu-gray-200 rounded-lg px-3 py-2 h-20 resize-none"
              defaultValue={NOTES[item.id] || ""}
              placeholder="Add notes..."
            />
          </div>
          <div>
            <label className="text-xs font-medium text-cdmu-gray-600 block mb-1">CDMU Owner</label>
            <input
              type="text"
              className="w-full text-sm border border-cdmu-gray-200 rounded-lg px-3 py-2"
              defaultValue={CDMU_OWNERS[item.id] || ""}
              placeholder="Assign owner..."
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 bg-cdmu-blue text-white text-sm font-medium py-2 rounded-lg hover:bg-cdmu-blue-dark transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={onClose}
              className="px-4 text-sm text-cdmu-gray-500 hover:text-cdmu-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PillarSection({ pillar }: { pillar: Pillar }) {
  const [editingItem, setEditingItem] = useState<Pillar["action_items"][0] | null>(null);
  const total = pillar.action_items.length;
  const completed = pillar.action_items.filter((a) => a.status === "completed").length;
  const inProgress = pillar.action_items.filter((a) => a.status === "in_progress").length;
  const delayed = pillar.action_items.filter((a) => a.status === "delayed").length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-cdmu-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3 flex items-center justify-between" style={{ borderLeft: `4px solid ${pillar.color}` }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: pillar.color }}
          >
            {pillar.id}
          </div>
          <div>
            <h3 className="font-bold text-cdmu-navy text-sm">{pillar.name}</h3>
            <p className="text-[10px] text-cdmu-gray-500">
              {completed}/{total} completed · {inProgress} in progress · {delayed} delayed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-20 bg-cdmu-gray-100 rounded-full h-2">
            <div className="bg-cdmu-green h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs font-bold text-cdmu-gray-600">{pct}%</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-cdmu-gray-50 border-t border-cdmu-gray-100">
              <th className="text-left px-3 py-2 font-semibold text-cdmu-gray-600 w-8">ID</th>
              <th className="text-left px-3 py-2 font-semibold text-cdmu-gray-600">Activity / Indicator</th>
              <th className="text-left px-3 py-2 font-semibold text-cdmu-gray-600 w-20">Status</th>
              <th className="text-left px-3 py-2 font-semibold text-cdmu-gray-600 w-24">Responsible</th>
              <th className="text-left px-3 py-2 font-semibold text-cdmu-gray-600 w-28">CDMU Owner</th>
              <th className="text-left px-3 py-2 font-semibold text-cdmu-gray-600">Notes</th>
              <th className="text-center px-3 py-2 font-semibold text-cdmu-gray-600 w-10">Edit</th>
            </tr>
          </thead>
          <tbody>
            {pillar.action_items.map((item) => {
              const style = STATUS_STYLES[item.status] || STATUS_STYLES.not_started;
              return (
                <tr
                  key={item.id}
                  className={`border-t border-cdmu-gray-100 ${style.rowBg} hover:bg-cdmu-gray-50/80 transition-colors`}
                >
                  <td className="px-3 py-2.5 font-bold text-cdmu-gray-500">{item.id}</td>
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-cdmu-gray-800">{item.indicator}</p>
                    {item.actions.length > 0 && (
                      <div className="mt-1.5 space-y-1">
                        {item.actions.map((action, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-[10px]">
                            <div
                              className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${
                                action.status === "completed"
                                  ? "bg-cdmu-green"
                                  : action.status === "in_progress"
                                  ? "bg-blue-400"
                                  : action.status === "delayed"
                                  ? "bg-cdmu-red"
                                  : "bg-cdmu-gray-300"
                              }`}
                            />
                            <span className="text-cdmu-gray-600">
                              {action.text}
                              <span className="text-cdmu-gray-400 ml-1">({action.target_date})</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-3 py-2.5 text-cdmu-gray-600">{item.responsible}</td>
                  <td className="px-3 py-2.5">
                    <span className="text-cdmu-blue font-medium">{CDMU_OWNERS[item.id] || "—"}</span>
                  </td>
                  <td className="px-3 py-2.5 text-cdmu-gray-600 max-w-[200px]">
                    <p className="truncate" title={NOTES[item.id] || ""}>
                      {NOTES[item.id] || "—"}
                    </p>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="text-cdmu-gray-400 hover:text-cdmu-blue transition-colors"
                      title="Edit activity"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingItem && (
        <EditModal item={editingItem} onClose={() => setEditingItem(null)} />
      )}
    </div>
  );
}

export default function PillarTracker({ pillars }: { pillars: Pillar[] }) {
  const allItems = pillars.flatMap((p) => p.action_items);
  const totalCompleted = allItems.filter((a) => a.status === "completed").length;
  const totalItems = allItems.length;
  const totalInProgress = allItems.filter((a) => a.status === "in_progress").length;
  const totalDelayed = allItems.filter((a) => a.status === "delayed").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-cdmu-green-dark">
          5-Pillar Progress Tracker
        </h2>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cdmu-green" />
            {totalCompleted} Done
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            {totalInProgress} Active
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cdmu-red" />
            {totalDelayed} Delayed
          </span>
          <span className="text-cdmu-gray-400">
            {totalCompleted}/{totalItems} total
          </span>
        </div>
      </div>
      <div className="space-y-4">
        {pillars.map((pillar) => (
          <PillarSection key={pillar.id} pillar={pillar} />
        ))}
      </div>
    </div>
  );
}
