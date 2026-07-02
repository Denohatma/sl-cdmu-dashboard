"use client";

import { memo, useState } from "react";

interface SectorData {
  sector: string;
  public: number;
  private: number;
  total: number;
}

interface PartnerData {
  name: string;
  short: string;
  committed: number;
  disbursed: number;
}

function formatUSD(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  return `$${value.toLocaleString()}`;
}

function SectorBar({ sector, maxTotal }: { sector: SectorData; maxTotal: number }) {
  const publicWidth = (sector.public / maxTotal) * 100;
  const privateWidth = (sector.private / maxTotal) * 100;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-cdmu-gray-700 font-medium">{sector.sector}</span>
        <span className="text-cdmu-gray-500">{formatUSD(sector.total)}</span>
      </div>
      <div className="flex h-5 rounded-full overflow-hidden bg-cdmu-gray-100">
        {sector.public > 0 && (
          <div
            className="bg-cdmu-navy h-full transition-all duration-500"
            style={{ width: `${publicWidth}%` }}
            title={`Public: ${formatUSD(sector.public)}`}
          />
        )}
        {sector.private > 0 && (
          <div
            className="bg-cdmu-gold h-full transition-all duration-500"
            style={{ width: `${privateWidth}%` }}
            title={`Private: ${formatUSD(sector.private)}`}
          />
        )}
      </div>
    </div>
  );
}

function PartnerBar({ partner, maxCommitted }: { partner: PartnerData; maxCommitted: number }) {
  const committedWidth = (partner.committed / maxCommitted) * 100;
  const disbursedWidth = partner.committed > 0 ? (partner.disbursed / partner.committed) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-cdmu-gray-700 font-medium">{partner.short}</span>
        <span className="text-cdmu-gray-500">{formatUSD(partner.committed)}</span>
      </div>
      <div className="relative h-5 rounded-full overflow-hidden bg-cdmu-gray-100">
        <div
          className="bg-cdmu-teal/30 h-full absolute left-0 top-0 transition-all duration-500"
          style={{ width: `${committedWidth}%` }}
        />
        {partner.disbursed > 0 && (
          <div
            className="bg-cdmu-teal h-full absolute left-0 top-0 transition-all duration-500"
            style={{ width: `${(partner.disbursed / maxCommitted) * 100}%` }}
          />
        )}
      </div>
      {partner.disbursed > 0 && (
        <p className="text-xs text-cdmu-gray-500">
          Disbursed: {formatUSD(partner.disbursed)} ({disbursedWidth.toFixed(0)}%)
        </p>
      )}
    </div>
  );
}

interface InvestmentData {
  total_required: number;
  public_total: number;
  private_total: number;
  by_sector: SectorData[];
  by_partner: PartnerData[];
}

type PipelinePartnerType = "Active" | "Pipeline" | "Prospect";
type PipelineStatus = "In Discussion" | "MOU Signed" | "Due Diligence" | "Term Sheet" | "Identified" | "Initial Contact";

interface PipelinePartner {
  id: string;
  name: string;
  type: PipelinePartnerType;
  focusArea: string;
  estValue: string;
  status: PipelineStatus;
  notes: string;
}

const INITIAL_PIPELINE_PARTNERS: PipelinePartner[] = [
  { id: "ifc", name: "IFC", type: "Active", focusArea: "Private sector mobilization", estValue: "$50M", status: "MOU Signed", notes: "" },
  { id: "kfw", name: "KfW", type: "Active", focusArea: "Renewable energy", estValue: "$30M", status: "Due Diligence", notes: "" },
  { id: "eu-eib", name: "EU/EIB", type: "Active", focusArea: "Grid modernization", estValue: "$50M", status: "MOU Signed", notes: "" },
  { id: "jica", name: "JICA", type: "Active", focusArea: "Technical assistance", estValue: "$15M", status: "In Discussion", notes: "" },
  { id: "isdb", name: "IsDB", type: "Active", focusArea: "Infrastructure", estValue: "$40M", status: "Term Sheet", notes: "" },
  { id: "afc", name: "AFC", type: "Pipeline", focusArea: "Project finance", estValue: "$80M", status: "In Discussion", notes: "" },
  { id: "pidg", name: "PIDG/InfraCo", type: "Pipeline", focusArea: "Project development", estValue: "$25M", status: "Due Diligence", notes: "" },
  { id: "afreximbank", name: "Afreximbank", type: "Pipeline", focusArea: "Trade finance", estValue: "$60M", status: "In Discussion", notes: "" },
  { id: "badea", name: "BADEA", type: "Pipeline", focusArea: "Agriculture-energy nexus", estValue: "$35M", status: "Initial Contact", notes: "" },
  { id: "gcf", name: "GCF", type: "Prospect", focusArea: "Climate finance", estValue: "$100M", status: "Identified", notes: "" },
  { id: "usaid", name: "USAID Power Africa", type: "Prospect", focusArea: "Power sector support", estValue: "$20M", status: "Initial Contact", notes: "" },
  { id: "sida", name: "SIDA", type: "Prospect", focusArea: "Swedish cooperation", estValue: "$15M", status: "Identified", notes: "" },
  { id: "china-exim", name: "China Exim Bank", type: "Prospect", focusArea: "Infrastructure", estValue: "$200M", status: "Identified", notes: "" },
];

const TYPE_BADGE_CLASSES: Record<PipelinePartnerType, string> = {
  Active: "bg-green-100 text-green-800",
  Pipeline: "bg-blue-100 text-blue-800",
  Prospect: "bg-amber-100 text-amber-800",
};

