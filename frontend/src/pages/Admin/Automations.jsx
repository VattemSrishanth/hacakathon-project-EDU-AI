import React, { useState } from 'react';
import {
  Cpu,
  Mail,
  FileSpreadsheet,
  AlertTriangle,
  Clock,
  Sparkles,
  Play,
  RotateCw
} from 'lucide-react';

const Automations = () => {
  const [jobs, setJobs] = useState([
    { name: 'Assignment Deadline Checker', schedule: 'Every 6 Hours', status: 'Idle', lastRun: '2 hours ago', type: 'assignment' },
    { name: 'Exam Alert Countdown dispatcher', schedule: 'Daily at 08:00 AM', status: 'Idle', lastRun: '15 hours ago', type: 'exam' },
    { name: 'Revision reminder push dispatcher', schedule: 'Daily at 06:00 PM', status: 'Idle', lastRun: '5 hours ago', type: 'revision' },
    { name: 'Weekly Student Performance Report Builder', schedule: 'Every Sunday at 11:00 PM', status: 'Idle', lastRun: '2 days ago', type: 'report' },
    { name: 'Autogen Certificate Generator', schedule: 'Continuous', status: 'Listening', lastRun: 'Just now', type: 'certificate' }
  ]);

  const [loadingJob, setLoadingJob] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const triggerJob = (jobName) => {
    setLoadingJob(jobName);
    setSuccessMsg('');
    
    // Simulate cron trigger
    setTimeout(() => {
      setJobs((prev) =>
        prev.map((j) => (j.name === jobName ? { ...j, status: 'Completed', lastRun: 'Just now' } : j))
      );
      setLoadingJob(null);
      setSuccessMsg(`Successfully executed job: ${jobName}`);
      setTimeout(() => {
        setJobs((prev) =>
          prev.map((j) => (j.name === jobName ? { ...j, status: 'Idle' } : j))
        );
      }, 5000);
    }, 1800);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-app-text-main">Automations Hub</h1>
        <p className="text-app-text-sub mt-1 text-sm">Monitor automated background tasks, trigger notification engines, and process scheduled batch calculations.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-500 text-emerald-700 p-3.5 rounded-lg text-sm font-semibold animate-bounce">
          {successMsg}
        </div>
      )}

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <div key={job.name} className="bg-app-bg-alt border border-app-border rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-app-text-main text-sm">{job.name}</h3>
                <p className="text-xs text-app-text-muted mt-0.5">Schedule: {job.schedule}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                job.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                job.status === 'Listening' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
              }`}>
                {job.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold text-app-text-sub pt-1 border-t border-app-border">
              <span>Last Run: {job.lastRun}</span>
              <button
                disabled={loadingJob === job.name || job.status === 'Listening'}
                onClick={() => triggerJob(job.name)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded font-bold transition-colors">
                {loadingJob === job.name ? (
                  <RotateCw size={12} className="animate-spin" />
                ) : (
                  <Play size={12} />
                )}
                <span>Run Now</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Automations logs */}
      <div className="bg-app-bg-alt border border-app-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-app-border bg-gray-50 text-app-text-main font-bold text-sm">
          Background Automation Engine logs
        </div>
        <div className="p-4 max-h-60 overflow-y-auto space-y-2 text-xs">
          <div className="flex gap-2 font-mono">
            <span className="text-app-text-muted">[2026-08-03 23:10:05]</span>
            <span className="text-emerald-700 font-bold">[SUCCESS]</span>
            <span className="text-app-text-sub">Completed scanning 48 student assignment deadlines. 3 reminders queued.</span>
          </div>
          <div className="flex gap-2 font-mono">
            <span className="text-app-text-muted">[2026-08-03 23:00:00]</span>
            <span className="text-blue-700 font-bold">[INFO]</span>
            <span className="text-app-text-sub">Started scheduled exam countdown calculation for Semester 3.</span>
          </div>
          <div className="flex gap-2 font-mono">
            <span className="text-app-text-muted">[2026-08-03 22:45:12]</span>
            <span className="text-emerald-700 font-bold">[SUCCESS]</span>
            <span className="text-app-text-sub">Successfully auto-generated digital certificate for Student ID #2394 (Course: Advanced Algorithms).</span>
          </div>
          <div className="flex gap-2 font-mono">
            <span className="text-app-text-muted">[2026-08-03 22:00:00]</span>
            <span className="text-amber-700 font-bold">[WARNING]</span>
            <span className="text-app-text-sub">Email server API throttling detected. Retrying batch remainder emails queue.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Automations;
