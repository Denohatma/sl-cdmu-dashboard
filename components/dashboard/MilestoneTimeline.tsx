"use client";

interface Milestone {
  date: string;
  title: string;
  status: "completed" | "in_progress" | "upcoming";
  description?: string;
}

const MILESTONES: Milestone[] = [
  {
    date: "Q1 2025",
    title: "National Energy Compact Signed",
    status: "completed",
    description: "Sierra Leone signs Mission 300 National Energy Compact",
  },
  {
    date: "Q2 2025",
    title: "CDMU Established",
    status: "completed",
    description: "Compact Delivery and Monitoring Unit operationalized",
  },
  {
    date: "Q3 2025",
    title: "MCC Compact Approved",
    status: "in_progress",
    description: "$494M MCC Compact for transmission and generation",
  },
  {
    date: "Q4 2025",
    title: "Bumbuna II Upgrade Start",
    status: "upcoming",
    description: "$65M upgrade from 50MW to 88MW",
  },
  {
    date: "2026",
    title: "Northern Corridor Transmission",
    status: "upcoming",
    description: "$100M transmission backbone construction begins",
  },
  {
    date: "2027",
    title: "200+ Mini-Grid Program",
    status: "upcoming",
    description: "Decentralized electrification rollout across rural areas",
  },
  {
    date: "2028",
    title: "Southern Corridor Transmission",
    status: "upcoming",
    description: "$250M CLSG interconnection to regional grid",
  },
  {
    date: "2030",
    title: "78% Access Target",
    status: "upcoming",
    description: "Mission 300 electricity access target achieved",
  },
];

export default function MilestoneTimeline() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-cdmu-navy">Key Milestones</h2>

      <div className="glass-card rounded-2xl p-5">
        <div className="relative">
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-cdmu-gray-200" />

          <div className="space-y-6">
            {MILESTONES.map((milestone, i) => (
              <div key={i} className="relative pl-10">
                <div
                  className={`absolute left-1 top-1 w-5 h-5 rounded-full border-2 ${
                    milestone.status === "completed"
                      ? "bg-cdmu-green border-cdmu-green"
                      : milestone.status === "in_progress"
                      ? "bg-white border-blue-500"
                      : "bg-white border-cdmu-gray-300"
                  }`}
                >
                  {milestone.status === "completed" && (
                    <svg className="w-3 h-3 text-white m-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {milestone.status === "in_progress" && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full m-0.5 animate-pulse" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-cdmu-gold">{milestone.date}</span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        milestone.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : milestone.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-cdmu-gray-100 text-cdmu-gray-600"
                      }`}
                    >
                      {milestone.status === "completed"
                        ? "Done"
                        : milestone.status === "in_progress"
                        ? "Active"
                        : "Upcoming"}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-cdmu-gray-900 mt-0.5">{milestone.title}</p>
                  {milestone.description && (
                    <p className="text-xs text-cdmu-gray-500 mt-0.5">{milestone.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
