import React from 'react';
import { Calendar, Clock, UserCheck } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const AttendanceReport = ({ reportsData, loading }) => {
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary/20 border-t-primary" />
      </div>
    );
  }

  const attendanceHistory = [
    { date: 'Mon', attendance: 92 },
    { date: 'Tue', attendance: 95 },
    { date: 'Wed', attendance: 94 },
    { date: 'Thu', attendance: 96 },
    { date: 'Fri', attendance: 95 }
  ];

  const recentSessions = [
    { id: 1, studentName: 'Rohan Sharma', status: 'Present', duration: '50m', time: '10:15 AM' },
    { id: 2, studentName: 'Aditya Reddy', status: 'Present', duration: '45m', time: '11:00 AM' },
    { id: 3, studentName: 'Nisha G.', status: 'Absent', duration: '0m', time: '--' },
    { id: 4, studentName: 'Sanjay Kumar', status: 'Present', duration: '55m', time: '02:30 PM' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Stats */}
        <div className="lg:col-span-2 bg-app-bg-alt border border-app-border p-6 rounded-3xl shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-wider text-app-text-main mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-primary" />
            Weekly Attendance Statistics (%)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[80, 100]} />
                <Tooltip contentStyle={{ background: '#0F172A', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Line type="monotone" dataKey="attendance" stroke="var(--color-primary, #7F1D1D)" strokeWidth={3} activeDot={{ r: 8 }} name="Attendance %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Aggregate Summary */}
        <div className="bg-app-bg-alt border border-app-border p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-app-text-main mb-4 flex items-center gap-2">
              <UserCheck size={18} className="text-secondary" />
              Summary Card
            </h3>
            <div className="space-y-4 mt-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-app-text-muted">Average Rate</p>
                <h4 className="text-3xl font-black text-secondary mt-1">94.8%</h4>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-app-text-muted">Total Classes</p>
                <h4 className="text-3xl font-black text-app-text-main mt-1">24 Session(s)</h4>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-app-border flex items-center gap-2 text-xs font-bold text-app-text-muted uppercase">
            <Clock size={14} className="text-primary" />
            Updated 10m ago
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-app-bg-alt border border-app-border rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-app-border">
          <h3 className="text-sm font-black uppercase tracking-wider text-app-text-main">Today's Attendance Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-app-bg text-[10px] font-black uppercase tracking-widest text-app-text-muted border-b border-app-border">
                <th className="p-4 pl-6">Student Name</th>
                <th className="p-4">Time Checked In</th>
                <th className="p-4">Duration</th>
                <th className="p-4 pr-6">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.map((session) => (
                <tr key={session.id} className="border-b border-app-border/40 last:border-0 text-xs font-bold text-app-text-sub">
                  <td className="p-4 pl-6 text-app-text-main">{session.studentName}</td>
                  <td className="p-4">{session.time}</td>
                  <td className="p-4">{session.duration}</td>
                  <td className="p-4 pr-6">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                      session.status === 'Present' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                    }`}>
                      {session.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceReport;