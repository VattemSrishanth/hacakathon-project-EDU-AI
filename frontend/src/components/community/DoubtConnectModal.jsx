import React, { useState, useEffect } from "react";
import { X, Radar, AlertCircle, Award, CheckCircle, Shield } from "lucide-react";
import Button from "../Button";

const DoubtConnectModal = ({ isOpen, onClose, socket, auth }) => {
  const [subject, setSubject] = useState("Mathematics");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("English");
  const [grade, setGrade] = useState("Class 10");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionText, setQuestionText] = useState("");
  const [matchStatus, setMatchStatus] = useState("idle"); // idle, matching, success, failed
  const [matchMessage, setMatchMessage] = useState("");

  const subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Social Studies", "Computer Science"];
  const languages = ["English", "Telugu", "Hindi", "Spanish", "French"];
  const grades = ["Class 9", "Class 10", "Class 11", "Class 12", "College Year 1", "College Year 2"];

  useEffect(() => {
    if (!socket) return;

    // Listen to matcher events
    socket.on("matching_status_update", (data) => {
      setMatchStatus("matching");
      setMatchMessage(data.message);
    });

    socket.on("match_failed", (data) => {
      setMatchStatus("failed");
      setMatchMessage(data.message);
    });

    return () => {
      socket.off("matching_status_update");
      socket.off("match_failed");
    };
  }, [socket]);

  const handleMatchRequest = (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    setMatchStatus("matching");
    setMatchMessage("Sending match request to the match engine...");

    socket.emit("start_doubt_match", {
      studentId: auth?.user?.id,
      subject,
      topic,
      language,
      grade,
      difficulty,
      questionText
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-app-bg border border-app-border rounded-[2.5rem] shadow-2xl p-8 overflow-hidden">
        {/* Subtle top decoration gradient line */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-primary" />

        {matchStatus === "idle" && (
          <>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
                  <Shield size={12} /> verified tutor connect
                </span>
                <h2 className="text-3xl font-black text-app-text-main mt-2 uppercase tracking-tight">Instant Doubt Match</h2>
                <p className="text-app-text-sub text-xs font-bold uppercase tracking-wider mt-1">Get connected to a verified educator in 30 seconds</p>
              </div>
              <button onClick={onClose} className="p-2 text-app-text-muted hover:text-primary rounded-full hover:bg-app-bg-alt transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleMatchRequest} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-app-text-muted uppercase tracking-widest ml-1">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3.5 bg-app-bg-alt border border-app-border rounded-2xl text-xs font-black text-app-text-main uppercase tracking-wider outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all">
                    {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-app-text-muted uppercase tracking-widest ml-1">Topic / Sub-topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Quadratic Equations"
                    className="w-full px-4 py-3.5 bg-app-bg-alt border border-app-border rounded-2xl text-xs font-bold text-app-text-main outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-app-text-muted uppercase tracking-widest ml-1">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-3.5 bg-app-bg-alt border border-app-border rounded-2xl text-xs font-black text-app-text-main uppercase tracking-wider outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all">
                    {languages.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-app-text-muted uppercase tracking-widest ml-1">Grade / Class Level</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-4 py-3.5 bg-app-bg-alt border border-app-border rounded-2xl text-xs font-black text-app-text-main uppercase tracking-wider outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all">
                    {grades.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-app-text-muted uppercase tracking-widest ml-1">Doubt Difficulty</label>
                <div className="flex gap-2">
                  {["Easy", "Medium", "Hard"].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all ${difficulty === lvl
                          ? "bg-primary border-primary text-white shadow-sm"
                          : "bg-app-bg-alt border-app-border text-app-text-sub hover:border-primary/30"
                        }`}>
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-app-text-muted uppercase tracking-widest ml-1">Explain your doubt / question</label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Paste or write your detailed doubt/problem statement here so the matched teacher can prepare..."
                  rows={4}
                  required
                  className="w-full px-5 py-4 bg-app-bg-alt border border-app-border rounded-3xl text-sm font-medium text-app-text-main outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all resize-none"
                />
              </div>

              <Button
                type="submit"
                className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-primary-hover transition-all hover:shadow-lg shadow-primary/10">
                Authorize Match Search
              </Button>
            </form>
          </>
        )}

        {matchStatus === "matching" && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-8">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-36 h-36 border-4 border-primary/10 rounded-full animate-ping" />
              <div className="absolute w-24 h-24 border-4 border-primary/20 rounded-full animate-pulse" />
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/10">
                <Radar size={32} className="animate-spin" />
              </div>
            </div>
            <div className="space-y-3 max-w-sm mx-auto">
              <h3 className="text-xl font-black text-app-text-main uppercase tracking-tight">Searching for Educators</h3>
              <p className="text-xs text-app-text-muted font-bold uppercase tracking-wider animate-pulse">{matchMessage}</p>
            </div>
            <button
              onClick={() => {
                socket.emit("cancel_match", { studentId: auth?.user?.id });
                setMatchStatus("idle");
              }}
              className="px-6 py-2.5 bg-app-bg hover:bg-app-bg-alt text-app-text-sub border border-app-border rounded-xl text-[10px] font-black uppercase tracking-wider transition-all">
              Cancel Request
            </button>
          </div>
        )}

        {matchStatus === "failed" && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-16 h-16 bg-error/10 border-2 border-error/20 text-error rounded-full flex items-center justify-center">
              <AlertCircle size={28} />
            </div>
            <div className="space-y-2 max-w-md">
              <h3 className="text-xl font-black text-app-text-main uppercase tracking-tight">No Educators Free</h3>
              <p className="text-sm text-app-text-sub font-medium px-4">{matchMessage}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setMatchStatus("idle")}
                className="px-8 py-3.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-primary-hover transition-all">
                Retry Match
              </button>
              <button
                onClick={onClose}
                className="px-8 py-3.5 bg-app-bg hover:bg-app-bg-alt text-app-text-sub border border-app-border rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-app-bg-alt transition-all">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoubtConnectModal;
