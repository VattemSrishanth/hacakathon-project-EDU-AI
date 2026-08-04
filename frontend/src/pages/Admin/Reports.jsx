import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import {
  TrendingUp,
  Award,
  Video,
  Activity,
  Download
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend
} from 'recharts';

const Reports = () => {
  const [data, setData] = useState({
    performance: { totalStudents: 0, totalTeachers: 1, averageAttendance: 95 },
    popularSubjects: [],
    quizScores: [],
    aiUsage: { totalQueries: 0, avgAccuracyRate: 98 }
  });
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getReportsData();
      if (res.success) {
        setData(res.reports);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const downloadReport = () => {
    const rawText = JSON.stringify(data, null, 2);
    const blob = new Blob([rawText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'edu_ai_reports_data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-app-text-main">System Analytics Reports</h1>
          <p className="text-app-text-sub mt-1 text-sm">Review institution-wide student analytics, classroom scores, subject completions, and rating distributions.</p>
        </div>
        <button
          onClick={downloadReport}
          className="flex items-center gap-1.5 px-4 py-2 border border-app-border hover:bg-gray-100 rounded-lg text-sm font-semibold text-app-text-main transition-colors bg-white">
          <Download size={14} /> Download Raw Report JSON
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quiz scores bar chart */}
        <div className="bg-app-bg-alt border border-app-border p-5 rounded-xl shadow-sm">
          <h3 className="text-base font-bold text-app-text-main mb-4 flex items-center gap-2">
            <Award size={16} className="text-primary" />
            Average Quiz Score Metrics
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.quizScores}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="averageScore" fill="#7F1D1D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject popularity charts */}
        <div className="bg-app-bg-alt border border-app-border p-5 rounded-xl shadow-sm">
          <h3 className="text-base font-bold text-app-text-main mb-4 flex items-center gap-2">
            <Video size={16} className="text-secondary" />
            Live Doubts Matches by Subject
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.popularSubjects} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.15} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis dataKey="subject" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Bar dataKey="sessions" fill="#F59E0B" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Numerical aggregate table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-app-bg-alt border border-app-border p-4 rounded-xl shadow-sm">
          <span className="text-xs font-bold text-app-text-muted uppercase tracking-wider block">Average Attendance</span>
          <span className="text-2xl font-bold text-app-text-main mt-2 block">{data.performance.averageAttendance}%</span>
        </div>
        <div className="bg-app-bg-alt border border-app-border p-4 rounded-xl shadow-sm">
          <span className="text-xs font-bold text-app-text-muted uppercase tracking-wider block">Tutor Inquiries</span>
          <span className="text-2xl font-bold text-app-text-main mt-2 block">{data.aiUsage.totalQueries} Queries</span>
        </div>
        <div className="bg-app-bg-alt border border-app-border p-4 rounded-xl shadow-sm">
          <span className="text-xs font-bold text-app-text-muted uppercase tracking-wider block">Student Registrations</span>
          <span className="text-2xl font-bold text-app-text-main mt-2 block">{data.performance.totalStudents} Accounts</span>
        </div>
        <div className="bg-app-bg-alt border border-app-border p-4 rounded-xl shadow-sm">
          <span className="text-xs font-bold text-app-text-muted uppercase tracking-wider block">Verified Teachers</span>
          <span className="text-2xl font-bold text-app-text-main mt-2 block">{data.performance.totalTeachers} Educators</span>
        </div>
      </div>
    </div>
  );
};

export default Reports;
