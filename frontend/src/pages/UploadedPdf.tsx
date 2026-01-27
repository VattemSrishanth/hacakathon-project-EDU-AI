import { useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, ClipboardList, BookOpen } from 'lucide-react';
import Button from '../components/Button';

interface LocationState {
  pdfUrl?: string;
  pdfName?: string;
  pdfData?: string;
}

const UploadedPdf = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const pdfUrl = state.pdfUrl;
  const pdfName = state.pdfName || 'Uploaded PDF';
  const pdfData = state.pdfData;

  const handleFullscreen = () => {
    if (!document.fullscreenElement && pdfContainerRef.current) {
      pdfContainerRef.current.requestFullscreen?.().catch(() => undefined);
    } else if (document.fullscreenElement) {
        document.exitFullscreen();
    }
  };

  useEffect(() => {
    // We do NOT revoke the object URL here anymore because passing it to the 
    // Quiz page (which might need to fetch it again) requires the URL to stay valid.
    // The browser will clean it up on document unload, or we can rely on GC.
    return () => {
       // Intentional no-op to allow Blob URL to survive navigation
    };
  }, [pdfUrl]);

  const content = useMemo(() => {
    if (!pdfUrl) {
      return (
        <div className="text-center space-y-4">
          <p className="text-app-text-sub font-medium">No PDF found. Please upload a file from the Lessons page.</p>
          <Button variant="primary" onClick={() => navigate('/lessons')} className="rounded-xl">
            Go to Lessons
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap bg-white p-6 rounded-3xl shadow-sm border border-app-border">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileText size={32} className="text-primary" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-app-text-muted">Document Preview</p>
              <h1 className="text-2xl font-black text-app-text-main">{pdfName}</h1>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => navigate('/lessons')}
              className="rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2"
            >
              <BookOpen size={16} /> Back to Lessons
            </Button>
            {pdfUrl && (
              <Button
                variant="primary"
                onClick={() => navigate('/lessons/quiz', { state: { pdfUrl, pdfName, pdfData }, replace: true })}
                className="rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-xl shadow-indigo-500/20"
              >
                <ClipboardList size={16} /> Start Smart Quiz
              </Button>
            )}
          </div>
        </div>

        <div className="border border-app-border rounded-2xl bg-app-bg shadow-sm">
          <div className="border-b border-app-border px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-bold text-app-text-main">PDF Viewer</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleFullscreen}
                className="rounded-xl font-bold text-xs uppercase tracking-widest"
              >
                Fullscreen
              </Button>
            </div>
          </div>
          <div ref={pdfContainerRef} className="h-[75vh] overflow-auto bg-app-bg-alt">
            <iframe
              src={pdfUrl}
              title={pdfName}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, pdfData, pdfName, pdfUrl]);

  return (
    <div className="min-h-screen bg-app-bg-alt py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {content}
      </div>
    </div>
  );
};

export default UploadedPdf;
