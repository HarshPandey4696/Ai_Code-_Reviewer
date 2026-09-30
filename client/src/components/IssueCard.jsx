import React, { useState } from 'react';

export default function IssueCard({ item, type }) {
  const [expanded, setExpanded] = useState(false);

  const getSeverityBadge = () => {
    switch (item.severity?.toLowerCase()) {
      case 'critical': return 'bg-[#ef4444] text-white';
      case 'high': return 'bg-[#f59e0b] text-white';
      case 'medium': return 'bg-[#eab308] text-white';
      case 'low': return 'bg-[#3b82f6] text-white';
      default: return 'bg-[#6366f1] text-white';
    }
  };

  return (
    <div className="bg-[#0f172a] rounded-lg border border-[#334155] p-4 text-sm hover:border-[#475569] transition-colors cursor-pointer group" onClick={() => setExpanded(!expanded)}>
      <div className="flex justify-between items-start mb-2 gap-4">
        <div className="flex-1 font-medium text-[#e2e8f0] flex gap-2 items-center">
          <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded ${getSeverityBadge()}`}>
            {item.severity || type}
          </span>
          {item.line && <span className="text-[#94a3b8]">Line {item.line}:</span>}
          <span>{item.issue}</span>
        </div>
        <span className="text-[#6366f1] text-lg font-bold group-hover:scale-110 transition-transform">
          {expanded ? '-' : '+'}
        </span>
      </div>

      {expanded && (
        <div className="mt-3 p-3 bg-[#1e293b] rounded border-l-2 border-[#6366f1] text-[#94a3b8]">
          <strong className="text-[#e2e8f0]">Recommendation: </strong>
          {item.fix}
        </div>
      )}
    </div>
  );
}