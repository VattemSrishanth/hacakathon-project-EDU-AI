import React from 'react';
import { Download, FileJson, FileSpreadsheet, Printer, ShieldAlert } from 'lucide-react';
import Button from '../Button';

const ExportOptions = ({ reportsData }) => {
  const triggerExport = (format) => {
    if (format === 'json') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportsData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `edu_ai_progress_report_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else if (format === 'csv') {
      const rows = [
        ['Edu-AI Academic Progress & Performance Summary'],
        ['Generated Date', new Date().toLocaleDateString()],
        [],
        ['Section: Quiz Performance'],
        ['Assessment / Quiz Name', 'Average Score (%)']
      ];

      const quizScores = reportsData?.quizScores || [
        { name: "Quiz 1 - Algebra", averageScore: 84 },
        { name: "Quiz 2 - Optics", averageScore: 78 },
        { name: "Quiz 3 - Grammar", averageScore: 92 },
        { name: "Quiz 4 - Python Basics", averageScore: 81 }
      ];
      quizScores.forEach((q) => rows.push([q.name, q.averageScore]));

      rows.push([]);
      rows.push(['Section: Subject Engagement']);
      rows.push(['Subject', 'Completed Study Sessions']);
      const subjects = reportsData?.popularSubjects || [
        { subject: "Mathematics", sessions: 45 },
        { subject: "Science", sessions: 38 },
        { subject: "English", sessions: 29 },
        { subject: "Physics", sessions: 22 }
      ];
      subjects.forEach((s) => rows.push([s.subject, s.sessions]));

      rows.push([]);
      rows.push(['Section: Sample Attendance Log']);
      rows.push(['Student Name', 'Status', 'Session Duration', 'Timestamp']);
      const sampleAttendance = [
        ['Rohan Sharma', 'Present', '50m', '10:15 AM'],
        ['Aditya Reddy', 'Present', '45m', '11:00 AM'],
        ['Nisha G.', 'Absent', '0m', '--'],
        ['Sanjay Kumar', 'Present', '55m', '02:30 PM']
      ];
      sampleAttendance.forEach((a) => rows.push(a));

      const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `edu_ai_performance_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } else {
      window.print();
    }
  };

  return (
    <div className="bg-app-bg-alt border border-app-border rounded-3xl p-8 max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h3 className="text-xl font-black text-app-text-main uppercase tracking-tight">Export and Print Center</h3>
        <p className="text-sm text-app-text-sub font-medium leading-relaxed">
          Generate offline spreadsheet files and summaries of student and system activity logs for administrative records, Excel spreadsheets, or parent-teacher reviews.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CSV Spreadsheet Export */}
        <div className="border border-app-border bg-app-bg rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet size={20} />
            </div>
            <h4 className="text-sm font-black uppercase text-app-text-main">Excel / CSV Summary</h4>
            <p className="text-[11px] text-app-text-muted font-bold leading-normal">
              Spreadsheet format containing quiz grades, subject engagement, and attendance tables.
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full text-xs font-black uppercase tracking-wider py-3 flex items-center justify-center gap-2 cursor-pointer border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            onClick={() => triggerExport('csv')}
          >
            <Download size={14} /> Download CSV
          </Button>
        </div>

        {/* JSON Export */}
        <div className="border border-app-border bg-app-bg rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <FileJson size={20} />
            </div>
            <h4 className="text-sm font-black uppercase text-app-text-main">Raw JSON Export</h4>
            <p className="text-[11px] text-app-text-muted font-bold leading-normal">
              Structured raw analytics data for database imports and external integrations.
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full text-xs font-black uppercase tracking-wider py-3 flex items-center justify-center gap-2 cursor-pointer"
            onClick={() => triggerExport('json')}
          >
            <Download size={14} /> Download JSON
          </Button>
        </div>

        {/* Print Layout */}
        <div className="border border-app-border bg-app-bg rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
              <Printer size={20} />
            </div>
            <h4 className="text-sm font-black uppercase text-app-text-main">Printable Summary</h4>
            <p className="text-[11px] text-app-text-muted font-bold leading-normal">
              Print-optimized report layout ready for physical distribution or PDF export.
            </p>
          </div>
          <Button
            variant="primary"
            className="w-full text-xs font-black uppercase tracking-wider py-3 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            onClick={() => triggerExport('print')}
          >
            <Printer size={14} /> Open Print Layout
          </Button>
        </div>
      </div>

      <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-2xl flex items-start gap-4">
        <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={18} />
        <div className="space-y-1">
          <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-600">Privacy Notice</h5>
          <p className="text-[11px] font-bold text-app-text-sub leading-normal">
            Exported data contains institutional statistics and should be handled in accordance with educational data protection policies.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExportOptions;
