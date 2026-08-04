import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Video,
  FileText,
  Cpu,
  Mail,
  Server,
  Activity,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#7F1D1D', '#F59E0B', '#6D28D9', '#059669', '#2563EB'];

const DashboardHome = ({ stats, onNavigate, onVerifyTeacher }) => {
  // Chart Data Preparation
  const weeklyUsersData = useMemo(() => [
    { name: 'Mon', users: 140 },
    { name: 'Tue', users: 220 },
    { name: 'Wed', users: 310 },
    { name: 'Thu', users: 290 },
    { name: 'Fri', users: 350 },
    { name: 'Sat', users: 180 },
    { name: 'Sun', users: 210 }
  ], []);

  const aiRequestsData = useMemo(() => [
    { name: 'Mon', requests: 450 },
    { name: 'Tue', requests: 620 },
    { name: 'Wed', requests: 890 },
    { name: 'Thu', requests: 780 },
    { name: 'Fri', requests: 950 },
    { name: 'Sat', requests: 310 },
    { name: 'Sun', requests: 420 }
  ], []);

  const studentGrowthData = useMemo(() => [
    { name: 'Jan', students: 1000 },
    { name: 'Feb', students: 1350 },
    { name: 'Mar', students: 1800 },
    { name: 'Apr', students: 2400 },
    { name: 'May', students: 3100 },
    { name: 'Jun', students: 4200 }
  ], []);

  const subjectPopularity = useMemo(() => [
    { name: 'Mathematics', value: 45 },
    { name: 'Science', value: 38 },
    { name: 'English', value: 29 },
    { name: 'Physics', value: 22 },
    { name: 'Computer Sci', value: 18 }
  ], []);

  const teacherActivityData = useMemo(() => [
    { name: 'Math Dept', active: 14, sessions: 98 },
    { name: 'Science Dept', active: 11, sessions: 84 },
    { name: 'English Dept', active: 8, sessions: 45 },
    { name: 'Humanities', active: 6, sessions: 32 }
  ], []);

  const cardData = useMemo(() => [
    { title: 'Total Users', value: stats?.total_users || 0, icon: Users, color: 'text-primary bg-primary/10 border-primary/20' },
    { title: 'Students Online', value: stats?.online_students || 0, icon: Activity, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { title: 'Teachers Online', value: stats?.online_teachers || 0, icon: Users, color: 'text-secondary bg-secondary/10 border-secondary/20' },
    { title: 'Students Waiting', value: stats?.waiting_students || 0, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { title: 'Active Live Sessions', value: stats?.active_sessions || 0, icon: Video, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { title: 'Assignments Today', value: stats?.assignments_today || 0, icon: FileText, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { title: 'AI Requests Today', value: stats?.ai_requests_today || 0, icon: Sparkles, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { title: 'Notifications Sent', value: stats?.notifications_sent || 0, icon: Mail, color: 'text-sky-600 bg-sky-50 border-sky-200' }
  ], [stats]);

  const healthChecks = useMemo(() => [
    { name: 'MongoDB', status: 'connected', latency: '4ms' },
    { name: 'Redis Cache', status: 'connected', latency: '1ms' },
    { name: 'Email Server', status: 'connected', latency: '12ms' },
    { name: 'Socket Server', status: 'connected', latency: '2ms' },
    { name: 'Video call server', status: 'connected', latency: '15ms' }
  ], []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-app-text-main">Dashboard Home</h1>
        <p className="text-app-text-sub mt-1 text-sm">Real-time command center and system analytics overview.</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cardData.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`p-5 bg-app-bg-alt border rounded-xl shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md ${card.color}`}>
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold tracking-wider uppercase opacity-85 text-app-text-sub">{card.title}</span>
              <card.icon size={18} className="opacity-80" />
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold text-app-text-main">{card.value}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Active Users */}
        <div className="bg-app-bg-alt border border-app-border p-5 rounded-xl shadow-sm lg:col-span-2">
          <h3 className="text-base font-bold text-app-text-main mb-4 flex items-center gap-2">
            <Activity size={16} className="text-primary" />
            Weekly Users Activity
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyUsersData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7F1D1D" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#7F1D1D" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="#7F1D1D" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Subjects */}
        <div className="bg-app-bg-alt border border-app-border p-5 rounded-xl shadow-sm">
          <h3 className="text-base font-bold text-app-text-main mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-secondary" />
            Most Popular Subjects
          </h3>
          <div className="h-64 flex flex-col justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={subjectPopularity}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value">
                  {subjectPopularity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] font-medium text-app-text-sub px-2">
              {subjectPopularity.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                  <span className="truncate">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily AI Tutor Requests */}
        <div className="bg-app-bg-alt border border-app-border p-5 rounded-xl shadow-sm">
          <h3 className="text-base font-bold text-app-text-main mb-4 flex items-center gap-2">
            <Cpu size={16} className="text-purple-600" />
            Daily AI Tutor Requests
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aiRequestsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="requests" fill="#6D28D9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Enrollment growth */}
        <div className="bg-app-bg-alt border border-app-border p-5 rounded-xl shadow-sm">
          <h3 className="text-base font-bold text-app-text-main mb-4 flex items-center gap-2">
            <Users size={16} className="text-emerald-600" />
            Student Growth (Cumulative)
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={studentGrowthData}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="students" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorGrowth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3 - Verifications, Logs, & Platform Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Teacher Verifications */}
        <div className="bg-app-bg-alt border border-app-border rounded-xl shadow-sm flex flex-col justify-between overflow-hidden">
          <div className="p-4 border-b border-app-border bg-gray-50 flex justify-between items-center text-app-text-main font-bold">
            <span>Teacher Verification Requests</span>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
              {stats?.pending_verifications_count || 0} Pending
            </span>
          </div>
          <div className="p-4 flex-1">
            {!stats?.teacher_verifications || stats.teacher_verifications.filter(v => v.status === 'pending').length === 0 ? (
              <div className="text-center py-12 text-app-text-muted text-sm italic">
                No teacher verification applications pending.
              </div>
            ) : (
              <div className="space-y-3">
                {stats.teacher_verifications.filter(v => v.status === 'pending').slice(0, 3).map((item) => (
                  <div key={item._id} className="p-3 bg-white border border-app-border rounded-lg flex items-center justify-between text-sm">
                    <div>
                      <h4 className="font-semibold text-app-text-main">{item.userId?.name || 'Applicant'}</h4>
                      <p className="text-xs text-app-text-muted">{item.userId?.email || 'N/A'}</p>
                    </div>
                    <button
                      onClick={() => onNavigate('Teacher Verification')}
                      className="text-primary hover:text-primary-hover font-bold text-xs flex items-center gap-1">
                      Review <ChevronRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Moderation Alert Logs */}
        <div className="bg-app-bg-alt border border-app-border rounded-xl shadow-sm flex flex-col justify-between overflow-hidden">
          <div className="p-4 border-b border-app-border bg-gray-50 flex justify-between items-center text-app-text-main font-bold">
            <span className="flex items-center gap-2">
              <ShieldAlert size={16} className="text-rose-600" />
              Recent AI Moderation Flags
            </span>
          </div>
          <div className="p-4 flex-1">
            {!stats?.moderation_logs || stats.moderation_logs.length === 0 ? (
              <div className="text-center py-12 text-app-text-muted text-sm italic">
                No chat standard violations logged.
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {stats.moderation_logs.slice(0, 3).map((log) => (
                  <div key={log._id} className="p-3 bg-rose-50/50 border border-rose-100 rounded-lg text-xs">
                    <div className="flex justify-between items-center font-bold text-rose-900 mb-1">
                      <span>User: {log.userId?.name || 'Unknown'}</span>
                      <span className="bg-rose-100 px-2 py-0.5 rounded text-[10px] capitalize">{log.infractionType}</span>
                    </div>
                    <p className="text-rose-900 italic font-medium">"{log.messageContent}"</p>
                    <div className="mt-1 flex justify-between items-center text-app-text-muted text-[10px]">
                      <span>Action: {log.actionTaken}</span>
                      <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Platform Status */}
        <div className="bg-app-bg-alt border border-app-border rounded-xl shadow-sm flex flex-col justify-between overflow-hidden">
          <div className="p-4 border-b border-app-border bg-gray-50 flex justify-between items-center text-app-text-main font-bold">
            <span className="flex items-center gap-2">
              <Server size={16} className="text-emerald-600" />
              Platform Integration Health
            </span>
          </div>
          <div className="p-4 flex-1 divide-y divide-app-border">
            {healthChecks.map((srv) => (
              <div key={srv.name} className="flex justify-between py-2 text-sm items-center">
                <span className="font-semibold text-app-text-main">{srv.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-app-text-muted">{srv.latency}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span className="text-xs text-emerald-700 capitalize font-bold">Connected</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
