import React, { useState, useEffect } from "react";
import { Shield, ToggleLeft, ToggleRight, AlertCircle, Clock, Award, Star } from "lucide-react";
import Button from "../Button";
import Card from "../Card";

const TeacherDashboard = ({ auth, socket, onJoinSession }) => {
  const [profile, setProfile] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isFree, setIsFree] = useState(true);
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [countdown, setCountdown] = useState(30);
  const [history, setHistory] = useState([]);
  const [applying, setApplying] = useState(false);

  // Application inputs
  const [subjects, setSubjects] = useState("");
  const [languages, setLanguages] = useState("");
  const [experience, setExperience] = useState("1");
  const [degreeUrl, setDegreeUrl] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    fetchProfile();
    fetchHistory();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("incoming_doubt_request", (data) => {
      setIncomingRequest(data.session);
      setCountdown(30);
    });

    socket.on("request_timeout", () => {
      setIncomingRequest(null);
    });

    return () => {
      socket.off("incoming_doubt_request");
      socket.off("request_timeout");
    };
  }, [socket]);

  // Countdown timer logic
  useEffect(() => {
    if (!incomingRequest) return;
    if (countdown === 0) {
      handleDecline();
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [incomingRequest, countdown]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("http://localhost:5000/verification/status", {
        headers: { Authorization: `Bearer ${auth?.token}` }
      });
      const data = await response.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        setIsOnline(data.profile.isOnline);
        setIsFree(data.profile.isFree);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch("http://localhost:5000/doubt/history", {
        headers: { Authorization: `Bearer ${auth?.token}` }
      });
      const data = await response.json();
      if (data.success) {
        setHistory(data.history);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  };

  const handleToggleOnline = () => {
    const nextVal = !isOnline;
    setIsOnline(nextVal);
    socket.emit("register_user", { userId: auth?.user?.id, role: "teacher" });
  };

  const handleToggleFree = () => {
    const nextVal = !isFree;
    setIsFree(nextVal);
    socket.emit("toggle_availability", { userId: auth?.user?.id, isFree: nextVal });
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);

    try {
      const response = await fetch("http://localhost:5000/verification/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth?.token}`
        },
        body: JSON.stringify({
          degreeUrl,
          subjects: subjects.split(",").map((s) => s.trim()),
          languages: languages.split(",").map((l) => l.trim()),
          phone,
          experience: Number(experience)
        })
      });
      const data = await response.json();
      if (data.success) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error("Apply verification fail:", err);
    } finally {
      setApplying(false);
    }
  };

  const handleAccept = () => {
    if (!incomingRequest) return;
    socket.emit("accept_doubt_request", {
      sessionId: incomingRequest._id,
      teacherId: auth?.user?.id
    });
    onJoinSession(incomingRequest);
    setIncomingRequest(null);
  };

  const handleDecline = () => {
    if (!incomingRequest) return;
    socket.emit("decline_doubt_request", {
      sessionId: incomingRequest._id,
      teacherId: auth?.user?.id
    });
    setIncomingRequest(null);
  };

  // Rendering verification portal if not verified
  if (!profile || profile.verificationStatus !== "verified") {
    return (
      <div className="max-w-xl mx-auto py-10 animate-fade-in">
        <Card className="p-8 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-warning/10 text-warning flex items-center justify-center">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-app-text-main uppercase tracking-tight">Tutor Verification Portal</h2>
              <p className="text-xs text-app-text-muted font-bold uppercase tracking-wider mt-1">Verify your credentials to clear doubts</p>
            </div>
          </div>

          <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Dev Assistant</h4>
              <p className="text-[9px] text-app-text-muted font-bold uppercase mt-0.5">Instantly activate this account as a verified teacher</p>
            </div>
            <button
              onClick={async () => {
                try {
                  const res = await fetch("http://localhost:5000/verification/dev-verify", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${auth?.token}`
                    }
                  });
                  const data = await res.json();
                  if (data.success) {
                    alert("Account verified as Teacher successfully!");
                    fetchProfile();
                  } else {
                    alert("Bypass failed: " + (data.error || "Unknown error"));
                  }
                } catch (e) {
                  alert("Bypass failed: " + e.message);
                }
              }}
              className="px-4 py-2 bg-primary text-white text-[9px] font-black uppercase tracking-wider rounded-xl transition-all hover:scale-105 shadow-sm shadow-primary/10">
              Bypass: Verify Account
            </button>
          </div>

          {profile?.verificationStatus === "pending" ? (
            <div className="bg-warning/10 border border-warning/25 text-warning p-6 rounded-2xl space-y-2">
              <h4 className="text-sm font-black uppercase tracking-tight">Verification Application Pending</h4>
              <p className="text-xs leading-relaxed font-medium">An administrator is currently reviewing your academic degrees and background. We will activate your online matching portal immediately upon manual approval.</p>
            </div>
          ) : (
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-app-text-muted uppercase tracking-widest ml-1">Subjects (comma separated)</label>
                <input
                  type="text"
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  placeholder="e.g. Mathematics, Physics"
                  required
                  className="w-full px-4 py-3 bg-app-bg border border-app-border rounded-xl text-xs font-bold text-app-text-main outline-none focus:border-primary/50 mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-app-text-muted uppercase tracking-widest ml-1">Languages (comma separated)</label>
                <input
                  type="text"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  placeholder="e.g. English, Telugu"
                  required
                  className="w-full px-4 py-3 bg-app-bg border border-app-border rounded-xl text-xs font-bold text-app-text-main outline-none focus:border-primary/50 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-app-text-muted uppercase tracking-widest ml-1">Years Experience</label>
                  <input
                    type="number"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    min="1"
                    required
                    className="w-full px-4 py-3 bg-app-bg border border-app-border rounded-xl text-xs font-bold text-app-text-main outline-none focus:border-primary/50 mt-1"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-app-text-muted uppercase tracking-widest ml-1">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 9999999999"
                    required
                    className="w-full px-4 py-3 bg-app-bg border border-app-border rounded-xl text-xs font-bold text-app-text-main outline-none focus:border-primary/50 mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-app-text-muted uppercase tracking-widest ml-1">Degree Certificate URL</label>
                <input
                  type="url"
                  value={degreeUrl}
                  onChange={(e) => setDegreeUrl(e.target.value)}
                  placeholder="e.g. https://drive.google.com/myfile"
                  required
                  className="w-full px-4 py-3 bg-app-bg border border-app-border rounded-xl text-xs font-bold text-app-text-main outline-none focus:border-primary/50 mt-1"
                />
              </div>

              <Button
                type="submit"
                disabled={applying}
                className="w-full py-4 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary-hover transition-all shadow-sm">
                {applying ? "Submitting application..." : "Apply For Verification"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Toggle Controls */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-xs font-black text-app-text-main uppercase tracking-wider mb-4">Availability Dashboard</h3>
            
            <div className="flex items-center justify-between p-3.5 bg-app-bg border border-app-border/40 rounded-2xl">
              <div>
                <h4 className="text-xs font-black text-app-text-main uppercase tracking-tight">Active Online Matching</h4>
                <p className="text-[9px] text-app-text-muted font-bold uppercase mt-0.5">Toggle to appear in search</p>
              </div>
              <button onClick={handleToggleOnline} className="text-primary">
                {isOnline ? <ToggleRight size={36} /> : <ToggleLeft size={36} className="text-app-text-muted" />}
              </button>
            </div>

            {isOnline && (
              <div className="flex items-center justify-between p-3.5 bg-app-bg border border-app-border/40 rounded-2xl">
                <div>
                  <h4 className="text-xs font-black text-app-text-main uppercase tracking-tight">Status Availability</h4>
                  <p className="text-[9px] text-app-text-muted font-bold uppercase mt-0.5">{isFree ? "Free to receive sessions" : "Currently busy"}</p>
                </div>
                <button onClick={handleToggleFree} className="text-primary">
                  {isFree ? <ToggleRight size={36} /> : <ToggleLeft size={36} className="text-app-text-muted" />}
                </button>
              </div>
            )}

            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-3">
              <Award className="text-primary" size={24} />
              <div>
                <h4 className="text-xs font-black text-app-text-main uppercase tracking-tight">Verified Educator Profile</h4>
                <p className="text-[9px] text-app-text-muted font-bold uppercase mt-0.5">Avg Rating: {profile.rating} ★</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Panel: Requests and Session History */}
        <div className="lg:col-span-8 space-y-6">
          {incomingRequest ? (
            <Card className="bg-gradient-to-br from-primary to-primary-hover text-white p-8 rounded-3xl shadow-xl shadow-primary/20 flex flex-col justify-between h-[300px] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                <Clock size={160} />
              </div>
              
              <div className="space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[9px] font-black uppercase tracking-wider">
                  Incoming Match Request ({countdown}s)
                </span>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">{incomingRequest.subject} Doubt</h3>
                  <p className="text-white/80 text-xs font-bold uppercase tracking-wider mt-1">Topic: {incomingRequest.topic || "General"} | Grade: {incomingRequest.grade}</p>
                </div>
                <p className="text-sm font-medium leading-relaxed italic text-white/90 max-w-xl">
                  "{incomingRequest.questionText}"
                </p>
              </div>

              <div className="flex gap-4 z-10">
                <button
                  onClick={handleAccept}
                  className="flex-1 py-4 bg-white text-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-app-bg-alt transition-colors shadow-sm">
                  Accept Session
                </button>
                <button
                  onClick={handleDecline}
                  className="px-8 py-4 bg-primary/30 hover:bg-primary/40 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-colors border border-primary/50">
                  Decline
                </button>
              </div>
            </Card>
          ) : (
            <Card className="p-6 rounded-3xl shadow-sm">
              <h3 className="text-xs font-black text-app-text-main uppercase tracking-wider mb-6">Recent Connected Sessions</h3>
              <div className="space-y-4">
                {history.length === 0 ? (
                  <p className="text-app-text-muted text-xs font-bold uppercase tracking-wider text-center py-6">No session history yet</p>
                ) : (
                  history.map((sess) => (
                    <div key={sess._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-app-bg border border-app-border/40 hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-app-bg-alt flex items-center justify-center text-app-text-sub border border-app-border/30 font-black text-sm">
                          {sess.subject.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-app-text-main uppercase tracking-tight">{sess.subject}</h4>
                          <p className="text-[9px] text-app-text-muted font-bold uppercase mt-1">
                            Student: {sess.studentId?.name || "Anonymous"} | {new Date(sess.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {sess.rating ? (
                          <span className="flex items-center gap-1 px-3 py-1.5 bg-warning/10 text-warning border border-warning/20 text-[10px] font-black uppercase rounded-lg">
                            <Star size={12} className="fill-current" />
                            {sess.rating} / 5
                          </span>
                        ) : (
                          <span className="px-3.5 py-1.5 bg-app-bg-alt text-app-text-sub border border-app-border/30 text-[10px] font-black uppercase rounded-lg">
                            {sess.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
