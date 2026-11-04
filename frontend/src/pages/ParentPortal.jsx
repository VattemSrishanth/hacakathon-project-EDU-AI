import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Clock, 
  Award, 
  BookOpen, 
  TrendingUp, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

export default function ParentPortal() {
  const { auth } = useAuth();
  const [selectedChild, setSelectedChild] = useState('demo-student');

  const subjects = [
    { name: 'Mathematics', score: 88, status: 'On Track', color: 'bg-blue-500' },
    { name: 'Science & Physics', score: 92, status: 'Mastered', color: 'bg-emerald-500' },
    { name: 'Social Studies', score: 76, status: 'Needs Revision', color: 'bg-amber-500' },
    { name: 'English Language', score: 84, status: 'On Track', color: 'bg-indigo-500' }
  ];

  const recentActivities = [
    { id: 1, action: 'Completed Class 10 Quadratic Equations Quiz', time: 'Today, 4:30 PM', score: '9/10' },
    { id: 2, action: 'Practiced ISL Sign Language Module', time: 'Yesterday', score: 'Completed' },
    { id: 3, action: 'Submitted Science Lab Report Assignment', time: '2 days ago', score: 'A Grade' }
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-app-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-app-text-main flex items-center gap-3">
            <User className="w-7 h-7 text-primary" />
            Parent Portal • Child Progress
          </h1>
          <p className="text-sm text-app-text-sub mt-1">
            Real-time academic performance, attendance telemetry, and AI learning guidance.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-app-bg-alt border border-app-border">
          <span className="text-xs text-app-text-sub pl-2">Student:</span>
          <select 
            value={selectedChild} 
            onChange={(e) => setSelectedChild(e.target.value)}
            className="bg-app-card border border-app-border text-app-text-main text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary"
          >
            <option value="demo-student">Demo Student (Class 10-A)</option>
            <option value="child-2">Aarav Student (Class 8-B)</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-app-border">
          <div className="text-xs font-semibold uppercase text-app-text-sub mb-1">Weekly Study Time</div>
          <div className="text-2xl font-extrabold text-app-text-main flex items-baseline gap-1">
            12.5 <span className="text-xs font-medium text-app-text-sub">Hours</span>
          </div>
          <div className="text-xs text-emerald-500 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +2.1 hrs vs last week
          </div>
        </Card>

        <Card className="p-4 border-app-border">
          <div className="text-xs font-semibold uppercase text-app-text-sub mb-1">Average Exam Score</div>
          <div className="text-2xl font-extrabold text-app-text-main flex items-baseline gap-1">
            85.4 <span className="text-xs font-medium text-app-text-sub">%</span>
          </div>
          <div className="text-xs text-primary font-medium mt-1">Top 15% in Class</div>
        </Card>

        <Card className="p-4 border-app-border">
          <div className="text-xs font-semibold uppercase text-app-text-sub mb-1">Assignments Done</div>
          <div className="text-2xl font-extrabold text-app-text-main flex items-baseline gap-1">
            14 / 15
          </div>
          <div className="text-xs text-emerald-500 font-medium mt-1">93% Submission Rate</div>
        </Card>

        <Card className="p-4 border-app-border">
          <div className="text-xs font-semibold uppercase text-app-text-sub mb-1">Active Study Streak</div>
          <div className="text-2xl font-extrabold text-app-text-main flex items-baseline gap-1">
            🔥 5 <span className="text-xs font-medium text-app-text-sub">Days</span>
          </div>
          <div className="text-xs text-amber-500 font-medium mt-1">Consistency Award Eligible</div>
        </Card>
      </div>

      {/* Subject Performance & AI Guidance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Performance Breakdown */}
        <Card className="lg:col-span-2 p-6 border-app-border space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-app-border">
            <h2 className="text-base font-bold text-app-text-main flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Subject Proficiency Breakdown
            </h2>
            <span className="text-xs text-app-text-sub">Term 1 Assessment</span>
          </div>

          <div className="space-y-4">
            {subjects.map((s) => (
              <div key={s.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-app-text-main">{s.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-app-text-sub">{s.status}</span>
                    <strong className="text-app-text-main">{s.score}%</strong>
                  </div>
                </div>
                <div className="w-full bg-app-bg-alt rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`${s.color} h-2.5 rounded-full transition-all duration-500`} 
                    style={{ width: `${s.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* AI Teacher Insight Alert */}
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex gap-3 text-xs leading-relaxed">
            <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <strong className="text-primary font-semibold block mb-0.5">AI Tutor Recommendation for Parent:</strong>
              <p className="text-app-text-sub">
                Demo Student shows strong intuition in Mathematics and Science, but could benefit from 15 minutes of daily Social Studies flashcard revision to solidify historical timelines.
              </p>
            </div>
          </div>
        </Card>

        {/* Recent Activity Log */}
        <Card className="p-6 border-app-border space-y-4">
          <h3 className="text-base font-bold text-app-text-main flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            Recent Milestones
          </h3>

          <div className="space-y-3">
            {recentActivities.map((act) => (
              <div key={act.id} className="p-3 rounded-xl bg-app-bg-alt/50 border border-app-border text-xs space-y-1">
                <div className="font-semibold text-app-text-main">{act.action}</div>
                <div className="flex justify-between text-app-text-sub text-[11px]">
                  <span>{act.time}</span>
                  <span className="text-emerald-500 font-bold">{act.score}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
