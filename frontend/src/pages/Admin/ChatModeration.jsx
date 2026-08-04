import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import {
  ShieldAlert,
  ThumbsUp,
  Ban,
  AlertTriangle,
  RotateCw,
  Search
} from 'lucide-react';

const ChatModeration = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getModerationLogs();
      if (res.success) {
        setLogs(res.logs);
      }
    } catch (err) {
      setError('Failed to fetch moderation logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleAppealAction = async (logId, action) => {
    if (!window.confirm(`Are you sure you want to resolve this appeal with action: ${action}?`)) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await adminAPI.respondToAppeal(logId, action);
      if (res.success) {
        setSuccess('Appeal resolved successfully');
        await fetchLogs();
      }
    } catch (err) {
      setError('Failed to process appeal action');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const term = search.toLowerCase();
    return (
      (log.userId?.name || '').toLowerCase().includes(term) ||
      (log.userId?.email || '').toLowerCase().includes(term) ||
      (log.messageContent || '').toLowerCase().includes(term) ||
      (log.infractionType || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-app-text-main">AI Chat Moderation</h1>
        <p className="text-app-text-sub mt-1 text-sm">Review community violations flagged by real-time NLP or AI filters, block spammers, and lift user suspensions.</p>
      </div>

      {error && <div className="bg-error/10 border border-error text-error p-3.5 rounded-lg text-sm font-semibold">{error}</div>}
      {success && <div className="bg-emerald-50 border border-emerald-500 text-emerald-700 p-3.5 rounded-lg text-sm font-semibold">{success}</div>}

      {/* Toolbar */}
      <div className="bg-app-bg-alt border border-app-border rounded-xl p-4 flex flex-wrap gap-3 items-center justify-between shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 text-app-text-muted" size={16} />
          <input
            type="text"
            placeholder="Search moderation logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-app-border rounded-lg bg-white text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-1 bg-white border border-app-border hover:bg-gray-100 text-app-text-main font-bold py-2 px-4 rounded-lg text-sm transition-colors">
          <RotateCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Logs
        </button>
      </div>

      {/* Violations grid log */}
      <div className="bg-app-bg-alt border border-app-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-app-border bg-gray-50 text-app-text-main font-bold text-sm">
          Flagged Message Infractions
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-app-border text-xs uppercase font-bold text-app-text-sub">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Flagged Message Content</th>
                <th className="p-4">Violation Type</th>
                <th className="p-4">Action Taken</th>
                <th className="p-4 text-right">Appeals / Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border text-sm">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-app-text-muted">Loading moderation logs...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-app-text-muted">No content violations matching search terms.</td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-app-text-main">{log.userId?.name || 'Applicant'}</div>
                      <div className="text-xs text-app-text-muted font-medium">{log.userId?.email || 'N/A'}</div>
                    </td>
                    <td className="p-4 max-w-xs font-semibold text-rose-900 italic">
                      "{log.messageContent}"
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 uppercase tracking-wider">
                        {log.infractionType}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-semibold text-app-text-sub capitalize">
                      {log.actionTaken.replace(/_/g, ' ')}
                    </td>
                    <td className="p-4 text-right">
                      {log.actionTaken !== 'warning' ? (
                        <div className="flex justify-end gap-2 text-xs">
                          <button
                            onClick={() => handleAppealAction(log._id, 'dismiss')}
                            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-2.5 rounded transition-colors text-[10px] uppercase">
                            <ThumbsUp size={10} /> Dismiss Ban
                          </button>
                          <button
                            onClick={() => handleAppealAction(log._id, 'ban')}
                            className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-1 px-2.5 rounded transition-colors text-[10px] uppercase">
                            <Ban size={10} /> Reject Appeal
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-app-text-muted italic">Warning Only</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ChatModeration;
