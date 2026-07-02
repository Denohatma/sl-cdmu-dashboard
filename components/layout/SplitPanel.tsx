"use client";

import { useState } from "react";

export default function SplitPanel({
  left,
  right,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState<"none" | "left" | "right">("none");

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          collapsed === "left"
            ? "w-0"
            : collapsed === "right"
            ? "w-full"
            : "w-1/2"
        }`}
      >
        <div className="h-full overflow-y-auto">{left}</div>
      </div>

      <div className="relative flex-shrink-0 w-1 bg-cdmu-gray-200 hover:bg-cdmu-teal transition-colors group cursor-col-resize">
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-10 flex flex-col gap-0.5">
          <button
            onClick={() =>
              setCollapsed((c) => (c === "left" ? "none" : "left"))
            }
            className="bg-white border border-cdmu-gray-300 rounded-full w-6 h-6 flex items-center justify-center text-cdmu-gray-500 hover:text-cdmu-navy hover:border-cdmu-navy shadow-sm transition-colors"
            title={collapsed === "left" ? "Show Dashboard" : "Hide Dashboard"}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={collapsed === "left" ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
              />
            </svg>
          </button>
          <button
            onClick={() =>
              setCollapsed((c) => (c === "right" ? "none" : "right"))
            }
            className="bg-white border border-cdmu-gray-300 rounded-full w-6 h-6 flex items-center justify-center text-cdmu-gray-500 hover:text-cdmu-navy hover:border-cdmu-navy shadow-sm transition-colors"
            title={collapsed === "right" ? "Show Map" : "Hide Map"}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={collapsed === "right" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
              />
            </svg>
          </button>
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          collapsed === "right"
            ? "w-0"
            : collapsed === "left"
            ? "w-full"
            : "w-1/2"
        }`}
      >
        <div className="h-full">{right}</div>
      </div>
    </div>
  );
}
