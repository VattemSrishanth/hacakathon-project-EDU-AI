import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FileText, ClipboardList, BookOpen, Trash2, Download, WifiOff, Clock, ChevronRight } from 'lucide-react';
import Button from '../components/Button';
import { useOffline } from '../context/OfflineContext';
import { useAuth } from '../context/AuthContext';
import { offlineContentService } from '../services/offlineContent';








const UploadedPdf = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { downloadedLessons, removeLesson } = useOffline();
  const { auth } = useAuth();
  const [offlineLessons, setOfflineLessons] = useState([]);
  const state = location.state || {};
  const pdfContainerRef = useRef(null);

  const pdfUrl = state.pdfUrl;
  const pdfName = state.pdfName || 'Uploaded PDF';
  const pdfData = state.pdfData;

  useEffect(() => {
    const fetchOffline = async () => {
      if (auth?.user?.id) {
        const lessons = await offlineContentService.getAllLessons(String(auth.user.id));
        setOfflineLessons(lessons);
      } else {
        setOfflineLessons([]);
      }
    };
    fetchOffline();
  }, [downloadedLessons, auth?.user?.id]);

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
    };}, [pdfUrl]);

  const content = useMemo(() => {
    if (!pdfUrl) {
      return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                <Download size={12} />
                Local Storage
              </div>
              <h1 className="text-4xl font-black text-app-text-main tracking-tight uppercase leading-none">Saved Offline Content</h1>
              <p className="text-app-text-sub font-bold text-sm uppercase tracking-widest opacity-70">Access your learned topics without internet</p>
            </div>
            
            <Button variant="primary" onClick={() => navigate('/lessons')} className="rounded-2xl group flex items-center gap-3 px-8 py-4 shadow-xl shadow-primary/20">
              <BookOpen size={20} className="group-hover:rotate-12 transition-transform" />
              Explore More Lessons
            </Button>
          </div>

          {offlineLessons.length > 0 ?
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offlineLessons.map((lesson) =>
            <div key={lesson.id} className="group relative bg-app-bg-alt rounded-4xl p-1 border border-app-border hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5">
                  <div className="bg-app-bg rounded-[1.8rem] p-6 h-full flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                          <WifiOff size={24} />
                        </div>
                        <button
                      onClick={(e) => {e.preventDefault();removeLesson(lesson.id);}}
                      className="p-2 rounded-xl text-app-text-muted hover:text-red-500 hover:bg-red-50 transition-all"
                      title="Delete Lesson">
                      
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-app-text-main leading-tight uppercase group-hover:text-primary transition-colors line-clamp-2">{lesson.title}</h3>
                        <p className="text-[10px] font-black text-app-text-sub uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                          <Clock size={12} />
                          Saved {new Date(lesson.downloadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <Link
                  to={`/lessons/${lesson.id}`}
                  className="inline-flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-app-bg-alt border border-app-border group-hover:bg-primary group-hover:border-primary group-hover:text-white text-app-text-main font-black text-xs uppercase tracking-widest transition-all">
                  
                      Continue Learning
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
            )}
            </div> :

          <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 bg-app-bg-alt rounded-[3rem] border-2 border-dashed border-app-border">
              <div className="w-20 h-20 rounded-3xl bg-app-bg flex items-center justify-center text-app-text-muted">
                <WifiOff size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-app-text-main uppercase tracking-tight">No Offline Lessons</h3>
                <p className="text-app-text-sub font-bold text-sm max-w-xs mx-auto">Lessons you save for offline viewing will appear here automatically.</p>
              </div>
            </div>
          }
        </div>);

    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap bg-app-bg p-6 rounded-3xl shadow-sm border border-app-border">
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
              className="rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
              
              <BookOpen size={16} /> Back to Lessons
            </Button>
            {pdfUrl &&
            <Button
              variant="primary"
              onClick={() => navigate('/lessons/quiz', { state: { pdfUrl, pdfName, pdfData }, replace: true })}
              className="rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-xl shadow-primary/20">
              
                <ClipboardList size={16} /> Start Smart Quiz
              </Button>
            }
          </div>
        </div>

        <div className="border border-app-border rounded-[2.5rem] bg-app-bg shadow-2xl overflow-hidden ring-1 ring-app-border">
          <div className="border-b border-app-border px-8 py-5 flex items-center justify-between bg-app-bg-alt/50">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-app-text-main">Dedicated PDF Document Box</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleFullscreen}
                className="rounded-xl font-bold text-[10px] uppercase tracking-widest px-4 py-2">
                
                Toggle Fullscreen
              </Button>
            </div>
          </div>
          <div ref={pdfContainerRef} className="h-[80vh] overflow-hidden bg-[#525659]">
            <iframe
              src={pdfUrl}
              title={pdfName}
              className="w-full h-full border-0"
              style={{ display: 'block' }}
              allowFullScreen />
            
          </div>
          <div className="bg-app-bg-alt/30 px-8 py-4 border-t border-app-border flex justify-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-app-text-muted opacity-50">
              SECURE PDF VIEWING CHANNEL
            </p>
          </div>
        </div>
      </div>);

  }, [navigate, pdfData, pdfName, pdfUrl, offlineLessons, removeLesson]);

  return (
    <div className="min-h-screen bg-app-bg py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {content}
      </div>
    </div>);

};

export default UploadedPdf;