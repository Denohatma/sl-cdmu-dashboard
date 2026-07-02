"use client";

import { memo } from "react";

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

export default memo(function InvestmentChart({ data }: { data: InvestmentData }) {
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
    </div>
  );
});
