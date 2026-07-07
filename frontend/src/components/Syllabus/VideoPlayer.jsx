import React, { useRef, useEffect, useState } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Captions as CaptionsIcon,
  Subtitles } from
'lucide-react';








const VideoPlayer = ({ src, captionSrc, transcript, poster }) => {
  const { captionsEnabled, toggleCaptions } = useAccessibility();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);

  // Sync HTML5 captions with context
  useEffect(() => {
    if (videoRef.current && videoRef.current.textTracks.length > 0) {
      videoRef.current.textTracks[0].mode = captionsEnabled ? 'showing' : 'hidden';
    }
  }, [captionsEnabled]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress = videoRef.current.currentTime / videoRef.current.duration * 100;
      setProgress(currentProgress);
    }
  };

  const handleSeek = (e) => {
    if (videoRef.current) {
      const seekTime = parseFloat(e.target.value) / 100 * videoRef.current.duration;
      videoRef.current.currentTime = seekTime;
      setProgress(parseFloat(e.target.value));
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current?.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full group/player shadow-2xl rounded-3xl overflow-hidden bg-black border border-app-border">
      {/* Video Container */}
      <div className="relative aspect-video bg-black flex items-center justify-center">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="w-full h-full"
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          aria-label="Video Lesson Player"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === ' ') {
              e.preventDefault();
              togglePlay();
            }
            if (e.key === 'm') toggleMute();
            if (e.key === 'c') toggleCaptions();
            if (e.key === 'f') handleFullscreen();
          }}>
          
          {captionSrc &&
          <track
            src={captionSrc}
            kind="subtitles"
            srcLang="en"
            label="English"
            default={captionsEnabled} />

          }
        </video>

        {/* Custom Controls Overlay (Fade in on hover) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/player:opacity-100 transition-opacity flex flex-col justify-end p-4 lg:p-6 gap-4">
          
          {/* Progress Bar */}
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-primary"
            aria-label="Video progress slider" />
          

          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="hover:scale-110 transition-transform"
                aria-label={isPlaying ? "Pause video (Space)" : "Play video (Space)"}>
                
                {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
              </button>

              <button
                onClick={toggleMute}
                className="hover:scale-110 transition-transform"
                aria-label={isMuted ? "Unmute audio (M)" : "Mute audio (M)"}>
                
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleCaptions}
                className={`p-1.5 rounded-lg transition-all ${captionsEnabled ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/70 hover:text-white'}`}
                aria-label={captionsEnabled ? "Disable captions (C)" : "Enable captions (C)"}>
                
                <CaptionsIcon size={22} />
              </button>

              {transcript &&
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className={`p-1.5 rounded-lg transition-all ${showTranscript ? 'bg-secondary text-white' : 'text-white/70 hover:text-white'}`}
                aria-label="Toggle transcript panel">
                
                  <Subtitles size={22} />
                </button>
              }

              <button
                onClick={handleFullscreen}
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Enable fullscreen (F)">
                
                <Maximize size={22} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript / Caption Fallback Panel */}
      {(captionsEnabled && !captionSrc || showTranscript && transcript) &&
      <div className="bg-app-bg-alt border-t border-app-border p-6 lg:p-8 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <CaptionsIcon size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-app-text-main uppercase tracking-widest">
                {captionsEnabled && !captionSrc ? "Accessible Transcript" : "Lesson Transcript"}
              </h4>
              <p className="text-[10px] text-app-text-muted font-bold uppercase tracking-[0.15em] mt-0.5">
                Full text content for inclusive learning
              </p>
            </div>
          </div>
          <div className="text-app-text-main font-bold leading-relaxed max-w-4xl opacity-80">
            {transcript || "No transcript available for this video."}
          </div>
        </div>
      }
    </div>);

};

export default VideoPlayer;