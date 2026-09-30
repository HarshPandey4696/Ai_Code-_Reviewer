import React, { useEffect, useState } from 'react';

export default function ScoreCard({ score, language, summary }) {
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = score / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setCurrentScore(score);
        clearInterval(timer);
      } else {
        setCurrentScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [score]);

  const getColor = (s) => {
    if (s >= 80) return 'text-[#22c55e] border-[#22c55e]';
    if (s >= 60) return 'text-[#f59e0b] border-[#f59e0b]';
    return 'text-[#ef4444] border-[#ef4444]';
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#0f172a] rounded-lg border border-[#334155] w-full mt-4">
      <div className={`w-32 h-32 rounded-full border-8 flex items-center justify-center text-4xl p-2 font-bold mb-4 ${getColor(score)}`}>
        {currentScore}%
      </div>
      <h2 className="text-xl font-bold mb-1">Language: {language}</h2>
      <p className="text-center text-[#94a3b8] max-w-md">{summary}</p>
    </div>
  );
}
