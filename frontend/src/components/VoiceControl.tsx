import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

/**
 * ENHANCED GLOBAL VOICE CONTROL SYSTEM
 * States:
 * - idle: Microphone is on but only looking for wake-phrase "Hey Chat".
 * - listening: Wake-phrase detected or manual button clicked. Ready for commands.
 * - processing: Executing a detected command.
 */

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const WAKE_WORDS = ["hey chat", "hi chat", "hello chat", "oye chat", "tutor", "ai tutor", "wake up"];

const VoiceControl: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSettings();
  const { accessibilityMode, voiceLanguage, lowPowerMode } = settings.themeAccessibility;

  const [state, setState] = useState<"idle" | "listening" | "processing">("idle");
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const stateRef = useRef<"idle" | "listening" | "processing">("idle");
  const lastFinalTranscriptRef = useRef<string>("");

  const isQuizRoute = location.pathname.startsWith("/lessons/quiz");

  // Keep state sync for high-frequency recognition callbacks
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Hard-disable voice control on quiz route
  useEffect(() => {
    if (isQuizRoute && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore stop errors
      }
    }
  }, [isQuizRoute]);

  const resetToIdle = useCallback(() => {
    setState("idle");
    stateRef.current = "idle";
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const handleNavigation = useCallback((path: string, query?: string) => {
    setState("processing");
    stateRef.current = "processing";
    
    console.log("[VoiceControl] Navigating to:", path, query ? `with query: ${query}` : "");
    
    if (query) {
      navigate(path, { state: { voiceQuery: query } });
    } else {
      navigate(path);
    }

    // Blind mode feedback
    if (accessibilityMode === "Blind") {
      const destination = path === "/" ? "home" : path.replace("/", "").replace("-", " ");
      const msg = new SpeechSynthesisUtterance(`Navigating to ${destination}`);
      window.speechSynthesis.speak(msg);
    }

    // Auto-return to idle after command execution
    setTimeout(() => resetToIdle(), 1000);
  }, [navigate, accessibilityMode, resetToIdle]);

  const executeCommand = useCallback((transcript: string) => {
    if (stateRef.current === "processing") return;

    // Strip wake words from the command to get clean navigation text
    let text = transcript.toLowerCase().trim();
    WAKE_WORDS.forEach(w => { text = text.replace(w, "").trim(); });
    
    console.log("[VoiceControl] Processing command:", text);
    
    if (!text) {
      console.log("[VoiceControl] Empty command after stripping wake words, staying in listening...");
      // DO NOT resetToIdle here. We want to stay listening for the actual instruction.
      return;
    }

    setState("processing");
    stateRef.current = "processing";

    // 1. Accessibility Check
    if (accessibilityMode === "Dumb") return;

    // 2. Fullscreen Commands
    const enterFsTriggers = [
      "full screen", "fullscreen", "enter full screen", "open full screen", "open fullscreen", "go full screen", "go fullscreen"
    ];
    const exitFsTriggers = [
      "exit full screen", "exit fullscreen", "leave full screen", "leave fullscreen", "close full screen", "close fullscreen", "normal screen"
    ];

    const textHas = (phrases: string[]) => phrases.some(p => text.includes(p));

    if (textHas(enterFsTriggers)) {
      setState("processing");
      stateRef.current = "processing";
      document.documentElement.requestFullscreen?.().catch(() => undefined);
      if (accessibilityMode === "Blind") {
        const msg = new SpeechSynthesisUtterance("Entering full screen");
        window.speechSynthesis.speak(msg);
      }
      setTimeout(() => resetToIdle(), 800);
      return;
    }

    if (textHas(exitFsTriggers)) {
      setState("processing");
      stateRef.current = "processing";
      document.exitFullscreen?.().catch(() => undefined);
      if (accessibilityMode === "Blind") {
        const msg = new SpeechSynthesisUtterance("Exiting full screen");
        window.speechSynthesis.speak(msg);
      }
      setTimeout(() => resetToIdle(), 800);
      return;
    }

    // 3. Command Parsing - expanded triggers for better recognition
    const commands = [
      { trigger: ["home", "go home", "main", "main page", "go to home", "homepage"], path: "/" },
      { trigger: ["dashboard", "dash", "dash board", "progress", "go to dashboard", "my progress"], path: "/dashboard" },
      { trigger: ["lesson", "lessons", "learn", "study", "classes", "go to lessons", "courses"], path: "/lessons" },
      { trigger: ["tutor", "ai tutor", "ai chat", "assistant", "go to tutor", "ask ai"], path: "/ai-tutor" },
      { trigger: ["accessibility", "access", "accessible", "go to accessibility"], path: "/accessibility" },
      { trigger: ["settings", "setting", "config", "preferences", "go to settings"], path: "/settings" },
      { trigger: ["support", "help", "contact", "go to support"], path: "/support" }
    ];

    const matched = commands.find(cmd => cmd.trigger.some(k => text.includes(k)));

    // 4. AI Direct Query Check (PRIORITIZE queries over simple nav if they look like questions)
    const askKeywords = ["what is", "tell me", "explain", "how to", "why", "what are", "who is", "define", "how does", "describe"];
    const askMatch = askKeywords.find(k => text.includes(k));

    if (askMatch) {
      const parts = text.split(askMatch);
      const query = parts.length > 1 ? parts[1].trim() : text;
      console.log("[VoiceControl] AI Query detected (prioritized):", query || text);
      handleNavigation("/ai-tutor", query || text);
    } else if (matched) {
      console.log("[VoiceControl] Navigation matched:", matched.path);
      handleNavigation(matched.path);
    } else if (text.length > 5) {
      // General fallthrough to AI Tutor if text is substantial
      console.log("[VoiceControl] Fallback to AI Tutor:", text);
      handleNavigation("/ai-tutor", text);
    } else {
      console.log("[VoiceControl] No command matched for:", text);
      resetToIdle();
    }
  }, [accessibilityMode, handleNavigation, resetToIdle]);

  // Start Active Listening (Shared for wake-word and manual button)
  const startListening = useCallback(() => {
    if (stateRef.current === "listening") {
      resetToIdle();
      return;
    }

    setState("listening");
    stateRef.current = "listening";
    console.log("[VoiceControl] Started listening mode");

    // Standard Feedback: Spoken Prompt for all users to confirm wake-word
    const msg = new SpeechSynthesisUtterance("Yes?");
    msg.rate = 1.1;
    window.speechSynthesis.speak(msg);

    // 30-Second Inactivity Timeout (extended for better user experience)
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (stateRef.current === "listening") {
        console.log("[VoiceControl] Listening timeout, returning to idle");
        resetToIdle();
      }
    }, 30000);
  }, [accessibilityMode, resetToIdle]);

  const toggleListening = useCallback(() => {
    if (stateRef.current === "listening") {
      resetToIdle();
    } else {
      startListening();
    }
  }, [startListening, resetToIdle]);

  useEffect(() => {
    if (isQuizRoute) return; // Do not init mic on quiz pages

    if (!SpeechRecognition || accessibilityMode === "Dumb") {
      setIsSupported(!!SpeechRecognition);
      return;
    }

    // Disable continuous wake-word if Low Power
    // const canListenPassively = !lowPowerMode;

    const reco = new SpeechRecognition();
    reco.continuous = true;
    reco.interimResults = true;

    const langMap: Record<string, string> = {
      "English": "en-US", "Hindi": "hi-IN", "Telugu": "te-IN", "Spanish": "es-ES", "French": "fr-FR"
    };
    reco.lang = langMap[voiceLanguage] || "en-US";

    reco.onresult = (event: any) => {
      let currentTranscript = "";
      let isFinal = false;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
        if (event.results[i].isFinal) isFinal = true;
      }

      const normalized = currentTranscript.toLowerCase().trim();
      if (!normalized) return;

      // Avoid double-processing the exact same final result (common SpeechRecognition jitter)
      if (isFinal) {
        if (normalized === lastFinalTranscriptRef.current) {
          console.log("[VoiceControl] Skipping duplicate final result");
          return;
        }
        lastFinalTranscriptRef.current = normalized;
      }

      console.log(`[VoiceControl] State: ${stateRef.current} | Final: ${isFinal} | Transcript: "${normalized}"`);

      // WAKE WORD DETECTION (Always active in idle)
      if (stateRef.current === "idle") {
        if (WAKE_WORDS.some(w => normalized.includes(w))) {
          console.log("[VoiceControl] Wake phrase detected!");
          
          window.speechSynthesis.cancel();
          startListening();
          
          // Only execute immediately if there's significant content after the wake word
          const instructionOnly = WAKE_WORDS.reduce((acc, word) => acc.replace(word, ""), normalized).trim();
          if (isFinal && instructionOnly.length > 2) {
            console.log("[VoiceControl] Executing immediate command:", instructionOnly);
            executeCommand(normalized);
          }
        }
      } else if (stateRef.current === "listening") {
        // Reset timeout on any speech activity
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          if (stateRef.current === "listening") {
            console.log("[VoiceControl] 30s timeout reached, resetting to idle");
            resetToIdle();
          }
        }, 30000);

        // Process final results
        if (isFinal) {
          const instructionOnly = WAKE_WORDS.reduce((acc, word) => acc.replace(word, ""), normalized).trim();
          if (instructionOnly.length > 0) {
            console.log("[VoiceControl] Final command received:", instructionOnly);
            executeCommand(normalized);
          }
        }
      }
    };

    reco.onerror = (event: any) => {
      console.error("[VoiceControl] Recognition error:", event.error);
    };

    reco.onend = () => {
      console.log("[VoiceControl] Recognition ended, restarting...");
      // Ensure microphone persists in idle/wake state unless manual override stops it
      // Only restart if the current ref still points to this instance
      if (!isQuizRoute && recognitionRef.current === reco) {
        setTimeout(() => {
          try { 
            if (recognitionRef.current === reco) {
              reco.start(); 
            }
          } catch (e) {
            console.log("[VoiceControl] Restart notice:", e);
          }
        }, 300);
      }
    };

    try {
      reco.start();
      console.log("[VoiceControl] Speech recognition started");
    } catch (e) {
      console.error("[VoiceControl] Failed to start recognition:", e);
    }
    
    recognitionRef.current = reco;

    return () => {
      console.log("[VoiceControl] Cleaning up recognition instance");
      recognitionRef.current = null;
      reco.stop();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [voiceLanguage, accessibilityMode, lowPowerMode, executeCommand, startListening, isQuizRoute]);

  // Hide microphone UI on quiz route to prevent interaction during exams
  if (isQuizRoute || !isSupported || accessibilityMode === "Dumb") return null;

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-9999">
      {/* Active Indicator & Status */}
      {state === "listening" && (
        <div className="bg-primary text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in fade-in zoom-in slide-in-from-bottom-2 duration-300 ring-4 ring-primary/20">
          <div className="flex gap-1.5 items-end h-6">
            <div className="w-1.5 bg-white rounded-full animate-[voice-bar_1s_infinite_ease-in-out]"></div>
            <div className="w-1.5 bg-white rounded-full animate-[voice-bar_1s_infinite_ease-in-out_0.2s]"></div>
            <div className="w-1.5 bg-white rounded-full animate-[voice-bar_1s_infinite_ease-in-out_0.4s]"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs uppercase tracking-tighter opacity-80">System Listening</span>
            <span className="text-sm font-medium">Say a command...</span>
          </div>
        </div>
      )}

      {state === "processing" && (
        <div className="bg-secondary text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in fade-in zoom-in slide-in-from-bottom-2 duration-300 ring-4 ring-secondary/20">
          <div className="flex gap-1 px-1">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs uppercase tracking-tighter opacity-80">System Working</span>
            <span className="text-sm font-medium">Processing command...</span>
          </div>
        </div>
      )}

      {/* Manual Microphone Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleListening}
          disabled={state === "processing"}
          className={`group flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-all duration-300 pointer-events-auto active:scale-90 ${
            state === "listening"
              ? "bg-red-500 hover:bg-red-600 scale-110"
              : state === "processing"
              ? "bg-amber-500 animate-pulse cursor-wait"
              : "bg-primary hover:bg-indigo-600 hover:shadow-primary/40"
          }`}
          title={state === "listening" ? "Stop Listening" : state === "processing" ? "Processing..." : "Manual Activation"}
        >
          {state === "listening" ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : state === "processing" ? (
            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
          )}
        </button>
      </div>

      <style>{`
        @keyframes voice-bar {
          0%, 100% { height: 8px; }
          50% { height: 20px; }
        }
      `}</style>
    </div>
  );
};

export default VoiceControl;
