import React from 'react';
import { Download, FileJson, Printer, ShieldAlert } from 'lucide-react';
import Button from '../Button';

const ExportOptions = ({ reportsData }) => {
  const triggerExport = (format) => {
    if (format === 'json') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportsData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "edu_ai_progress_report.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      window.print();
    }
  };

  return (
    <div className="bg-app-bg-alt border border-app-border rounded-3xl p-8 max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <h3 className="text-xl font-black text-app-text-main uppercase tracking-tight">Export and Print Center</h3>
        <p className="text-sm text-app-text-sub font-medium leading-relaxed">
          Generate off-line files and summaries of student and system activity logs for administration records or parent-teacher reviews.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* JSON Export */}
        <div className="border border-app-border bg-app-bg rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <FileJson size={20} />
            </div>
            <h4 className="text-sm font-black uppercase text-app-text-main">Raw JSON Export</h4>
            <p className="text-[11px] text-app-text-muted font-bold leading-normal">
              Download structured data of scores, logs, and metrics.
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full text-xs font-black uppercase tracking-wider py-3 flex items-center justify-center gap-2"
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
            <h4 className="text-sm font-black uppercase text-app-text-main">Printable PDF Summary</h4>
            <p className="text-[11px] text-app-text-muted font-bold leading-normal">
              Generate a formatted layout suitable for printing or PDF save.
            </p>
          </div>
          <Button
            variant="primary"
            className="w-full text-xs font-black uppercase tracking-wider py-3 flex items-center justify-center gap-2 shadow-lg"
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