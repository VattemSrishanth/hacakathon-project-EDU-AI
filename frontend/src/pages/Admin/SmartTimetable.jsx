import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  BookOpen,
  User,
  CheckSquare,
  AlertTriangle
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SmartTimetable = () => {
  const [formData, setFormData] = useState({
    college: 'Edu AI University College',
    department: 'Computer Science',
    semester: 'Semester 3',
    faculty: 'Dr. Jane Smith, Prof. Alan Turing',
    subjects: 'Data Structures, Discrete Mathematics, Computer Networks',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    holidayCalendar: '2026-12-25 (Christmas), 2026-11-26 (Thanksgiving)',
    examDates: '2026-10-15 (Midterm Exam), 2026-12-10 (Final Theory Exam)'
  });

  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(null);

  const handleToggleDay = (day) => {
    setFormData((prev) => {
      const workingDays = prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day];
      return { ...prev, workingDays };
    });
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const subs = formData.subjects.split(',').map((s) => s.trim()).filter(Boolean);
      const schedule = {};
      
      DAYS.forEach((day) => {
        if (formData.workingDays.includes(day)) {
          schedule[day] = [
            { time: '09:00 - 10:30', subject: subs[0] || 'Core Theory Lecture', activity: 'Classroom Lecture' },
            { time: '11:00 - 12:30', subject: subs[1] || 'Practice Problem Solving', activity: 'Practical Lab Session' },
            { time: '14:00 - 15:30', subject: subs[2] || 'Alternative Elective Seminar', activity: 'Interactive Session' }
          ];
        } else {
          schedule[day] = [];
        }
      });

      setGenerated({
        schedule,
        studyPlan: `### AI-Generated Revision Outline\n1. **Active Recall**: Spend 20 minutes daily reviewing formulas for *${subs[0] || 'Core Subject'}*.\n2. **Feynman Technique**: Explain discrete structures concepts aloud to clear mental blocks.\n3. **Mock Exam Prep**: Complete chapter quizzes for *${subs[1] || 'Secondary Subject'}* 3 days before exam dates.`,
        revisionSchedule: [
          { title: `Revise key chapters in ${subs[0] || 'Subject 1'}`, days: 2 },
          { title: `Write code blocks for ${subs[2] || 'Subject 3'}`, days: 5 },
          { title: `Solve past exam questions for ${subs[1] || 'Subject 2'}`, days: 9 }
        ],
        countdown: [
          { event: 'Midterm Exam - Data Structures', date: '2026-10-15', daysLeft: 73 },
          { event: 'Final Exam - Computer Networks', date: '2026-12-10', daysLeft: 129 }
        ]
      });
      setLoading(false);
    }, 1500); // simulate AI calculation
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-app-text-main">Smart AI Timetable</h1>
        <p className="text-app-text-sub mt-1 text-sm">Configure college calendars, exams, working calendars, faculty, and generate automated timetables.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Configuration Form */}
        <div className="bg-app-bg-alt border border-app-border p-5 rounded-xl shadow-sm space-y-4 h-fit">
          <h3 className="text-base font-bold text-primary flex items-center gap-1.5">
            <Calendar size={18} /> Schedule Configuration
          </h3>
          <form onSubmit={handleGenerate} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">College / Institution</label>
              <input
                type="text"
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Semester</label>
                <input
                  type="text"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Faculty (Dr/Prof names)</label>
              <input
                type="text"
                value={formData.faculty}
                onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Subjects (Comma separated)</label>
              <input
                type="text"
                value={formData.subjects}
                onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-app-text-sub uppercase mb-1.5">Working Days</label>
              <div className="flex flex-wrap gap-1.5">
                {DAYS.map((day) => {
                  const active = formData.workingDays.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => handleToggleDay(day)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors ${
                        active ? 'bg-primary text-white border-primary' : 'bg-white border-app-border hover:bg-gray-50 text-app-text-sub'
                      }`}>
                      {day.substring(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Holiday Dates (Calendar)</label>
              <input
                type="text"
                value={formData.holidayCalendar}
                onChange={(e) => setFormData({ ...formData, holidayCalendar: e.target.value })}
                className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
                placeholder="2026-10-02 (Gandhi Jayanti)"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Exam Calendar Dates</label>
              <input
                type="text"
                value={formData.examDates}
                onChange={(e) => setFormData({ ...formData, examDates: e.target.value })}
                className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
                placeholder="2026-12-15"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-extrabold py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50">
              <Sparkles size={16} /> {loading ? 'Generating...' : 'Auto-Generate AI Schedule'}
            </button>
          </form>
        </div>

        {/* Right Panel: AI Generation Output Display */}
        <div className="bg-app-bg-alt border border-app-border rounded-xl shadow-sm lg:col-span-2 overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-4 border-b border-app-border bg-gray-50 text-app-text-main font-bold text-sm">
            AI Generated Schedule Output
          </div>
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            {generated ? (
              <div className="space-y-6 animate-in fade-in">
                {/* 1. Weekly Grid Timetable */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-app-text-sub uppercase tracking-wider flex items-center gap-1">
                    <Clock size={14} /> Weekly Calendar Schedule
                  </h4>
                  <div className="border border-app-border rounded-lg overflow-hidden divide-y divide-app-border">
                    {Object.keys(generated.schedule).map((day) => {
                      const items = generated.schedule[day];
                      if (items.length === 0) return null;
                      return (
                        <div key={day} className="p-3 bg-white flex flex-col md:flex-row md:items-center justify-between text-xs gap-2">
                          <span className="font-extrabold text-primary w-24">{day}</span>
                          <div className="flex-1 space-y-2">
                            {items.map((slot, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-gray-50 border border-app-border rounded p-2">
                                <div>
                                  <span className="font-bold text-app-text-main block">{slot.subject}</span>
                                  <span className="text-[10px] text-app-text-muted">{slot.activity}</span>
                                </div>
                                <span className="text-primary font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded text-[10px]">{slot.time}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. AI study plan */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-app-text-sub uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={14} className="text-purple-600" /> AI Study & Revision Plan
                  </h4>
                  <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-lg text-xs space-y-2 text-purple-950">
                    <p className="font-semibold">Plan of Attack:</p>
                    <div className="whitespace-pre-line text-[11px] leading-relaxed">{generated.studyPlan}</div>
                  </div>
                </div>

                {/* 3. Revision schedules & exam countdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-app-text-sub uppercase tracking-wider flex items-center gap-1">
                      <CheckSquare size={14} className="text-emerald-600" /> Revision Schedule Checklists
                    </h4>
                    <div className="space-y-2">
                      {generated.revisionSchedule.map((rev, i) => (
                        <div key={i} className="p-2 border border-app-border rounded-lg bg-white flex items-center justify-between text-xs">
                          <span className="font-bold text-app-text-main">{rev.title}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-extrabold">In {rev.days} Days</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-app-text-sub uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle size={14} className="text-rose-600" /> Exam Countdown Timers
                    </h4>
                    <div className="space-y-2">
                      {generated.countdown.map((c, i) => (
                        <div key={i} className="p-2 border border-app-border rounded-lg bg-white flex items-center justify-between text-xs">
                          <span className="font-bold text-app-text-main truncate max-w-[150px]">{c.event}</span>
                          <span className="text-[10px] bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded font-extrabold">{c.daysLeft} Days Left</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-app-text-muted gap-2 py-12">
                <BookOpen size={48} className="opacity-40 text-primary" />
                <p className="text-sm font-semibold text-center max-w-sm">Select college parameters, faculty details, and click Generate to run the AI timetable dispatcher.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartTimetable;
