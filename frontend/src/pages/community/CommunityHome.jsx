import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
  MessageSquare, Plus, HelpCircle, Clock, Filter,
  RefreshCw, WifiOff, ThumbsUp, Reply, Bookmark, Eye,
  CheckCircle2, Award, UserCheck, ChevronRight, Shield, Zap, Calendar, Laptop
} from "lucide-react";
import { useCommunity } from "../../context/CommunityContext";
import { useOffline } from "../../context/OfflineContext";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
import Card from "../../components/Card";

// Connect components
import DoubtConnectModal from "../../components/community/DoubtConnectModal";
import SessionConsole from "../../components/community/SessionConsole";
import TimetablePlanner from "../../components/community/TimetablePlanner";
import TeacherDashboard from "../../components/community/TeacherDashboard";

const socket = io("http://localhost:5000");

const CommunityHome = () => {
  const navigate = useNavigate();
  const { doubts, loading, refreshDoubts } = useCommunity();
  const { isOffline } = useOffline();
  const { auth, updateUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState(
    auth?.user?.role === "teacher" ? "teacher_portal" : "matcher"
  );
  
  useEffect(() => {
    setActiveTab(auth?.user?.role === "teacher" ? "teacher_portal" : "matcher");
  }, [auth?.user?.role]);

  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [activeSession, setActiveSession] = useState(null);

  const [activeFilter, setActiveFilter] = useState("All");
  const [activeSort, setActiveSort] = useState("Recent");

  const filters = ["All", "Mathematics", "Science", "English", "Social Studies", "Physics"];
  const sortOptions = ["Recent", "Solved", "Unanswered", "Most Helpful", "Teacher Answered"];

  // Register socket mappings
  useEffect(() => {
    if (auth?.user?.id) {
      socket.emit("register_user", { 
        userId: auth.user.id, 
        role: auth.user.role || "student" 
      });
    }
  }, [auth]);

  // Listen to match success events
  useEffect(() => {
    socket.on("match_success", (data) => {
      setActiveSession(data.session);
      setIsMatchModalOpen(false);
    });

    return () => {
      socket.off("match_success");
    };
  }, []);

  return (
    <div className="min-h-screen bg-app-bg py-10 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Active Session Overlay Console */}
      {activeSession && (
        <SessionConsole
          session={activeSession}
          socket={socket}
          auth={auth}
          onLeave={() => setActiveSession(null)}
        />
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Professional Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-app-border pb-8">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-primary text-white text-[10px] font-bold uppercase tracking-wider">
              Community Hub
            </div>
            <h1 className="text-3xl font-black text-app-text-main tracking-tight">Academic Ecosystem</h1>
            <p className="text-app-text-sub font-medium text-sm flex items-center gap-2">
              Instantly resolve doubts, construct smart schedules, and participate in peer discussions
              {isOffline && (
                <span className="flex items-center gap-1.5 text-orange-600 bg-orange-50/20 px-2 py-0.5 rounded border border-orange-100/35 font-bold text-[10px]">
                  <WifiOff size={10} />
                  OFFLINE
                </span>
              )}
            </p>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-[10px] font-black uppercase text-app-text-muted">
                Role Context: <span className="text-primary font-black uppercase">{auth?.user?.role}</span>
              </span>
              <button
                onClick={() => {
                  const newRole = auth?.user?.role === "teacher" ? "student" : "teacher";
                  updateUser({ role: newRole });
                }}
                className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] transition-all hover:scale-105 active:scale-95 shadow-sm">
                Switch Role to {auth?.user?.role === "teacher" ? "Student" : "Teacher"} (dev bypass)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-app-bg-alt border border-app-border p-1 rounded-2xl">
            {[
              { id: "matcher", label: "Doubt Connect", icon: Zap },
              { id: "peer_forum", label: "Peer Forum", icon: MessageSquare },
              { id: "timetable", label: "AI Timetable", icon: Calendar },
              { id: "teacher_portal", label: "Tutor Panel", icon: Laptop }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-sm shadow-primary/20"
                    : "text-app-text-sub hover:text-primary"
                }`}>
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content matcher */}
        {activeTab === "matcher" && (
          <div className="max-w-3xl mx-auto text-center py-16 space-y-8 animate-fade-in">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute w-24 h-24 bg-primary/10 rounded-full animate-ping" />
              <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/10">
                <Zap size={32} />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-black text-app-text-main tracking-tight uppercase">Instant Doubt Connect</h2>
              <p className="text-app-text-sub text-sm max-w-lg mx-auto font-medium leading-relaxed">
                Stuck on a tricky math equation or compiler error? Connect with a verified tutor immediately for a real-time call and synchronized canvas session.
              </p>
            </div>

            <Button
              onClick={() => setIsMatchModalOpen(true)}
              className="py-5 px-10 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-primary-hover transition-all hover:shadow-xl shadow-primary/25">
              Initialize Tutor Match
            </Button>

            <DoubtConnectModal
              isOpen={isMatchModalOpen}
              onClose={() => setIsMatchModalOpen(false)}
              socket={socket}
              auth={auth}
            />
          </div>
        )}

        {activeTab === "peer_forum" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            <div className="lg:col-span-8 space-y-6">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-app-text-muted" size={18} />
                <input
                  type="text"
                  placeholder="Search by topic, keyword, or problem statement..."
                  className="w-full bg-app-bg-alt border border-app-border rounded-xl pl-12 pr-4 py-4 text-app-text-main font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary/50 outline-none transition-all shadow-sm"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-5 py-2.5 rounded-lg border text-xs font-bold whitespace-nowrap transition-all ${
                      activeFilter === filter
                        ? "bg-primary/10 border-primary/20 text-primary shadow-sm"
                        : "bg-app-bg-alt border-app-border text-app-text-sub hover:border-primary/30"
                    }`}>
                    {filter}
                  </button>
                ))}
              </div>

              {/* Doubt feed */}
              {loading && doubts.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center space-y-6 bg-app-bg-alt rounded-3xl border border-app-border shadow-sm">
                  <div className="w-10 h-10 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                  <p className="text-app-text-muted font-bold uppercase tracking-widest text-[10px]">Loading feed...</p>
                </div>
              ) : doubts.length > 0 ? (
                <div className="grid grid-cols-1 gap-5">
                  {doubts.map((doubt) => (
                    <Card key={doubt.id} className="group overflow-hidden hover:border-primary/50 transition-all hover:shadow-md rounded-2xl">
                      <div className="p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <span className="px-2.5 py-1 rounded bg-app-bg text-app-text-sub text-[10px] font-bold border border-app-border uppercase">{doubt.subject}</span>
                            <span className="px-2.5 py-1 rounded bg-primary/10 text-primary text-[10px] font-bold border border-primary/20 uppercase">{doubt.topic || "General"}</span>
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-app-text-main group-hover:text-primary transition-colors mb-3">
                          {doubt.question}
                        </h3>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-app-border/40">
                          <span className="text-xs text-app-text-sub font-medium">Asked by {doubt.username}</span>
                          <Button
                            variant="primary"
                            onClick={() => navigate(`/community/discussion/${doubt.id}`)}
                            className="py-2 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold text-[10px] uppercase">
                            View Discussion
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-24 flex flex-col items-center justify-center space-y-6 bg-app-bg-alt rounded-3xl border border-app-border shadow-sm text-center px-10">
                  <div className="w-16 h-16 bg-app-bg rounded-full flex items-center justify-center text-app-text-muted">
                    <MessageSquare size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-app-text-main">No peer discussions yet</h3>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 bg-app-bg-alt p-6 rounded-2xl border border-app-border shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-app-text-main font-bold text-xs uppercase tracking-wider">
                <Filter size={14} className="text-primary" />
                Sort By
              </div>
              <div className="grid grid-cols-2 gap-2">
                {sortOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setActiveSort(option);
                      refreshDoubts({ filter: option.toLowerCase().replace(" ", "_") });
                    }}
                    className={`px-3 py-2 rounded-lg text-[10px] font-bold text-left transition-all ${
                      activeSort === option
                        ? "bg-primary text-white"
                        : "bg-app-bg text-app-text-sub hover:bg-app-bg-alt border border-app-border/30"
                    }`}>
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "timetable" && (
          <TimetablePlanner auth={auth} />
        )}

        {activeTab === "teacher_portal" && (
          <TeacherDashboard
            auth={auth}
            socket={socket}
            onJoinSession={(sess) => setActiveSession(sess)}
          />
        )}
      </div>
    </div>
  );
};

export default CommunityHome;