import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { BarChart3, Calendar, FileJson, Clock } from 'lucide-react';
import ProgressReport from '../../components/reports/ProgressReport';
import AttendanceReport from '../../components/reports/AttendanceReport';
import ExportOptions from '../../components/reports/ExportOptions';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('progress');
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      // Use the existing reports API (works if teacher or admin)
      const res = await adminAPI.getReportsData();
      if (res.success) {
        setReportsData(res.reports);
      } else {
        setError('Failed to fetch analytics statistics');
      }
    } catch (err) {
      console.error(err);
      setError('Connection to admin analytics failed. Showing offline mode metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="space-y-8 min-h-screen bg-app-bg animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-app-border pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-primary text-white text-[10px] font-bold uppercase tracking-wider">
            Reports & Analytics
          </div>
          <h1 className="text-3xl font-black text-app-text-main tracking-tight uppercase">Institution Progress Reports</h1>
          <p className="text-app-text-sub font-medium text-sm">
            Review detailed student progress summaries, class attendance indices, and export logs.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 bg-app-bg-alt border border-app-border p-1 rounded-2xl">
          {[
            { id: 'progress', label: 'Progress', icon: BarChart3 },
            { id: 'attendance', label: 'Attendance', icon: Calendar },
            { id: 'export', label: 'Export', icon: FileJson }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-sm shadow-primary/20'
                  : 'text-app-text-sub hover:text-primary'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {error && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-bold uppercase tracking-widest rounded-2xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchReports} className="underline hover:text-amber-800">Retry Connection</button>
        </div>
      )}

      {/* Tab Render Area */}
      <div className="mt-8">
        {activeTab === 'progress' && (
          <ProgressReport reportsData={reportsData} loading={loading} />
        )}
        {activeTab === 'attendance' && (
          <AttendanceReport reportsData={reportsData} loading={loading} />
        )}
        {activeTab === 'export' && (
          <ExportOptions reportsData={reportsData} />
        )}
      </div>
    </div>
  );
};

export default Reports;