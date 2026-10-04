import React from 'react';
import { Award, BookOpen, Clock } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const ProgressReport = ({ reportsData, loading }) => {
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary/20 border-t-primary" />
      </div>
    );
  }

  const data = reportsData || {
    quizScores: [
      { name: "Quiz 1 - Algebra", averageScore: 84 },
      { name: "Quiz 2 - Optics", averageScore: 78 },
      { name: "Quiz 3 - Grammar", averageScore: 92 },
      { name: "Quiz 4 - Python Basics", averageScore: 81 }
    ],
    popularSubjects: [
      { subject: "Mathematics", sessions: 45 },
      { subject: "Science", sessions: 38 },
      { subject: "English", sessions: 29 },
      { subject: "Physics", sessions: 22 }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quiz Scores */}
        <div className="bg-app-bg-alt border border-app-border p-6 rounded-3xl shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-wider text-app-text-main mb-4 flex items-center gap-2">
            <Award size={18} className="text-primary" />
            Average Quiz Score Metrics
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.quizScores}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#0F172A', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="averageScore" fill="var(--color-primary, #7F1D1D)" radius={[6, 6, 0, 0]} name="Avg Score %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Sessions */}
        <div className="bg-app-bg-alt border border-app-border p-6 rounded-3xl shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-wider text-app-text-main mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-secondary" />
            Active Doubt Match Sessions
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.popularSubjects} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.15} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis dataKey="subject" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0F172A', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="sessions" fill="#F59E0B" radius={[0, 6, 6, 0]} name="Sessions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-app-bg-alt border border-app-border p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Award size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-app-text-muted">Target Score Rate</p>
            <h4 className="text-2xl font-black text-app-text-main mt-1">85.3%</h4>
          </div>
        </div>
        <div className="bg-app-bg-alt border border-app-border p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-app-text-muted">Completed Syllabus</p>
            <h4 className="text-2xl font-black text-app-text-main mt-1">68%</h4>
          </div>
        </div>
        <div className="bg-app-bg-alt border border-app-border p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-app-text-muted">Avg Study Speed</p>
            <h4 className="text-2xl font-black text-app-text-main mt-1">4.2 hrs/wk</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressReport;