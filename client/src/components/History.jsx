import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export default function History({ onLoadReview }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/history`, {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setHistory(data);
      } catch (err) {
        setError('Error loading history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const timeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    return Math.floor(seconds) + ' seconds ago';
  };

  return (
    <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-4 flex-1 overflow-hidden flex flex-col max-h-[90vh]">
      <h2 className="text-xl font-bold mb-4 border-b border-[#334155] pb-2 text-[#e2e8f0]">Past Reviews</h2>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {loading ? (
          <div className="text-center text-[#94a3b8] py-8 w-full">Loading...</div>
        ) : error ? (
          <div className="text-[#ef4444] text-center text-sm">{error}</div>
        ) : history.length === 0 ? (
          <div className="text-[#94a3b8] text-center py-4">No past reviews found</div>
        ) : (
          history.map(item => (
            <div
              key={item._id || item.id}
              onClick={() => onLoadReview(item)}
              className="bg-[#0f172a] rounded cursor-pointer hover:bg-[#334155] transition border border-[#334155] p-3 text-sm flex flex-col gap-2"
            >
              <div className="flex justify-between items-center w-full">
                <span className="bg-[#334155] px-2 py-0.5 rounded text-xs text-[#e2e8f0] truncate max-w-[100px]">{item.language}</span>
                <span className={`font-bold ${item.overall_score >= 80 ? 'text-[#22c55e]' : item.overall_score >= 60 ? 'text-[#f59e0b]' : 'text-[#ef4444]'}`}>
                  {item.overall_score}%
                </span>
              </div>
              <div className="text-[#94a3b8] text-xs text-right w-full">
                {timeAgo(item.createdAt)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
