import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

  const pdfUrl = state.pdfUrl;
  const pdfName = state.pdfName || 'Uploaded PDF';
  const pdfData = state.pdfData;

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => undefined);
    }
  };

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
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
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-app-text-muted">Previewing</p>
            <h1 className="text-2xl font-black text-app-text-main">{pdfName}</h1>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => navigate('/lessons')}
              className="rounded-xl font-black uppercase tracking-widest text-[10px]"
            >
              Back to Lessons
            </Button>
            {pdfUrl && (
              <Button
                variant="primary"
                onClick={() => navigate('/lessons/quiz', { state: { pdfUrl, pdfName, pdfData }, replace: true })}
                className="rounded-xl font-black uppercase tracking-widest text-[10px]"
              >
                Generate Quiz
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
          <div className="h-[75vh] overflow-auto bg-app-bg-alt">
            <iframe
              src={pdfUrl}
              title={pdfName}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    );
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
