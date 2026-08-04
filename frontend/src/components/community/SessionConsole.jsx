import React, { useState, useEffect, useRef } from "react";
import { 
  Send, Video, VideoOff, Mic, MicOff, Monitor, PhoneOff, 
  Edit3, MessageSquare, Code, Image as ImageIcon, PlusCircle, AlertTriangle 
} from "lucide-react";
import { WebRTCConnection } from "../../utils/webRTC";
import { getDeviceFingerprint } from "../../utils/fingerprint";

const SessionConsole = ({ session, socket, auth, onLeave }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [activeTab, setActiveTab] = useState("chat"); // chat, whiteboard, code
  const [typingStatus, setTypingStatus] = useState("");

  // Whiteboard drawing states
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  // Code editor states
  const [codeContent, setCodeContent] = useState("// Collaborate on code snippets here...");

  // WebRTC States
  const [callActive, setCallActive] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const rtcRef = useRef(null);

  useEffect(() => {
    if (!socket || !session) return;

    const roomId = `session_${session._id}`;

    // Join room
    socket.emit("join_session", { sessionId: session._id });

    // Sync listeners
    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("message_blocked", (data) => {
      // Show warning in chat list
      setMessages((prev) => [
        ...prev,
        {
          senderId: "system",
          text: `MESSAGE BLOCKED: ${data.error}. Warning count: ${data.warningCount}/4`,
          isSystem: true
        }
      ]);
    });

    socket.on("typing", (data) => {
      if (data.isTyping) {
        setTypingStatus(`${data.username} is typing...`);
      } else {
        setTypingStatus("");
      }
    });

    socket.on("whiteboard_draw", (drawData) => {
      drawOnCanvas(drawData);
    });

    socket.on("code_update", (updatedCode) => {
      setCodeContent(updatedCode);
    });

    socket.on("session_ended", () => {
      alert("This session has been completed by the tutor.");
      onLeave();
    });

    // WebRTC Signaling
    socket.on("webrtc_signal", (signalData) => {
      if (rtcRef.current) {
        rtcRef.current.handleSignal(signalData);
      }
    });

    return () => {
      socket.off("receive_message");
      socket.off("message_blocked");
      socket.off("typing");
      socket.off("whiteboard_draw");
      socket.off("code_update");
      socket.off("session_ended");
      socket.off("webrtc_signal");
      if (rtcRef.current) {
        rtcRef.current.close();
      }
    };
  }, [socket, session]);

  // Send message helper
  const sendMessage = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    socket.emit("send_message", {
      sessionId: session._id,
      senderId: auth?.user?.id,
      text: inputText,
      fingerprint: getDeviceFingerprint()
    });

    setInputText("");
    socket.emit("typing", { sessionId: session._id, isTyping: false, username: auth?.user?.name });
  };

  const handleTyping = (e) => {
    setInputText(e.target.value);
    const isTyping = e.target.value.trim().length > 0;
    socket.emit("typing", { 
      sessionId: session._id, 
      isTyping, 
      username: auth?.user?.name 
    });
  };

  // Canvas drawing operations
  const drawOnCanvas = ({ x0, y0, x1, y1, color = "#000", lineWidth = 2 }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const handleMouseDown = (e) => {
    isDrawingRef.current = true;
    const rect = canvasRef.current.getBoundingClientRect();
    lastPosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseMove = (e) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const drawData = {
      x0: lastPosRef.current.x,
      y0: lastPosRef.current.y,
      x1: currentX,
      y1: currentY,
      color: "#4f46e5",
      lineWidth: 3
    };

    drawOnCanvas(drawData);
    socket.emit("whiteboard_draw", { sessionId: session._id, drawData });

    lastPosRef.current = { x: currentX, y: currentY };
  };

  const handleMouseUpOrLeave = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Code editor syncing
  const handleCodeChange = (e) => {
    setCodeContent(e.target.value);
    socket.emit("code_update", { sessionId: session._id, code: e.target.value });
  };

  // WebRTC Video calls
  const toggleCall = async () => {
    if (callActive) {
      if (rtcRef.current) rtcRef.current.close();
      setCallActive(false);
      setScreenSharing(false);
    } else {
      const rtc = new WebRTCConnection(
        session._id,
        (localStream) => {
          if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
        },
        (remoteStream) => {
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
        },
        (signal) => {
          socket.emit("webrtc_signal", { sessionId: session._id, signalData: signal });
        }
      );

      rtcRef.current = rtc;
      await rtc.initialize(videoEnabled, audioEnabled);
      setCallActive(true);
      
      // Student starts the SDP handshake offer
      if (auth?.user?.role === "student") {
        await rtc.startCall();
      }
    }
  };

  const toggleVideo = () => {
    const nextVal = !videoEnabled;
    setVideoEnabled(nextVal);
    if (rtcRef.current) rtcRef.current.toggleVideo(nextVal);
  };

  const toggleAudio = () => {
    const nextVal = !audioEnabled;
    setAudioEnabled(nextVal);
    if (rtcRef.current) rtcRef.current.toggleAudio(nextVal);
  };

  const handleShareScreen = async () => {
    if (!rtcRef.current) return;
    if (screenSharing) {
      setScreenSharing(false);
    } else {
      try {
        await rtcRef.current.shareScreen(() => {
          setScreenSharing(false);
        });
        setScreenSharing(true);
      } catch (err) {
        alert("Screen sharing cancelled or failed");
      }
    }
  };

  const handleEndSession = () => {
    if (window.confirm("Are you sure you want to end this doubt clearing session?")) {
      socket.emit("end_session", { sessionId: session._id });
      onLeave();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-app-bg flex flex-col font-sans">
      {/* Premium Session Header */}
      <header className="bg-app-bg-alt border-b border-app-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
            {session.subject.charAt(0)}
          </div>
          <div>
            <h1 className="text-md font-bold text-app-text-main flex items-center gap-2">
              {session.subject} Session
              <span className="px-2 py-0.5 rounded-full bg-success/15 text-success text-[9px] font-black uppercase border border-success/35">
                Connected
              </span>
            </h1>
            <p className="text-[10px] text-app-text-muted font-bold uppercase tracking-wider">
              Topic: {session.topic || "General"} | Grade: {session.grade}
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-app-bg p-1 rounded-xl border border-app-border">
          {[
            { id: "chat", label: "Chat Workspace", icon: MessageSquare },
            { id: "whiteboard", label: "Interactive Board", icon: Edit3 },
            { id: "code", label: "Code Pad", icon: Code }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-sm"
                  : "text-app-text-sub hover:text-primary"
              }`}>
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleEndSession}
          className="flex items-center gap-2 px-5 py-2.5 bg-error/10 hover:bg-error/15 border border-error/25 text-error rounded-xl text-xs font-bold transition-colors">
          <PhoneOff size={14} />
          End Session
        </button>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Interactive Panel */}
        <div className="flex-1 flex flex-col bg-app-bg relative p-6">
          {activeTab === "chat" && (
            <div className="flex-1 bg-app-bg-alt border border-app-border rounded-[2rem] shadow-sm flex flex-col overflow-hidden">
              {/* Message Feed */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-app-text-muted">
                    <MessageSquare size={48} className="mb-2" />
                    <p className="text-xs font-bold uppercase tracking-wider">Start the academic dialogue...</p>
                  </div>
                )}
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.isSystem 
                        ? "justify-center" 
                        : msg.senderId === auth?.user?.id 
                          ? "justify-end" 
                          : "justify-start"
                    }`}>
                    {msg.isSystem ? (
                      <div className="bg-warning/10 border border-warning/20 text-warning px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                        <AlertTriangle size={14} />
                        {msg.text}
                      </div>
                    ) : (
                      <div
                        className={`max-w-[70%] rounded-[1.5rem] px-5 py-3.5 text-sm ${
                          msg.senderId === auth?.user?.id
                            ? "bg-primary text-white rounded-tr-sm"
                            : "bg-app-bg text-app-text-main rounded-tl-sm"
                        }`}>
                        <p className="font-medium leading-relaxed">{msg.text}</p>
                        <span className="block text-[9px] mt-1 text-right opacity-60">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Typing indicator */}
              {typingStatus && (
                <div className="px-6 py-2 text-[10px] text-app-text-muted font-bold italic animate-pulse">
                  {typingStatus}
                </div>
              )}

              {/* Input box */}
              <form onSubmit={sendMessage} className="p-4 border-t border-app-border/40 bg-app-bg-alt flex gap-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={handleTyping}
                  placeholder="Type an educational query..."
                  className="flex-1 px-5 py-4 bg-app-bg border border-app-border rounded-2xl text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-medium text-app-text-main"
                />
                <button
                  type="submit"
                  className="p-4 bg-primary text-white rounded-2xl hover:bg-primary-hover transition-colors shadow-sm shadow-primary/10">
                  <Send size={18} />
                </button>
              </form>
            </div>
          )}

          {activeTab === "whiteboard" && (
            <div className="flex-1 bg-app-bg border border-app-border rounded-[2rem] shadow-sm flex flex-col overflow-hidden relative">
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <button
                  onClick={clearCanvas}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-primary-hover transition-colors shadow-sm">
                  Clear Board
                </button>
              </div>
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                className="flex-1 cursor-crosshair"
              />
            </div>
          )}

          {activeTab === "code" && (
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-[2rem] shadow-sm flex flex-col overflow-hidden p-6">
              <textarea
                value={codeContent}
                onChange={handleCodeChange}
                placeholder="// Write code here to review..."
                className="flex-1 w-full bg-slate-900 text-emerald-400 font-mono text-sm border-none outline-none resize-none"
              />
            </div>
          )}
        </div>

        {/* Right Call & Media Panel */}
        <div className="w-[22rem] border-l border-app-border bg-app-bg-alt p-6 flex flex-col gap-6 overflow-y-auto">
          <div>
            <h2 className="text-xs font-black text-app-text-sub uppercase tracking-widest mb-4">Voice & Video Feed</h2>
            
            {/* Audio/Video streams */}
            <div className="grid grid-cols-1 gap-4">
              <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-app-border shadow-sm flex items-center justify-center">
                <video ref={localVideoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
                <span className="absolute bottom-3 left-3 bg-slate-900/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] text-white font-black uppercase tracking-widest">
                  You ({auth?.user?.role})
                </span>
                {!localVideoRef.current?.srcObject && (
                  <span className="text-[10px] font-black text-app-text-muted uppercase tracking-wider z-10">Camera Idle</span>
                )}
              </div>

              <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-app-border shadow-sm flex items-center justify-center">
                <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
                <span className="absolute bottom-3 left-3 bg-slate-900/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] text-white font-black uppercase tracking-widest">
                  Remote Participant
                </span>
                {!remoteVideoRef.current?.srcObject && (
                  <span className="text-[10px] font-black text-app-text-muted uppercase tracking-wider z-10">Waiting Connection</span>
                )}
              </div>
            </div>
          </div>

          {/* Call actions */}
          <div className="space-y-4">
            <button
              onClick={toggleCall}
              className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-md ${
                callActive
                  ? "bg-error text-white shadow-rose-200"
                  : "bg-primary text-white shadow-primary/10 hover:bg-primary-hover"
              }`}>
              <Video size={16} />
              {callActive ? "Disconnect Call" : "Connect Voice & Video"}
            </button>

            {callActive && (
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={toggleVideo}
                  className={`py-3.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-colors flex flex-col items-center justify-center gap-1 ${
                    videoEnabled ? "bg-app-bg border-app-border text-app-text-sub" : "bg-error/10 border-error/25 text-error"
                  }`}>
                  {videoEnabled ? <Video size={14} /> : <VideoOff size={14} />}
                  Video
                </button>

                <button
                  onClick={toggleAudio}
                  className={`py-3.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-colors flex flex-col items-center justify-center gap-1 ${
                    audioEnabled ? "bg-app-bg border-app-border text-app-text-sub" : "bg-error/10 border-error/25 text-error"
                  }`}>
                  {audioEnabled ? <Mic size={14} /> : <MicOff size={14} />}
                  Mute
                </button>

                <button
                  onClick={handleShareScreen}
                  className={`py-3.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-colors flex flex-col items-center justify-center gap-1 ${
                    screenSharing ? "bg-primary/10 border-primary/20 text-primary" : "bg-app-bg border-app-border text-app-text-sub"
                  }`}>
                  <Monitor size={14} />
                  Screen
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionConsole;
