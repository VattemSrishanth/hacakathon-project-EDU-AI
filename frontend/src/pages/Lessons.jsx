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
  Globe } from
'lucide-react';

// Modular Components
import ClassList from '../components/Syllabus/ClassList';
import SubjectList from '../components/Syllabus/SubjectList';
import UnitAccordion from '../components/Syllabus/UnitAccordion';
import LessonViewer from '../components/Syllabus/LessonViewer';
const Lessons = () => {
  const { t, settings } = useSettings();
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
    <div className="min-h-screen bg-app-bg-alt py-12 px-4 transition-colors duration-300 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-app-border pb-10">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20">
                <Sparkles size={14} />
                AI-Powered Learning
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-[0.2em] border border-secondary/20">
                <Globe size={14} />
                {settings.learning.board} Syllabus
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-app-text-main tracking-tighter leading-none italic uppercase">
              {t.lessons.title}
            </h1>
            <p className="text-app-text-sub font-black uppercase text-xs tracking-[0.3em] opacity-60">
              Full Grades 1–10 Digital Syllabus Hub
            </p>
          </div>

          {selectedClass &&
          <button
            onClick={resetToClass}
            className="flex items-center gap-3 px-6 py-3 rounded-full bg-app-bg border-2 border-app-border text-app-text-main font-black uppercase text-[10px] tracking-widest hover:border-primary transition-all active:scale-95 shadow-sm">
            
              <ArrowLeft size={16} />
              Change Class
            </button>
          }
        </div>

        {/* Dynamic Content Area */}
        {!selectedClass ?
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-app-text-main tracking-tight uppercase">Select Your Grade</h2>
              <p className="text-app-text-sub font-bold uppercase text-[10px] tracking-widest">Choose a class to explore the full curriculum</p>
            </div>
            {syllabusLoading &&
          <div className="text-center text-app-text-sub font-bold uppercase text-[10px] tracking-widest">
                Loading syllabus...
              </div>
          }
            <ClassList
            onSelectClass={setSelectedClass}
            selectedGrade={selectedClass} />
          
          </div> :

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-4 space-y-8 h-fit lg:sticky lg:top-8">
              <div className="sidebar">
                {!selectedSubject ?
              <div className="space-y-6 animate-in fade-in slide-in-from-left-6 duration-500">
                    <div className="flex items-center gap-3 text-primary">
                      <Layout size={24} />
                      <h2 className="text-xl font-black uppercase tracking-tight">Select Subject</h2>
                    </div>
                    <SubjectList
                  subjects={subjectsList}
                  onSelectSubject={setSelectedSubject}
                  selectedSubject={selectedSubject} />
                
                  </div> :

              <div className="space-y-6 animate-in fade-in slide-in-from-left-6 duration-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-secondary">
                        <BookOpen size={24} />
                        <h2 className="text-xl font-black uppercase tracking-tight">{selectedSubject} Units</h2>
                      </div>
                      <button
                    onClick={resetToSubject}
                    className="p-2 rounded-xl bg-app-bg hover:bg-app-bg-alt text-app-text-sub border border-app-border transition-colors">
                    
                        <ArrowLeft size={18} />
                      </button>
                    </div>
                    <UnitAccordion
                  units={currentUnits}
                  onSelectTopic={(unit, topic) => {
                    setSelectedUnit(unit);
                    setSelectedTopic(topic);
                  }}
                  selectedTopic={selectedTopic} />
                
                  </div>
              }
              </div>
            </div>

            {/* Main Content Viewer */}
            <div className="lg:col-span-8">
              {selectedTopic ?
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
              isCompleted={completedLessons.includes(`${selectedClass}-${selectedSubject}-${selectedTopic}`)} /> :


            <div className="h-full min-h-125 rounded-[3rem] border-4 border-dashed border-app-border flex flex-col items-center justify-center text-center p-12 space-y-6 opacity-60">
                  <div className="w-24 h-24 rounded-full bg-app-bg-alt flex items-center justify-center text-app-text-muted">
                    <Info size={48} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-app-text-main uppercase tracking-tight">No Topic Selected</h3>
                    <p className="text-app-text-sub font-bold max-w-xs mx-auto text-sm">Pick a subject and topic from the left to start your AI-powered learning journey.</p>
                  </div>
                </div>
            }
            </div>
          </div>
        }
      </div>
    </div>);

};

export default Lessons;