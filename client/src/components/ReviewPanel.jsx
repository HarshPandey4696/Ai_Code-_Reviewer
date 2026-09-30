import React from 'react';
import ScoreCard from './ScoreCard';
import IssueCard from './IssueCard';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

function ReviewPanel({ review, activeTab, setActiveTab }) {
  const tabs = [
    { id: 'Overview', label: 'Overview', count: null },
    { id: 'Bugs', label: 'Bugs', count: review.bugs?.length || 0 },
    { id: 'Security', label: 'Security', count: review.security?.length || 0 },
    { id: 'Performance', label: 'Performance', count: review.performance?.length || 0 },
    { id: 'Best Practices', label: 'Best Practices', count: review.best_practices?.length || 0 },
    { id: 'Fixed Code', label: 'Fixed Code', count: null }
  ];

  const copyCode = () => {
    navigator.clipboard.writeText(review.improved_code || '');
    alert('Code copied!');
  };

  const copyLink = () => {
    // Requires actual routing for individual links
    alert('Shareable link feature requires routing setup!');
  };

  const downloadPDF = async () => {
    const el = document.getElementById('review-content');
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('AI-Code-Review.pdf');
  };

  return (
    <div className="bg-[#1e293b] rounded-lg border border-[#334155] flex flex-col h-full overflow-hidden">
      <div className="flex border-b border-[#334155] bg-[#0f172a] overflow-x-auto p-1 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-4 py-2 font-medium text-sm rounded ${
              activeTab === tab.id
                ? 'bg-[#1e293b] text-[#6366f1] border-t-2 border-[#6366f1]'
                : 'text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#1e293bd0]'
            }`}
          >
            {tab.label}
            {tab.count !== null && (
              <span className={`ml-2 text-xs rounded-full px-2 py-0.5 ${
                tab.count > 0 ? 'bg-[#334155] text-[#e2e8f0]' : 'bg-[#1e293b] border border-[#334155]'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div id="review-content" className="p-4 flex-1 overflow-y-auto">
        <div className="flex justify-end gap-2 mb-4">
          <button onClick={downloadPDF} className="text-xs bg-[#334155] hover:bg-[#475569] px-3 py-1 rounded text-white">Download PDF</button>
          <button onClick={copyLink} className="text-xs bg-[#334155] hover:bg-[#475569] px-3 py-1 rounded text-white">Share Review</button>
        </div>

        {activeTab === 'Overview' && (
          <div className="flex flex-col items-center py-6">
            <ScoreCard score={review.overall_score} language={review.language} summary={review.summary} />
            {review.positive && review.positive.length > 0 && (
              <div className="w-full mt-6 bg-[#0f172a] rounded p-4">
                <h3 className="text-[#22c55e] font-semibold mb-2">Strengths</h3>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {review.positive.map((val, i) => <li key={i}>{val}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Bugs' && (
          <div className="flex flex-col gap-3">
            {(!review.bugs || review.bugs.length === 0) ? (
              <div className="text-center text-[#22c55e] py-10 font-medium">No bugs found ✓</div>
            ) : (
              review.bugs.map((item, i) => <IssueCard key={i} item={item} type="bug" />)
            )}
          </div>
        )}

        {activeTab === 'Security' && (
          <div className="flex flex-col gap-3">
            {(!review.security || review.security.length === 0) ? (
              <div className="text-center text-[#22c55e] py-10 font-medium">No vulnerabilities found ✓</div>
            ) : (
              review.security.map((item, i) => <IssueCard key={i} item={item} type="security" />)
            )}
          </div>
        )}

        {activeTab === 'Performance' && (
          <div className="flex flex-col gap-3">
            {(!review.performance || review.performance.length === 0) ? (
              <div className="text-center text-[#22c55e] py-10 font-medium">Performance is optimal ✓</div>
            ) : (
              review.performance.map((item, i) => <IssueCard key={i} item={item} type="performance" />)
            )}
          </div>
        )}

        {activeTab === 'Best Practices' && (
          <div className="flex flex-col gap-3">
            {(!review.best_practices || review.best_practices.length === 0) ? (
              <div className="text-center text-[#22c55e] py-10 font-medium">All best practices followed ✓</div>
            ) : (
              review.best_practices.map((item, i) => <IssueCard key={i} item={item} type="practice" />)
            )}
          </div>
        )}

        {activeTab === 'Fixed Code' && (
          <div className="relative group">
             <button
              onClick={copyCode}
              className="absolute top-2 right-2 bg-[#6366f1] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Copy Code
            </button>
            <pre className="bg-[#0f172a] p-4 text-sm rounded shadow-inner overflow-x-auto text-[#e2e8f0] font-mono leading-relaxed whitespace-pre">
              {review.improved_code || 'No improved code provided.'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewPanel;
