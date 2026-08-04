import React, { useState } from 'react';
import { adminAPI } from '../../services/api';
import {
  Mail,
  Bell,
  Send,
  Users,
  Compass,
  CheckCircle,
  Clock
} from 'lucide-react';

const NotificationManager = () => {
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'in_app', // push, email, in_app
    audience: {
      role: 'all', // all, student, teacher, admin
      colleges: '',
      branches: '',
      semesters: ''
    },
    scheduleType: 'immediate', // immediate, future, recurring
    scheduledTime: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        title: form.title,
        message: form.message,
        type: form.type,
        audience: {
          role: form.audience.role,
          colleges: form.audience.colleges ? form.audience.colleges.split(',').map((c) => c.trim()) : [],
          branches: form.audience.branches ? form.audience.branches.split(',').map((b) => b.trim()) : [],
          semesters: form.audience.semesters ? form.audience.semesters.split(',').map((s) => s.trim()) : []
        },
        scheduleType: form.scheduleType,
        scheduledTime: form.scheduledTime || undefined
      };

      const res = await adminAPI.scheduleNotification(payload);
      if (res.success) {
        setSuccess('Notification successfully queued and sent.');
        setForm({
          title: '',
          message: '',
          type: 'in_app',
          audience: { role: 'all', colleges: '', branches: '', semesters: '' },
          scheduleType: 'immediate',
          scheduledTime: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to trigger notification scheduler.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-app-text-main">System Notifications</h1>
        <p className="text-app-text-sub mt-1 text-sm">Send and schedule announcements, emails, or push notifications to selected students, teachers, or semesters.</p>
      </div>

      {error && <div className="bg-error/10 border border-error text-error p-3.5 rounded-lg text-sm font-semibold">{error}</div>}
      {success && <div className="bg-emerald-50 border border-emerald-500 text-emerald-700 p-3.5 rounded-lg text-sm font-semibold">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form panel */}
        <div className="bg-app-bg-alt border border-app-border rounded-xl p-5 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-primary flex items-center gap-1.5">
            <Bell size={18} /> Compose Announcement
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Notification Medium</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary">
                  <option value="in_app">In App Notification Banner</option>
                  <option value="email">Direct Email broadcast</option>
                  <option value="push">Mobile Push Alert notification</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Audience Role</label>
                <select
                  value={form.audience.role}
                  onChange={(e) => setForm({ ...form, audience: { ...form.audience, role: e.target.value } })}
                  className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary">
                  <option value="all">All registered accounts</option>
                  <option value="student">Student group only</option>
                  <option value="teacher">Teacher group only</option>
                  <option value="admin">Administrator only</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Alert Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
                placeholder="Important: Semester Exam Schedules published"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Alert Message</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary min-h-[100px]"
                placeholder="The detailed timetable for terminal assessments has been uploaded. Check the smart timetable module."
                required
              />
            </div>

            <hr className="border-app-border" />

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-app-text-sub uppercase tracking-wider flex items-center gap-1">
                <Compass size={14} /> Demographics Filtering (Optional)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-app-text-sub mb-0.5">Colleges (Comma separated)</label>
                  <input
                    type="text"
                    value={form.audience.colleges}
                    onChange={(e) => setForm({ ...form, audience: { ...form.audience, colleges: e.target.value } })}
                    className="w-full px-2.5 py-1.5 border border-app-border rounded text-xs bg-white focus:outline-none focus:border-primary"
                    placeholder="Engineering, Arts"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-app-text-sub mb-0.5">Branches (Comma separated)</label>
                  <input
                    type="text"
                    value={form.audience.branches}
                    onChange={(e) => setForm({ ...form, audience: { ...form.audience, branches: e.target.value } })}
                    className="w-full px-2.5 py-1.5 border border-app-border rounded text-xs bg-white focus:outline-none focus:border-primary"
                    placeholder="CSE, ECE"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-app-text-sub mb-0.5">Semester (Comma separated)</label>
                  <input
                    type="text"
                    value={form.audience.semesters}
                    onChange={(e) => setForm({ ...form, audience: { ...form.audience, semesters: e.target.value } })}
                    className="w-full px-2.5 py-1.5 border border-app-border rounded text-xs bg-white focus:outline-none focus:border-primary"
                    placeholder="Semester 3"
                  />
                </div>
              </div>
            </div>

            <hr className="border-app-border" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Dispatch Schedule</label>
                <select
                  value={form.scheduleType}
                  onChange={(e) => setForm({ ...form, scheduleType: e.target.value })}
                  className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary">
                  <option value="immediate">Immediate Dispatch</option>
                  <option value="future">Delayed / Future Schedule</option>
                  <option value="recurring">Recurring Cron Job</option>
                </select>
              </div>

              {form.scheduleType !== 'immediate' && (
                <div>
                  <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Scheduled Time / Cron Expression</label>
                  <input
                    type="text"
                    value={form.scheduledTime}
                    onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
                    className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
                    placeholder={form.scheduleType === 'recurring' ? '0 9 * * 1 (Every Mon 9am)' : '2026-12-25T09:00:00'}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-extrabold py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50">
              <Send size={16} /> {loading ? 'Dispatching...' : 'Dispatch Notification'}
            </button>
          </form>
        </div>

        {/* Right Help / Status Panel */}
        <div className="bg-app-bg-alt border border-app-border rounded-xl p-5 shadow-sm space-y-4 h-fit">
          <h4 className="text-xs font-bold text-app-text-sub uppercase tracking-wider flex items-center gap-1">
            <Users size={14} /> Audience Stats
          </h4>
          <div className="divide-y divide-app-border text-xs font-semibold text-app-text-sub">
            <div className="py-2 flex justify-between">
              <span>Audience Reach</span>
              <span className="text-app-text-main">100% Target Active</span>
            </div>
            <div className="py-2 flex justify-between">
              <span>Email Delivery Rate</span>
              <span className="text-emerald-700">99.8% Verified</span>
            </div>
            <div className="py-2 flex justify-between">
              <span>Scheduled jobs</span>
              <span className="text-amber-700">0 Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationManager;
