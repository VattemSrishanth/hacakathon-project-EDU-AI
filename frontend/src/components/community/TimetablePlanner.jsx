import React, { useState, useEffect } from "react";
import { Calendar, BookOpen, Clock, AlertCircle, Plus, Trash2, CheckCircle2 } from "lucide-react";
import Button from "../Button";
import Card from "../Card";

const TimetablePlanner = ({ auth }) => {
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("Semester 1");
  const [subjectInput, setSubjectInput] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeDay, setActiveDay] = useState("Monday");

  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const response = await fetch("http://localhost:4000/timetable/me", {
        headers: { Authorization: `Bearer ${auth?.token}` }
      });
      const data = await response.json();
      if (data.success && data.timetable) {
        setTimetable(data.timetable);
        setCollege(data.timetable.college);
        setBranch(data.timetable.branch);
        setSemester(data.timetable.semester);
        setSubjects(data.timetable.subjects || []);
      }
    } catch (err) {
      console.error("Failed to load timetable:", err);
    }
  };

  const handleAddSubject = () => {
    if (subjectInput.trim() && !subjects.includes(subjectInput.trim())) {
      setSubjects([...subjects, subjectInput.trim()]);
      setSubjectInput("");
    }
  };

  const handleRemoveSubject = (sub) => {
    setSubjects(subjects.filter((s) => s !== sub));
  };

  const generateAIPlan = async (e) => {
    e.preventDefault();
    if (!college || !branch || subjects.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/timetable/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth?.token}`
        },
        body: JSON.stringify({ college, branch, semester, subjects })
      });
      const data = await response.json();
      if (data.success) {
        setTimetable(data.timetable);
      }
    } catch (err) {
      console.error("AI Planner failure:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Profile Inputs */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 rounded-3xl shadow-sm">
            <h3 className="text-sm font-black text-app-text-main uppercase tracking-wider mb-4">Plan Parameters</h3>
            <form onSubmit={generateAIPlan} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-app-text-muted uppercase tracking-widest ml-1">College/Institution</label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. Stanford University"
                  required
                  className="w-full px-4 py-3 bg-app-bg-alt border border-app-border rounded-xl text-xs font-bold text-app-text-main outline-none focus:border-primary/50 transition-all mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-app-text-muted uppercase tracking-widest ml-1">Branch/Stream</label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. Computer Science"
                  required
                  className="w-full px-4 py-3 bg-app-bg-alt border border-app-border rounded-xl text-xs font-bold text-app-text-main outline-none focus:border-primary/50 transition-all mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-app-text-muted uppercase tracking-widest ml-1">Semester / Term</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-4 py-3 bg-app-bg-alt border border-app-border rounded-xl text-xs font-bold text-app-text-main outline-none focus:border-primary/50 transition-all mt-1">
                  {["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6"].map((sem) => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-app-text-muted uppercase tracking-widest ml-1">Subjects List</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                    placeholder="e.g. Machine Learning"
                    className="flex-1 px-4 py-3 bg-app-bg-alt border border-app-border rounded-xl text-xs font-bold text-app-text-main outline-none focus:border-primary/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubject}
                    className="p-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors">
                    <Plus size={16} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {subjects.map((sub) => (
                    <span key={sub} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase">
                      {sub}
                      <button type="button" onClick={() => handleRemoveSubject(sub)} className="text-primary/75 hover:text-primary">
                        <Trash2 size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || subjects.length === 0}
                className="w-full py-4 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary-hover transition-all shadow-sm">
                {loading ? "Synthesizing schedule..." : "Generate AI Planner"}
              </Button>
            </form>
          </Card>
        </div>

         {/* Schedule Display */}
        <div className="lg:col-span-8 space-y-6">
          {loading ? (
            <div className="bg-app-bg-alt border border-app-border rounded-3xl p-10 flex flex-col items-center justify-center space-y-6 text-center h-[400px]">
              <div className="w-12 h-12 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
              <p className="text-app-text-muted font-bold uppercase tracking-widest text-[10px]">Assembling Smart Planner...</p>
            </div>
          ) : timetable ? (
            <div className="space-y-6">
              {/* Day selection tabs */}
              <div className="flex bg-app-bg p-1 rounded-2xl overflow-x-auto no-scrollbar border border-app-border">
                {weekdays.map((day) => (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                      activeDay === day
                        ? "bg-primary text-white shadow-sm"
                        : "text-app-text-sub hover:text-primary"
                    }`}>
                    {day}
                  </button>
                ))}
              </div>

              {/* Day's slots */}
              <Card className="p-6 rounded-3xl shadow-sm">
                <h3 className="text-xs font-black text-app-text-main uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  {activeDay} Schedule
                </h3>
                <div className="space-y-4">
                  {!timetable.schedule[activeDay] || timetable.schedule[activeDay].length === 0 ? (
                    <p className="text-app-text-muted text-xs font-bold uppercase tracking-wider text-center py-6">Rest / Free Day</p>
                  ) : (
                    timetable.schedule[activeDay].map((slot, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-app-bg border border-app-border/40 hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary/10 text-primary rounded-xl">
                            <Clock size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-app-text-muted uppercase tracking-widest">{slot.time}</p>
                            <h4 className="text-sm font-black text-app-text-main uppercase mt-1 tracking-tight">{slot.subject}</h4>
                          </div>
                        </div>
                        <span className="px-3.5 py-1.5 bg-app-bg-alt text-app-text-sub border border-app-border/30 text-[10px] font-black uppercase rounded-lg">
                          {slot.activity}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Study Plan recommendations */}
              <Card className="p-6 rounded-3xl shadow-sm">
                <h3 className="text-xs font-black text-app-text-main uppercase tracking-wider mb-4 flex items-center gap-2">
                  <BookOpen size={16} className="text-primary" />
                  AI Study Plan Recommendations
                </h3>
                <div className="prose prose-slate max-w-none text-xs font-medium text-app-text-sub leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: timetable.studyPlan.replace(/\n/g, "<br/>") }} />
                </div>
              </Card>

              {/* Reminders List */}
              <Card className="p-6 rounded-3xl shadow-sm">
                <h3 className="text-xs font-black text-app-text-main uppercase tracking-wider mb-4 flex items-center gap-2">
                  <AlertCircle size={16} className="text-primary" />
                  Study & Revision Reminders
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(timetable.reminders || []).map((rem, index) => (
                    <div key={index} className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {rem.type.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-app-text-main uppercase tracking-tight">{rem.title}</h4>
                        <p className="text-[9px] text-app-text-muted font-bold uppercase mt-1">Due: {new Date(rem.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ) : (
            <div className="bg-app-bg-alt border border-app-border rounded-3xl p-10 flex flex-col items-center justify-center space-y-6 text-center h-[400px]">
              <div className="w-16 h-16 rounded-full bg-app-bg flex items-center justify-center text-app-text-muted animate-pulse">
                <Calendar size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-app-text-main">No Timetable Set</h3>
                <p className="text-app-text-muted text-xs mt-2 max-w-xs font-bold uppercase tracking-widest">Enter your study parameters on the left and let AI curate your perfect revision tracker.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimetablePlanner;
