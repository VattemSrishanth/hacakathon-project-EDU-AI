import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import {
  Server,
  Activity,
  Cpu,
  Database,
  RotateCw,
  HardDrive
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const SystemHealth = () => {
  const [health, setHealth] = useState({
    mongodb: 'connected',
    redis: 'connected',
    emailServer: 'connected',
    socketServer: 'connected',
    videoServer: 'connected',
    cpuUsage: 15,
    memoryUsage: 40,
    storageUsage: 50,
    apiResponseTime: 95
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getSystemHealthStatus();
      if (res.success) {
        setHealth(res.health);
        setLogs(res.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-app-text-main">System Health</h1>
          <p className="text-app-text-sub mt-1 text-sm">Monitor database integrations, server workloads, WebSockets pipelines, and CPU loads.</p>
        </div>
        <button
          onClick={fetchHealth}
          className="flex items-center gap-1.5 px-4 py-2 border border-app-border hover:bg-gray-100 rounded-lg text-sm font-semibold text-app-text-main bg-white transition-colors">
          <RotateCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Status
        </button>
      </div>

      {/* Integration states */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { name: 'MongoDB', status: health.mongodb, desc: 'User & Course database' },
          { name: 'Redis Cache', status: health.redis, desc: 'Session memory store' },
          { name: 'Email Server', status: health.emailServer, desc: 'SMTP dispatcher client' },
          { name: 'Socket Server', status: health.socketServer, desc: 'Live doubts dispatcher' },
          { name: 'Video call server', status: health.videoServer, desc: 'WebRTC Signaling server' }
        ].map((srv) => (
          <div key={srv.name} className="bg-app-bg-alt border border-app-border p-4 rounded-xl shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-app-text-sub">{srv.name}</span>
              <p className="text-[10px] text-app-text-muted mt-0.5">{srv.desc}</p>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-700 capitalize">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span>{srv.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Latency line chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-app-bg-alt border border-app-border p-5 rounded-xl shadow-sm lg:col-span-2">
          <h3 className="text-base font-bold text-app-text-main mb-4 flex items-center gap-2">
            <Activity size={16} className="text-primary" />
            API Latency / Response Time Over Time (ms)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={logs}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="latency" stroke="#7F1D1D" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System parameters tracker gauges */}
        <div className="space-y-4">
          <div className="bg-app-bg-alt border border-app-border p-4 rounded-xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-red-50 text-primary rounded-lg">
              <Cpu size={24} />
            </div>
            <div>
              <span className="text-xs font-bold text-app-text-muted uppercase tracking-wider">CPU Workload</span>
              <p className="text-2xl font-bold text-app-text-main">{health.cpuUsage}%</p>
              <div className="w-48 bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                <div className="bg-primary h-full" style={{ width: `${health.cpuUsage}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-app-bg-alt border border-app-border p-4 rounded-xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <Server size={24} />
            </div>
            <div>
              <span className="text-xs font-bold text-app-text-muted uppercase tracking-wider">Memory Allocation</span>
              <p className="text-2xl font-bold text-app-text-main">{health.memoryUsage}%</p>
              <div className="w-48 bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                <div className="bg-indigo-600 h-full" style={{ width: `${health.memoryUsage}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-app-bg-alt border border-app-border p-4 rounded-xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-secondary rounded-lg">
              <HardDrive size={24} />
            </div>
            <div>
              <span className="text-xs font-bold text-app-text-muted uppercase tracking-wider">Storage Capacity</span>
              <p className="text-2xl font-bold text-app-text-main">{health.storageUsage}%</p>
              <div className="w-48 bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                <div className="bg-secondary h-full" style={{ width: `${health.storageUsage}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;
