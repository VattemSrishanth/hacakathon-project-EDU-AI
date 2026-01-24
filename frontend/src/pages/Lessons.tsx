import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import type { Lesson } from "../types";
import { lessonsAPI, aiAPI } from "../services/api";
import { useSettings } from "../context/SettingsContext";

const Lessons = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings, t } = useSettings();
  const { accessibilityMode } = settings.themeAccessibility;
  const { language } = settings.learning;

  // --- List State ---
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [filterLevel, setFilterLevel] = useState<string>("");

  // --- Viewer State ---
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const audioStarted = useRef(false);

  // Load completed lessons
  useEffect(() => {
    const stored = localStorage.getItem("lesson_completion_tracker");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCompletedIds(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        setCompletedIds([]);
      }
    }
  }, []);

  const toggleLessonCompletion = (lessonId: string) => {
    const newCompleted = completedIds.includes(lessonId)
      ? completedIds.filter((cid) => cid !== lessonId)
      : [...completedIds, lessonId];
    setCompletedIds(newCompleted);
    localStorage.setItem("lesson_completion_tracker", JSON.stringify(newCompleted));
  };

  // Fetch all lessons
  useEffect(() => {
    const fetchLessons = async () => {
      setLoadingList(true);
      try {
        const data = await lessonsAPI.getAll();
        setLessons(data?.lessons || []);
      } catch (error) {
        console.error("Failed to fetch lessons:", error);
      } finally {
        setLoadingList(false);
      }
    };
    fetchLessons();
  }, []);

  // Handle individual lesson logic (if ID in URL)
  useEffect(() => {
    if (!id) {
       setLesson(null);
       setSummary("");
       audioStarted.current = false;
       return;
    }

    const fetchLessonDetail = async () => {
      setLoadingLesson(true);
      audioStarted.current = false;
      try {
        const lessonRes = await lessonsAPI.getById(id);
        if (lessonRes.success) setLesson(lessonRes.lesson);

        const cachedSummary = localStorage.getItem(`lesson_summary_${id}_${language}`);
        if (cachedSummary) {
          setSummary(cachedSummary);
        } else {
          const contentRes = await lessonsAPI.getContent(id);
          if (contentRes.success) {
            setSummarizing(true);
            const aiRes = await aiAPI.analyzePdf(contentRes.content, "", accessibilityMode.toLowerCase(), language, "Detailed");
            if (aiRes.success) {
              setSummary(aiRes.summary);
              localStorage.setItem(`lesson_summary_${id}_${language}`, aiRes.summary);
            }
          }
        }
      } catch (error) {
        console.error("Error loading lesson:", error);
      } finally {
        setLoadingLesson(false);
        setSummarizing(false);
      }
    };

    fetchLessonDetail();
  }, [id, language, accessibilityMode]);

  // Accessibility: TTS for Blind Mode
  useEffect(() => {
    if (accessibilityMode === "Blind" && summary && !audioStarted.current) {
      const speech = new SpeechSynthesisUtterance(summary);
      speech.lang = language === "Hindi" ? "hi-IN" : "en-US";
      speech.rate = 0.9;
      window.speechSynthesis.speak(speech);
      audioStarted.current = true;
    }
  }, [summary, accessibilityMode, language]);

  // Filtering
  const preferredLevel = settings.learning.level;
  const filteredLessons = lessons.filter((l) => !filterLevel || l.level === filterLevel);

  const getLevelLabel = (lvl: string) => {
    if (lvl === "Beginner") return t.lessons.beginner;
    if (lvl === "Intermediate") return t.lessons.intermediate;
    if (lvl === "Advanced") return t.lessons.advanced;
    return lvl;
  };

  // --- Render Viewer ---
  if (id && (loadingLesson || lesson)) {
    if (loadingLesson) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-app-bg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-app-text-main">Loading lesson context...</p>
          </div>
        </div>
      );
    }

    if (!lesson) return null;

    return (
      <div className="min-h-screen bg-app-bg-alt py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-app-text-main">{lesson.title}</h1>
              <p className="text-app-text-sub mt-1">{lesson.level} Level  {lesson.duration}</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/lessons")}>Back to List</Button>
          </div>

          <Card className="mb-8">
            <div className="flex items-center gap-2 mb-6 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-100 dark:border-indigo-800">
              <span className="text-xl"></span>
              <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-widest">Smart Summarized Content</span>
            </div>

            {summarizing ? (
              <div className="py-12 text-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <p className="mt-6 text-app-text-sub text-sm">Generating student-friendly summary...</p>
                </div>
              </div>
            ) : (
              <div className="prose prose-indigo max-w-none dark:prose-invert">
                <div className="text-app-text-main leading-relaxed space-y-4 whitespace-pre-wrap">{summary || "No summary available."}</div>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-app-border flex justify-between items-center">
               <div className="flex items-center gap-2">
                  {completedIds.includes(lesson.id) ? (
                    <span className="text-green-600 font-bold flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      Lesson Completed
                    </span>
                  ) : (
                    <span className="text-app-text-sub text-sm italic">You haven\"t finished this lesson yet.</span>
                  )}
               </div>
               
               <div className="flex gap-4">
                  {accessibilityMode === "Blind" && (
                     <Button variant="outline" onClick={() => {
                        window.speechSynthesis.cancel();
                        const speech = new SpeechSynthesisUtterance(summary);
                        speech.lang = language === "Hindi" ? "hi-IN" : "en-US";
                        window.speechSynthesis.speak(speech);
                     }}>Replay Lesson</Button>
                  )}
                  
                  <Button variant={completedIds.includes(lesson.id) ? "outline" : "primary"} onClick={() => {
                    if (!completedIds.includes(lesson.id)) toggleLessonCompletion(lesson.id);
                    navigate("/lessons");
                  }} className="px-8">
                    {completedIds.includes(lesson.id) ? "Return to Lessons" : "Mark as Completed"}
                  </Button>
               </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // --- Render List ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner */}
        {accessibilityMode !== "Normal" && (
          <div className={`mb-6 p-4 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-500 ${
            accessibilityMode === "Blind" ? "bg-purple-100 text-purple-900 border-2 border-purple-300 dark:bg-purple-900/40 dark:text-purple-100 dark:border-purple-500" :
            accessibilityMode === "Deaf" ? "bg-yellow-100 text-yellow-900 border-2 border-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-100 dark:border-yellow-500" :
            "bg-orange-100 text-orange-900 border-2 border-orange-300 dark:bg-orange-900/40 dark:text-orange-100 dark:border-orange-500"
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{accessibilityMode === "Blind" ? "" : accessibilityMode === "Deaf" ? "" : ""}</span>
              <div>
                <h2 className="font-bold underline">{accessibilityMode} Mode Active</h2>
                <p className="text-sm font-medium opacity-90">
                  {accessibilityMode === "Blind" ? "Voice guidance and screen optimization active." :
                   accessibilityMode === "Deaf" ? "Visual captions and enhanced feedback active." : "Text-priority interaction active."}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.lessons.title}</h1>
            <p className="text-gray-800 dark:text-gray-200 mt-2 font-medium">{t.lessons.subtitle}</p>
          </div>
          <Button variant="secondary" onClick={() => navigate("/assignments")} className="flex items-center gap-2 popup-interactive shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14l2 2 4-4"></path></svg>
            Assignments
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          {["", "Beginner", "Intermediate", "Advanced"].map((lvl) => (
            <button key={lvl} onClick={() => setFilterLevel(lvl)} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
              filterLevel === lvl ? "bg-primary text-white shadow-primary/30" : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}>
              {lvl || "All"}
            </button>
          ))}
          <button onClick={() => setFilterLevel(preferredLevel)} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
            filterLevel === preferredLevel ? "bg-secondary text-white shadow-secondary/30" : "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-200 border border-cyan-100 dark:border-cyan-800 hover:bg-cyan-100"
          }`}>
            {t.settings.learning.level}: {getLevelLabel(preferredLevel)}
          </button>
        </div>

        {loadingList ? (
          <div className="text-center py-12"><p className="text-gray-600">{t.common.loading}</p></div>
        ) : filteredLessons.length === 0 ? (
          <div className="text-center py-12"><p className="text-gray-600 font-bold">No lessons found for this level.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((lesson) => (
              <Card key={lesson.id} hover>
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{lesson.title}</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">{lesson.description}</p>
                    <div className="flex justify-between text-sm font-semibold">
                      <span>{lesson.duration}</span>
                      <span className="text-primary">{lesson.level}</span>
                    </div>
                  </div>
                  <div className="mt-6 space-y-2">
                    <Button variant="primary" className="w-full" onClick={() => navigate(`/lessons/${lesson.id}`)}>Start Lesson</Button>
                    <button onClick={() => toggleLessonCompletion(lesson.id)} className={`w-full py-2 text-sm font-bold rounded-lg border transition-all ${
                      completedIds.includes(lesson.id) ? "bg-green-50 text-green-700 border-green-200" : "bg-white text-gray-700 border-gray-200"
                    }`}>
                      {completedIds.includes(lesson.id) ? " Completed" : "Mark as Completed"}
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Lessons;

