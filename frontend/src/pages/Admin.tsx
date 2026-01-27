import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Admin: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const auth = JSON.parse(localStorage.getItem('auth') || '{}');
        const adminId = auth.user?.id;
        
        if (!adminId) {
          setError('Admin ID not found. Please login.');
          setLoading(false);
          return;
        }

        const data = await adminAPI.getStats(adminId);
        if (data.success) {
          setStats(data.stats);
        } else {
          setError(data.error || 'Failed to fetch admin stats');
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'An error occurred fetching stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center text-white">Loading Admin Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <Navbar />
      <main className="grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-indigo-400">Admin Command Center</h1>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 p-4 rounded mb-6">
            {error}
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
              <h3 className="text-slate-400 text-sm font-medium">Total Users</h3>
              <p className="text-4xl font-bold mt-2 text-indigo-400">{stats.total_users}</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
              <h3 className="text-slate-400 text-sm font-medium">Courses</h3>
              <p className="text-4xl font-bold mt-2 text-emerald-400">{stats.total_lessons}</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
              <h3 className="text-slate-400 text-sm font-medium">AI Chats</h3>
              <p className="text-4xl font-bold mt-2 text-amber-400">{stats.total_chats}</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
              <h3 className="text-slate-400 text-sm font-medium">Assignments</h3>
              <p className="text-4xl font-bold mt-2 text-rose-400">{stats.total_assignments}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User List & Progress */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
              <h2 className="text-xl font-semibold">User management & Progress</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="text-left p-4 text-slate-400 text-sm">User</th>
                    <th className="text-left p-4 text-slate-400 text-sm">Role</th>
                    <th className="text-left p-4 text-slate-400 text-sm">Accessibility</th>
                    <th className="text-left p-4 text-slate-400 text-sm">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {stats?.user_list.map((user: any) => {
                    const progress = stats.all_progress.find((p: any) => p.user_id === user.id);
                    return (
                      <tr key={user.id} className="hover:bg-slate-700/30 transition-colors text-sm">
                        <td className="p-4">
                          <div className="font-bold">{user.username}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${user.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">{user.accessibility_mode}</td>
                        <td className="p-4">
                          <div className="w-full bg-slate-900 rounded-full h-1.5 max-w-20">
                            <div 
                              className="bg-primary h-1.5 rounded-full" 
                              style={{ width: `${(progress?.lessons_completed?.length || 0) * 12.5}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            {progress?.lessons_completed?.length || 0}/8 Lessons
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-8">
            {/* Feedback */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                <h2 className="text-xl font-semibold">User Feedback & Issues</h2>
              </div>
              <div className="p-4">
                {stats?.recent_feedback.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No feedback submitted yet.</p>
                ) : (
                  <div className="space-y-4 max-h-100 overflow-y-auto">
                    {stats?.recent_feedback.map((f: any) => (
                      <div key={f.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${f.type === 'issue' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {f.type || 'Feedback'}
                          </span>
                          <span className="text-[10px] text-slate-500">{new Date(f.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-200 text-sm">"{f.comment}"</p>
                        <div className="mt-2 text-xs text-yellow-500 font-bold">Rating: {f.rating}/5</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                <h2 className="text-xl font-semibold">Latest Notifications Sent</h2>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {stats?.all_notifications.length === 0 ? (
                    <p className="text-slate-500 text-center py-4">No recent notifications.</p>
                  ) : (
                    stats.all_notifications.map((n: any) => (
                      <div key={n.id} className="flex gap-3 text-sm">
                        <div className="w-1 h-8 bg-indigo-500 rounded-full shrink-0"></div>
                        <div>
                          <p className="font-bold">{n.title}</p>
                          <p className="text-slate-400 text-xs">{n.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
