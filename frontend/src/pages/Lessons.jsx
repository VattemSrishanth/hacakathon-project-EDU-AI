import { useState, useEffect, useMemo } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { syllabusAPI, lessonGeneratorAPI } from '../services/api';
import { offlineContentService } from '../services/offlineContent';

import {
  BookOpen,
  ArrowLeft,
  Layout,
  Sparkles,
  Info,
  Globe
} from 'lucide-react';

// Modular Components
import ClassList from '../components/Syllabus/ClassList';
import SubjectList from '../components/Syllabus/SubjectList';
import UnitAccordion from '../components/Syllabus/UnitAccordion';
import LessonViewer from '../components/Syllabus/LessonViewer';

// Vector 3D Isometric Illustration matching reference design
const LessonsHeroIllustration = () => (
  <svg
    viewBox="0 0 440 260"
    className="w-full h-full select-none drop-shadow-md"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="lessons-bg-glow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#DBEAFE" stopOpacity="0.5" />
        <stop offset="50%" stopColor="#E0E7FF" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#F3E8FF" stopOpacity="0.25" />
      </linearGradient>
    </defs>

    {/* Background Soft Glow Pill */}
    <rect x="20" y="20" width="400" height="220" rx="48" fill="url(#lessons-bg-glow)" />

    {/* Curved Dotted Trajectory Arc */}
    <path
      d="M 50 160 C 130 50, 270 30, 390 100"
      stroke="#93C5FD"
      strokeWidth="2"
      strokeDasharray="6 6"
      strokeLinecap="round"
      fill="none"
      opacity="0.85"
    />

    {/* Sparkles */}
    <path d="M 140 48 L 142 54 L 148 56 L 142 58 L 140 64 L 138 58 L 132 56 L 138 54 Z" fill="#38BDF8" opacity="0.9" />
    <path d="M 330 36 L 331.5 41 L 337 42.5 L 331.5 44 L 330 49 L 328.5 44 L 323 42.5 L 328.5 41 Z" fill="#60A5FA" opacity="0.85" />
    <path d="M 395 160 L 396.5 164 L 401 165.5 L 396.5 167 L 395 171 L 393.5 167 L 389 165.5 L 393.5 164 Z" fill="#818CF8" opacity="0.8" />
    <circle cx="65" cy="75" r="1.5" fill="#38BDF8" opacity="0.7" />
    <circle cx="360" cy="180" r="2" fill="#818CF8" opacity="0.6" />

    {/* Floating 3D Open Book on Left */}
    <g transform="translate(0, 5)">
      {/* Cover Base */}
      <path d="M 40 105 L 40 118 Q 80 133 120 118 L 120 105 Q 80 120 40 105 Z" fill="#0284C7" />
      {/* Left Page */}
      <path d="M 80 88 C 65 83, 48 87, 40 98 L 40 114 C 48 103, 65 99, 80 104 Z" fill="#FFFFFF" />
      {/* Right Page */}
      <path d="M 80 88 C 95 83, 112 87, 120 98 L 120 114 C 112 103, 95 99, 80 104 Z" fill="#F8FAFC" />
      {/* Page Text Indicator Lines */}
      <line x1="48" y1="99" x2="72" y2="94" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="48" y1="104" x2="68" y2="100" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="88" y1="94" x2="112" y2="99" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="88" y1="100" x2="108" y2="104" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
    </g>

    {/* Floating 3D Cube / Block on Lower Left */}
    <g transform="translate(0, 0)">
      <polygon points="80,172 100,162 120,172 100,182" fill="#38BDF8" />
      <polygon points="80,172 100,182 100,207 80,197" fill="#0284C7" />
      <polygon points="100,182 120,172 120,197 100,207" fill="#0369A1" />
    </g>

    {/* Center Stack of 3 Isometric Books */}
    <g transform="translate(0, 0)">
      {/* Bottom Book (Purple) */}
      <polygon points="170,188 170,210 265,246 265,224" fill="#6D28D9" />
      <polygon points="170,188 265,224 375,180 280,144" fill="#7C3AED" />
      <polygon points="265,224 265,246 375,202 375,180" fill="#FDF4FF" />
      <line x1="268" y1="230" x2="372" y2="186" stroke="#C084FC" strokeWidth="1.2" opacity="0.7" />
      <line x1="268" y1="236" x2="372" y2="192" stroke="#C084FC" strokeWidth="1.2" opacity="0.7" />
      <line x1="268" y1="242" x2="372" y2="198" stroke="#C084FC" strokeWidth="1.2" opacity="0.7" />

      {/* Middle Book (Royal Blue) */}
      <polygon points="180,162 180,184 265,216 265,194" fill="#1D4ED8" />
      <polygon points="180,162 265,194 365,154 280,122" fill="#2563EB" />
      <polygon points="265,194 265,216 365,176 365,154" fill="#FFFFFF" />
      <line x1="268" y1="201" x2="362" y2="161" stroke="#93C5FD" strokeWidth="1.2" opacity="0.7" />
      <line x1="268" y1="207" x2="362" y2="167" stroke="#93C5FD" strokeWidth="1.2" opacity="0.7" />

      {/* Top Book (Sky Blue / Cyan) */}
      <polygon points="195,136 195,156 265,182 265,162" fill="#0284C7" />
      <polygon points="195,136 265,162 355,126 285,100" fill="#38BDF8" />
      <polygon points="265,162 265,182 355,146 355,126" fill="#F0F9FF" />
      <line x1="268" y1="168" x2="352" y2="132" stroke="#BAE6FD" strokeWidth="1.2" opacity="0.7" />

      {/* Mortarboard Cap Skull Base */}
      <path d="M 238 98 C 238 98 238 118 270 122 C 302 118 302 98 302 98 Z" fill="#0F172A" />

      {/* Mortarboard Diamond Top */}
      <polygon points="270,52 342,80 270,108 198,80" fill="#1E293B" />
      <polygon points="270,52 342,80 270,83 198,80" fill="#334155" opacity="0.6" />

      {/* Gold Center Button on Cap */}
      <ellipse cx="270" cy="80" rx="4.5" ry="2.8" fill="#FBBF24" />

      {/* Gold Tassel String & Hanging Tassel */}
      <path d="M 270 80 Q 312 84 326 108" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="326" cy="110" r="3" fill="#FBBF24" />
      <polygon points="323,113 329,113 331,130 321,130" fill="#F59E0B" />
    </g>

    {/* Floating 3D Document on Right */}
    <g transform="translate(365, 55) rotate(10)">
      <polygon points="0,0 28,0 38,10 38,48 0,48" fill="#FFFFFF" />
      <polygon points="28,0 38,10 28,10" fill="#93C5FD" />
      <line x1="6" y1="12" x2="22" y2="12" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="18" x2="30" y2="18" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="24" x2="26" y2="24" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="30" x2="18" y2="30" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>
);

