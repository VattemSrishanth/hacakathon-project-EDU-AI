import React from 'react';
import { Hand, Info } from 'lucide-react';
import VideoPlayer from './VideoPlayer';









const SignLanguagePanel = ({
  lessonTitle,
  signVideoUrl,
  transcript,
  isLoading,
  error
}) => {
  const isYouTube = signVideoUrl?.includes('youtube.com/embed');

  return (
    <div className="flex flex-col gap-6 w-full animate-in slide-in-from-right duration-500">
      <div className="bg-app-bg-alt rounded-[2.5rem] p-4 border-2 border-primary/30 shadow-xl overflow-hidden">
        <div className="bg-app-bg rounded-4xl overflow-hidden aspect-video relative flex items-center justify-center border border-app-border">
          {isLoading ?
          <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-app-text-sub text-xs font-bold uppercase tracking-widest">Searching for Sign Language Video...</p>
            </div> :
          signVideoUrl ?
          isYouTube ?
          <iframe
            src={signVideoUrl}
            width="100%"
            height="100%"
            className="w-full h-full border-0 rounded-3xl"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Sign Language Video" /> :


          <VideoPlayer
            src={signVideoUrl}
            transcript={transcript} /> :



          <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-full text-primary animate-pulse">
                <Hand size={48} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-app-text-main uppercase tracking-tight">
                  {error ? "Sign language video not available." : "Sign Video Unavailable"}
                </h3>
                <p className="text-app-text-sub text-sm font-medium mt-1">
                  {error ? "We couldn't find a matching video for this topic yet." : "We are working on adding a sign language translation for this lesson."}
                </p>
              </div>
              <div className="bg-primary/5 text-primary p-4 rounded-2xl flex items-start gap-3 border border-primary/10 text-left max-w-md">
                <Info size={18} className="shrink-0 mt-0.5" />
                <p className="text-xs font-bold leading-relaxed">
                  FALLBACK: Please use the visual transcript below and the high-contrast text version for the best learning experience.
                </p>
              </div>
            </div>
          }
        </div>
        
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-app-text-sub">Sign Language Mode Active</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{lessonTitle}</span>
        </div>
      </div>

      <div className="bg-app-bg-alt rounded-[2.5rem] p-8 border border-app-border shadow-inner">
        <h3 className="text-lg font-black text-app-text-main mb-6 uppercase tracking-widest flex items-center gap-3">
          <div className="w-1.5 h-6 bg-primary rounded-full" />
          Text Transcript
        </h3>
        <div className=" prose prose-slate prose-lg dark:prose-invert max-w-none">
          <p className="text-app-text-main leading-relaxed font-bold text-lg whitespace-pre-wrap">
            {transcript}
          </p>
        </div>
      </div>
    </div>);

};

export default SignLanguagePanel;