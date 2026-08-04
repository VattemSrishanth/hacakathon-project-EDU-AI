import React, { useState } from 'react';
import {
  Cpu,
  HelpCircle,
  Clock,
  Sparkles,
  TrendingUp,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';

const AIModule = ({ stats }) => {
  const logs = stats?.real_ai_logs || [
    { id: 1, user: 'Demo Student', tool: 'AI Tutor', prompt: 'Explain quantum entanglement simply', tokens: 420, date: '10 mins ago' },
    { id: 2, user: 'Demo Student', tool: 'Quiz Gen', prompt: 'Create 10 questions on basic geometry', tokens: 850, date: '30 mins ago' },
    { id: 3, user: 'Demo Teacher', tool: 'Notes Gen', prompt: 'Summarize standard photosynthesis process', tokens: 1200, date: '1 hour ago' },
    { id: 4, user: 'Demo Student', tool: 'Flashcards', prompt: 'Create cards for vocabulary unit 4', tokens: 350, date: '2 hours ago' }
  ];

  const tokenUsage = stats?.token_usage || [
    { name: '10:00', tokens: 4500 },
    { name: '11:00', tokens: 7800 },
    { name: '12:00', tokens: 12000 },
    { name: '13:00', tokens: 9500 },
    { name: '14:00', tokens: 15600 },
    { name: '15:00', tokens: 18400 }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-app-text-main">AI Engine Monitor</h1>
        <p className="text-app-text-sub mt-1 text-sm">Review API token requests, AI model logs, tutor conversations, and generated learning resources.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Token Usage Chart */}
        <div className="bg-app-bg-alt border border-app-border p-5 rounded-xl shadow-sm lg:col-span-2">
          <h3 className="text-base font-bold text-app-text-main mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-purple-600" />
            AI API Token Consumption History
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tokenUsage}>
                <defs>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="tokens" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTokens)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Stats Cards */}
        <div className="space-y-4">
          <div className="bg-app-bg-alt border border-app-border p-4 rounded-xl shadow-sm">
            <span className="text-xs font-bold text-app-text-muted uppercase tracking-wider">AI Accuracy Rate</span>
            <p className="text-2xl font-bold text-app-text-main mt-2">98.6%</p>
            <p className="text-[10px] text-emerald-700 font-semibold mt-1">Based on student feedback thumb-ups.</p>
          </div>
          
          <div className="bg-app-bg-alt border border-app-border p-4 rounded-xl shadow-sm">
            <span className="text-xs font-bold text-app-text-muted uppercase tracking-wider">Total LLM Requests Today</span>
            <p className="text-2xl font-bold text-app-text-main mt-2">4,285 Queries</p>
            <p className="text-[10px] text-purple-700 font-semibold mt-1">Across all integrated modules.</p>
          </div>
        </div>
      </div>

      {/* AI Log feed */}
      <div className="bg-app-bg-alt border border-app-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-app-border bg-gray-50 text-app-text-main font-bold text-sm">
          Recent LLM Generation Logs
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-app-border text-xs uppercase font-bold text-app-text-sub">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">AI Component</th>
                <th className="p-4">Input Prompt / Topic</th>
                <th className="p-4">Tokens Used</th>
                <th className="p-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border text-sm">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-app-text-main">{log.user}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 uppercase tracking-wider border border-purple-200">
                      {log.tool}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-app-text-sub max-w-xs truncate">"{log.prompt}"</td>
                  <td className="p-4 text-xs font-semibold text-app-text-sub">{log.tokens}</td>
                  <td className="p-4 text-right text-xs font-semibold text-app-text-muted">{log.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AIModule;