function PartnerEditModal({
  partner,
  onSave,
  onClose,
}: {
  partner: PipelinePartner;
  onSave: (id: string, notes: string) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(partner.notes);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4">
        <h4 className="text-sm font-semibold text-cdmu-navy">
          Edit Notes &mdash; {partner.name}
        </h4>
        <div className="text-xs text-cdmu-gray-500 space-y-1">
          <p><span className="font-medium text-cdmu-gray-700">Type:</span> {partner.type}</p>
          <p><span className="font-medium text-cdmu-gray-700">Focus:</span> {partner.focusArea}</p>
          <p><span className="font-medium text-cdmu-gray-700">Est. Value:</span> {partner.estValue}</p>
          <p><span className="font-medium text-cdmu-gray-700">Status:</span> {partner.status}</p>
        </div>
        <textarea
          className="w-full border border-cdmu-gray-200 rounded-lg p-3 text-sm text-cdmu-gray-700 focus:outline-none focus:ring-2 focus:ring-cdmu-teal/40 resize-y min-h-[80px]"
          rows={4}
          placeholder="Add notes about this partner..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-cdmu-gray-600 bg-cdmu-gray-100 rounded-lg hover:bg-cdmu-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(partner.id, draft);
              onClose();
            }}
            className="px-4 py-2 text-xs font-medium text-white bg-cdmu-navy rounded-lg hover:bg-cdmu-navy/90 transition-colors"
          >
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(function InvestmentChart({ data }: { data: InvestmentData }) {
  const [pipelinePartners, setPipelinePartners] = useState<PipelinePartner[]>(INITIAL_PIPELINE_PARTNERS);
  const [editingPartner, setEditingPartner] = useState<PipelinePartner | null>(null);

  const handleSaveNotes = (id: string, notes: string) => {
    setPipelinePartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, notes } : p))
    );
  };

  const maxSectorTotal = Math.max(...data.by_sector.map((s) => s.total));
  const maxPartnerCommitted = Math.max(...data.by_partner.map((p) => p.committed));
  const totalDisbursed = data.by_partner.reduce((sum, p) => sum + p.disbursed, 0);
  const totalCommitted = data.by_partner.reduce((sum, p) => sum + p.committed, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-cdmu-navy">
        Investment Tracker
      </h2>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-cdmu-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-cdmu-navy">{formatUSD(data.total_required)}</p>
          <p className="text-xs text-cdmu-gray-500 mt-1">Total Required</p>
        </div>
        <div className="bg-white rounded-xl border border-cdmu-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-cdmu-navy">{formatUSD(data.public_total)}</p>
          <p className="text-xs text-cdmu-gray-500 mt-1">Public</p>
        </div>
        <div className="bg-white rounded-xl border border-cdmu-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-cdmu-gold">{formatUSD(data.private_total)}</p>
          <p className="text-xs text-cdmu-gray-500 mt-1">Private</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-cdmu-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-cdmu-gray-700">By Sector</h3>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-cdmu-navy" /> Public
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-cdmu-gold" /> Private
            </span>
          </div>
        </div>
        <div className="space-y-3">
          {data.by_sector.map((sector) => (
            <SectorBar key={sector.sector} sector={sector} maxTotal={maxSectorTotal} />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-cdmu-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-cdmu-gray-700">By Development Partner</h3>
          <p className="text-xs text-cdmu-gray-500">
            {formatUSD(totalCommitted)} committed · {formatUSD(totalDisbursed)} disbursed
          </p>
        </div>
        <div className="space-y-3">
          {[...data.by_partner]
            .sort((a, b) => b.committed - a.committed)
            .map((partner) => (
              <PartnerBar
                key={partner.short}
                partner={partner}
                maxCommitted={maxPartnerCommitted}
              />
            ))}
        </div>
      </div>

      {/* Partner Pipeline & Prospects */}
      <div className="bg-white rounded-xl border border-cdmu-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-cdmu-gray-700">
            Partner Pipeline &amp; Prospects
          </h3>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-green-500" /> Active
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-blue-500" /> Pipeline
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-amber-500" /> Prospect
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-cdmu-gray-200 text-left text-cdmu-gray-500">
                <th className="pb-2 pr-3 font-medium">Partner Name</th>
                <th className="pb-2 pr-3 font-medium">Type</th>
                <th className="pb-2 pr-3 font-medium">Focus Area</th>
                <th className="pb-2 pr-3 font-medium">Est. Value</th>
                <th className="pb-2 pr-3 font-medium">Status</th>
                <th className="pb-2 pr-3 font-medium">Notes</th>
                <th className="pb-2 font-medium text-right">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cdmu-gray-100">
              {pipelinePartners.map((pp) => (
                <tr key={pp.id} className="hover:bg-cdmu-gray-50 transition-colors">
                  <td className="py-2.5 pr-3 font-medium text-cdmu-gray-700 whitespace-nowrap">
                    {pp.name}
                  </td>
                  <td className="py-2.5 pr-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${TYPE_BADGE_CLASSES[pp.type]}`}
                    >
                      {pp.type}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-cdmu-gray-600">{pp.focusArea}</td>
                  <td className="py-2.5 pr-3 text-cdmu-gray-700 font-medium whitespace-nowrap">
                    {pp.estValue}
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-cdmu-gray-100 text-cdmu-gray-700 text-[10px] font-medium">
                      {pp.status}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-cdmu-gray-500 max-w-[160px] truncate">
                    {pp.notes || <span className="italic text-cdmu-gray-400">--</span>}
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => setEditingPartner(pp)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-cdmu-teal border border-cdmu-teal/30 rounded-lg hover:bg-cdmu-teal/10 transition-colors"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingPartner && (
        <PartnerEditModal
          partner={editingPartner}
          onSave={handleSaveNotes}
          onClose={() => setEditingPartner(null)}
        />
      )}
    </div>
  );
});