const Lessons = () => {
  const { settings } = useSettings();
  const { auth } = useAuth();
  const { progress, markLessonCompleted, startLessonTimer, stopLessonTimer } = useProgress();

  const [activeSyllabus, setActiveSyllabus] = useState({
    board: settings.learning.board,
    classes: {}
  });
  const [syllabusLoading, setSyllabusLoading] = useState(true);

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [topicPdf, setTopicPdf] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const fetchSyllabus = async () => {
      setSyllabusLoading(true);
      try {
        const res = await syllabusAPI.getBoard(settings.learning.board);
        if (res.success && res.syllabus) {
          setActiveSyllabus(res.syllabus);
        } else {
          setActiveSyllabus({ board: settings.learning.board, classes: {} });
        }
      } catch (e) {
        setActiveSyllabus({ board: settings.learning.board, classes: {} });
      } finally {
        setSyllabusLoading(false);
      }
    };
    fetchSyllabus();
  }, [settings.learning.board]);

  // Derived: check completion from central context
  const completedLessons = useMemo(() => progress.lessonsCompleted, [progress.lessonsCompleted]);

  // Reset selection if board changes
  useEffect(() => {
    setSelectedClass(null);
    setSelectedSubject(null);
    setSelectedUnit(null);
    setSelectedTopic(null);
    setExplanation(null);
  }, [settings.learning.board]);

  const handleMarkComplete = async () => {
    if (!selectedTopic) return;
    const lessonId = `${selectedClass}-${selectedSubject}-${selectedTopic}`;

    // Use central context
    markLessonCompleted(lessonId, `Completed: ${selectedTopic} (${selectedSubject})`);
  };

  // Timer: Start when topic is selected, stop on exit or change
  useEffect(() => {
    if (selectedTopic) {
      startLessonTimer(selectedTopic);
      return () => stopLessonTimer(selectedTopic);
    }
  }, [selectedTopic, startLessonTimer, stopLessonTimer]);

  // Reset logic
  const resetToClass = () => {
    setSelectedClass(null);
    setSelectedSubject(null);
    setSelectedTopic(null);
    setExplanation(null);
  };

  const resetToSubject = () => {
    setSelectedSubject(null);
    setSelectedTopic(null);
    setExplanation(null);
  };

  // Generate AI Explanation
  useEffect(() => {
    if (selectedTopic && selectedClass && selectedSubject) {
      handleExplain('detailed');
    }
  }, [selectedTopic, selectedClass, selectedSubject]);

  const handleExplain = async (mode = 'detailed') => {
    if (!selectedTopic || !selectedSubject || !selectedClass) return;
    setGenerating(true);
    setTopicPdf(null);

    try {
      // 0. Check Offline Storage first
      const lessonId = `${selectedClass}-${selectedSubject}-${selectedTopic}`;
      let offlineLesson = null;
      if (auth?.user?.id) {
        offlineLesson = await offlineContentService.getLesson(String(auth.user.id), lessonId);
      }

      if (offlineLesson) {
        setExplanation(offlineLesson.content.content);
        setGenerating(false);
        return;
      }

      // 1. Check if admin has provided custom content for this topic
      const customContentRes = await syllabusAPI.getContent(
        settings.learning.board,
        selectedClass,
        selectedSubject,
        selectedTopic
      );

      if (customContentRes.success && customContentRes.content) {
        setExplanation(customContentRes.content.description);
        if (customContentRes.content.pdf_data_url) {
          setTopicPdf(customContentRes.content.pdf_data_url);
        }
        setGenerating(false);
        return;
      }

      // 2. Fallback to AI generation
      const res = await lessonGeneratorAPI.generate({
        topic: selectedTopic,
        subject: selectedSubject,
        unit: selectedUnit || undefined,
        grade: selectedClass,
        mode,
        language: settings.learning.language
      });

      if (res?.success && res?.explanation) {
        setExplanation(res.explanation);
      } else {
        setExplanation('Unable to generate content right now. Please try again.');
      }
    } catch (e) {
      console.error('Lesson generation failed', e);
      setExplanation('Unable to generate content right now. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleTranslate = () => {
    setGenerating(true);
    setTimeout(() => {
      setExplanation(`[Translated to ${settings.learning.language}] \n\n${explanation}`);
      setGenerating(false);
    }, 800);
  };

  const handleListen = () => {
    if (!explanation) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(explanation);
    const langMap = {
      'English': 'en-US',
      'Hindi': 'hi-IN',
      'Telugu': 'te-IN'
    };
    utterance.lang = langMap[settings.learning.language] || 'en-US';
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const currentSubjects = selectedClass ? activeSyllabus.classes[selectedClass]?.subjects || {} : {};
  const subjectsList = Object.keys(currentSubjects);
  const currentUnits = selectedClass && selectedSubject ? currentSubjects[selectedSubject] || [] : [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10 pb-16 transition-colors duration-300">
      
      {/* Header Section matching reference */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-2">
        <div className="space-y-4 max-w-xl">
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider border border-blue-200/80 dark:border-blue-900/60 shadow-xs">
              <Sparkles size={13} className="text-blue-500 fill-blue-500/20" />
              AI-Powered Learning
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-200/80 dark:border-emerald-900/60 shadow-xs">
              <Globe size={13} className="text-emerald-500" />
              {settings.learning.board} Syllabus
            </span>
          </div>

          {/* Stylized Lessons Heading */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight leading-none italic select-none">
            <span className="text-slate-900 dark:text-white">LESS</span>
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">ONS</span>
          </h1>

          {/* Subtitle & Description */}
          <div className="space-y-1.5">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Full Grades 1–10 Digital Syllabus Hub
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed font-normal">
              Explore all lessons and topics organized by grade. Learn at your own pace with structured, high-quality content.
            </p>
          </div>
        </div>

        {/* Right: 3D Illustration Graphic */}
        <div className="flex items-center justify-center lg:justify-end">
          <div className="w-full max-w-sm sm:max-w-md h-56 sm:h-64 flex items-center justify-center">
            <LessonsHeroIllustration />
          </div>
        </div>
      </div>

      {/* Selected Class Bar / Back button */}
      {selectedClass && (
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
          <button
            onClick={resetToClass}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 font-bold text-xs shadow-xs hover:shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Change Class (Class {selectedClass})</span>
          </button>
        </div>
      )}

      {/* Dynamic Content Area */}
      {!selectedClass ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Centered Section Heading */}
          <div className="text-center space-y-1 pt-2">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
              <span className="text-slate-900 dark:text-white">SELECT </span>
              <span className="text-blue-600 dark:text-blue-400">YOUR </span>
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">GRADE</span>
            </h2>
            <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400">
              Choose a class to explore the full curriculum
            </p>
          </div>

          {syllabusLoading && (
            <div className="text-center text-slate-400 font-semibold text-xs py-4">
              Loading syllabus...
            </div>
          )}

          {/* 10 Grade Selection Cards */}
          <ClassList
            onSelectClass={setSelectedClass}
            selectedGrade={selectedClass}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-4 space-y-6 h-fit lg:sticky lg:top-8">
            <div className="sidebar bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
              {!selectedSubject ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-400">
                  <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
                    <Layout size={22} />
                    <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Select Subject</h2>
                  </div>
                  <SubjectList
                    subjects={subjectsList}
                    onSelectSubject={setSelectedSubject}
                    selectedSubject={selectedSubject}
                  />
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-400">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
                      <BookOpen size={22} />
                      <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">{selectedSubject} Units</h2>
                    </div>
                    <button
                      onClick={resetToSubject}
                      aria-label="Back to subjects"
                      className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                    >
                      <ArrowLeft size={16} />
                    </button>
                  </div>
                  <UnitAccordion
                    units={currentUnits}
                    onSelectTopic={(unit, topic) => {
                      setSelectedUnit(unit);
                      setSelectedTopic(topic);
                    }}
                    selectedTopic={selectedTopic}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Main Content Viewer */}
          <div className="lg:col-span-8">
            {selectedTopic ? (
              <LessonViewer
                lesson={{
                  id: `${selectedClass}-${selectedSubject}-${selectedTopic}`,
                  title: selectedTopic,
                  class: selectedClass || 'N/A',
                  subject: selectedSubject,
                  unit: selectedUnit,
                  explanation: explanation || "",
                  pdfUrl: topicPdf || undefined
                }}
                generating={generating}
                isSpeaking={isSpeaking}
                onListen={handleListen}
                onRefresh={() => handleExplain()}
                onTranslate={handleTranslate}
                onExplainMode={handleExplain}
                onMarkComplete={handleMarkComplete}
                isCompleted={completedLessons.includes(`${selectedClass}-${selectedSubject}-${selectedTopic}`)}
              />
            ) : (
              <div className="h-full min-h-[300px] rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-center p-12 space-y-4 bg-white/50 dark:bg-slate-900/50">
                <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-500">
                  <Info size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Topic Selected</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs max-w-xs mx-auto">
                    Pick a subject and topic from the left to start your AI-powered learning journey.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default Lessons;
