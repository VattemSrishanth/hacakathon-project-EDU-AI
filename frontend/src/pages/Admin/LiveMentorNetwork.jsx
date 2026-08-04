import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import {
  Users,
  Video,
  Clock,
  Sparkles,
  MapPin,
  TrendingUp,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

const LiveMentorNetwork = () => {
  const [logs, setLogs] = useState({
    onlineTeachers: [],
    waitingStudents: [],
    matchingQueue: [],
    activeSessions: [],
    stats: { avgResponseTime: 30, avgRating: '4.8', queueLength: 0 }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timerCounts, setTimerCounts] = useState({}); // sessionId -> seconds remaining

  const fetchLiveLogs = async () => {
    try {
      const res = await adminAPI.getLiveMentorLogs();
      if (res.success) {
        setLogs(res);
        
        // Setup countdown timers for matching sessions (30s dispatch timeout)
        const counts = {};
        res.waitingStudents.forEach((sess) => {
          const elapsed = Math.floor((Date.now() - new Date(sess.createdAt).getTime()) / 1000);
          counts[sess._id] = Math.max(0, 30 - elapsed);
        });
        setTimerCounts(counts);
      }
    } catch (err) {
      setError('Failed to fetch real-time dispatch logs');
    }
  };

  useEffect(() => {
    fetchLiveLogs();
    const interval = setInterval(() => {
      fetchLiveLogs();
    }, 5000); // refresh every 5 seconds for simulation

    return () => clearInterval(interval);
  }, []);

  // Update countdown timers locally every second
  useEffect(() => {
    const clock = setInterval(() => {
      setTimerCounts((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => {
          if (next[k] > 0) next[k] -= 1;
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(clock);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-app-text-main">Live Mentor Dispatch</h1>
          <p className="text-app-text-sub mt-1 text-sm">Real-time dispatcher view matching doubt requests with certified educators.</p>
        </div>
        <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-emerald-800 font-bold text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping"></span>
          <span>Live Listening</span>
        </div>
      </div>

      {error && <div className="bg-error/10 border border-error text-error p-3.5 rounded-lg text-sm font-semibold">{error}</div>}

      {/* Dispatch Dashboard Header Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-app-bg-alt border border-app-border p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-start text-app-text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Queue Length</span>
            <Clock size={16} className="text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-app-text-main mt-2">{logs.stats.queueLength} Student(s)</p>
          <p className="text-[10px] text-amber-700 font-semibold mt-1">Pending immediate match responses.</p>
        </div>

        <div className="bg-app-bg-alt border border-app-border p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-start text-app-text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Online Teachers</span>
            <Users size={16} className="text-primary" />
          </div>
          <p className="text-2xl font-bold text-app-text-main mt-2">{logs.onlineTeachers.length} Available</p>
          <p className="text-[10px] text-app-text-muted font-semibold mt-1">Ready for doubt broadcast alerts.</p>
        </div>

        <div className="bg-app-bg-alt border border-app-border p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-start text-app-text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Active Video Rooms</span>
            <Video size={16} className="text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-app-text-main mt-2">{logs.activeSessions.length} Class(es)</p>
          <p className="text-[10px] text-indigo-700 font-semibold mt-1">Currently operating live rooms.</p>
        </div>

        <div className="bg-app-bg-alt border border-app-border p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-start text-app-text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Response Time</span>
            <TrendingUp size={16} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-app-text-main mt-2">{logs.stats.avgResponseTime} Seconds</p>
          <p className="text-[10px] text-emerald-700 font-semibold mt-1">Industry standard benchmark verified.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Dispatch Queue matching simulator */}
        <div className="bg-app-bg-alt border border-app-border rounded-xl shadow-sm flex flex-col h-[500px] overflow-hidden lg:col-span-2">
          <div className="p-4 border-b border-app-border bg-gray-50 text-app-text-main font-bold text-sm">
            Active Smart Matching Queue (Uber Dispatch System)
          </div>
          <div className="p-4 overflow-y-auto flex-1 divide-y divide-app-border">
            {logs.waitingStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-app-text-muted gap-2 py-12">
                <Sparkles size={32} className="opacity-40 text-primary animate-pulse" />
                <p className="text-sm font-semibold">No student doubts currently in the matching pipeline.</p>
              </div>
            ) : (
              logs.waitingStudents.map((session) => {
                const timer = timerCounts[session._id];
                return (
                  <div key={session._id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 max-w-lg">
                      <div className="flex items-center gap-2">
                        <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-bold">{session.subject}</span>
                        <span className="text-xs text-app-text-sub font-semibold">{session.grade} | {session.language}</span>
                      </div>
                      <h4 className="font-bold text-app-text-main text-sm">"{session.questionText}"</h4>
                      <p className="text-xs text-app-text-muted">Student Name: <span className="text-app-text-sub font-bold">{session.studentId?.name || 'Anonymous Student'}</span></p>
                    </div>

                    <div className="flex items-center gap-3">
                      {timer > 0 ? (
                        <div className="text-right">
                          <span className="text-[10px] text-app-text-muted block font-semibold">MATCHING LIMIT</span>
                          <span className="text-sm font-bold text-amber-600 animate-pulse">{timer} Seconds left</span>
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="text-[10px] text-app-text-muted block font-semibold">MATCH STATUS</span>
                          <span className="text-xs font-bold text-rose-600 uppercase">Timeout / Re-dispatching</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Online Teachers Listing */}
        <div className="bg-app-bg-alt border border-app-border rounded-xl shadow-sm flex flex-col h-[500px] overflow-hidden">
          <div className="p-4 border-b border-app-border bg-gray-50 text-app-text-main font-bold text-sm">
            Online Verified Mentors
          </div>
          <div className="p-4 overflow-y-auto flex-1 divide-y divide-app-border">
            {logs.onlineTeachers.length === 0 ? (
              <div className="text-center py-12 text-app-text-muted text-sm italic">
                No mentors online.
              </div>
            ) : (
              logs.onlineTeachers.map((teacher) => (
                <div key={teacher._id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={teacher.userId?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover border border-app-border shadow-xs bg-white"
                    />
                    <div>
                      <h4 className="font-bold text-app-text-main text-xs">{teacher.userId?.name}</h4>
                      <p className="text-[10px] text-app-text-muted">{teacher.subjects?.slice(0,2).join(', ')}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                      teacher.isFree ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {teacher.isFree ? 'Available' : 'Busy'}
                    </span>
                    <span className="text-[9px] text-app-text-muted block mt-0.5">Rating: {teacher.rating}/5.0</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Live Active sessions tracker */}
      <div className="bg-app-bg-alt border border-app-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-app-border bg-gray-50 text-app-text-main font-bold text-sm">
          Active Live Mentorship Classrooms
        </div>
        <div className="p-4">
          {logs.activeSessions.length === 0 ? (
            <p className="text-center py-8 text-app-text-muted text-sm italic">No active doubt sessions running.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {logs.activeSessions.map((session) => (
                <div key={session._id} className="p-4 bg-white border border-app-border rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-bold">{session.subject}</span>
                    <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold">
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                      <span>Connected</span>
                    </div>
                  </div>
                  <p className="text-xs text-app-text-muted line-clamp-2">"{session.questionText}"</p>
                  <div className="divide-y divide-app-border text-[11px] font-semibold text-app-text-sub pt-1">
                    <div className="py-1 flex justify-between">
                      <span>Student</span>
                      <span className="text-app-text-main">{session.studentId?.name}</span>
                    </div>
                    <div className="py-1 flex justify-between">
                      <span>Mentor Educator</span>
                      <span className="text-app-text-main">{session.teacherId?.name || 'N/A'}</span>
                    </div>
                    <div className="py-1 flex justify-between">
                      <span>Room Name</span>
                      <span className="text-app-text-muted select-all">session_{session._id.slice(-6)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveMentorNetwork;
