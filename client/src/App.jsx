import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import Editor from './components/Editor';
import ReviewPanel from './components/ReviewPanel';
import History from './components/History';
import AuthModal from './components/AuthModal';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [code, setCode] = useState('');
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [historyKey, setHistoryKey] = useState(0);

  // Auth state
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  // Restore user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setHistoryKey(prev => prev + 1);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setHistoryKey(prev => prev + 1);
  };

  const handleReviewCode = async () => {
    if (!code || code.trim() === '') {
      toast.error('Please enter some code');
      setError('Please enter some code');
      return;
    }

    setLoading(true);
    setError(null);
    setReview(null);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Review failed. Please try again.');
      }

      setReview(data.review);
      setHistoryKey(prev => prev + 1);
      setActiveTab('Overview');
      toast.success('Code reviewed successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Review failed. Please try again.', {
        duration: 5000,
      });
      setError(err.message || 'Review failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleReviewCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code]);

  const loadPastReview = async (pastReview) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/review/${pastReview._id}`);
      const data = await res.json();
      if (data.review) {
        setReview(data.review);
        setActiveTab('Overview');
      }
    } catch (err) {
      setError('Failed to load past review');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-[#0f172a] text-[#e2e8f0] min-h-screen font-sans flex items-center justify-center">
        <Toaster position="top-right" />
        <div className="relative w-full max-w-md mx-auto">
          {/* Header/Title outside the modal */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                AI Code Reviewer
              </span>
            </h1>
            <p className="text-[#94a3b8]">Sign in to analyze your code and track history.</p>
          </div>
          {/* Using AuthModal's logic without it being a modal */}
          <AuthModal 
            onClose={() => {}} 
            onAuthSuccess={handleAuthSuccess} 
            isPage={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a] text-[#e2e8f0] min-h-screen font-sans flex flex-col">
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#1e293b',
          color: '#e2e8f0',
          border: '1px solid #334155',
        },
      }} />
      {/* Top Header Bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-[#334155] bg-[#0f172a] shadow-md flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔍</span>
          <span className="font-bold text-lg tracking-tight">AI Code Reviewer</span>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-[#94a3b8]">
                Hi,{' '}
                <span className="font-semibold text-[#e2e8f0]">{user.name}</span>
              </span>
              <button
                onClick={logout}
                className="text-sm px-4 py-1.5 rounded-lg border border-[#334155] text-[#94a3b8] hover:border-[#6366f1] hover:text-white transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="text-sm px-4 py-1.5 rounded-lg font-semibold text-white transition-all"
              style={{
                background: 'linear-gradient(90deg, #6366f1, #a855f7)',
              }}
            >
              Login
            </button>
          )}
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row p-4 gap-4 flex-1 overflow-hidden">
        {/* Left side: Editor & Actions */}
        <div className="flex-[1.2] flex flex-col gap-4">
          <div className="flex-1 bg-[#1e293b] rounded-lg border border-[#334155] overflow-hidden flex flex-col min-h-[500px]">
            <div className="px-4 py-3 border-b border-[#334155] font-semibold text-lg flex justify-between items-center bg-[#0f172a]">
              <h1 className="text-base font-semibold">Code Editor</h1>
              {review?.language && (
                <span className="bg-[#334155] px-2 py-1 text-sm rounded border border-[#475569]">
                  Detected: {review.language}
                </span>
              )}
            </div>
            <Editor code={code} setCode={setCode} />
          </div>

          <button
            onClick={handleReviewCode}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 font-bold text-white p-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex justify-center items-center gap-3 relative overflow-hidden group"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing your code...
              </>
            ) : (
              'Analyze Code (Ctrl + Enter)'
            )}
          </button>
        </div>

        {/* Right side: Results */}
        <div className="flex-[1.5] flex flex-col gap-4 overflow-hidden h-[calc(100vh-8rem)]">
          {review ? (
            <ReviewPanel review={review} activeTab={activeTab} setActiveTab={setActiveTab} />
          ) : (
            <div className="h-full bg-[#1e293b] border border-[#334155] rounded-lg flex flex-col items-center justify-center p-8 text-center text-[#94a3b8] shadow-inner">
              <div className="text-6xl mb-6 opacity-80">🔍</div>
              <h2 className="text-2xl font-bold text-[#e2e8f0] mb-3">Awaiting Code</h2>
              <p className="max-w-md">
                Paste your code on the left and click{' '}
                <span className="text-[#6366f1] font-semibold">Analyze Code</span> to get a
                comprehensive review covering bugs, security, performance, and best practices.
              </p>
            </div>
          )}
        </div>

        {/* History Sidebar */}
        <div className="w-full md:w-64 flex flex-col gap-4 flex-shrink-0 lg:w-72">
          <History key={historyKey} onLoadReview={loadPastReview} />
        </div>
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}

export default App;
