import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Check,
  CircleHelp,
  ExternalLink,
  Hand,
  Loader2,
  Search,
  Sparkles,
  Video,
  Camera,
  CameraOff,
  Volume2,
  RotateCcw,
  Award,
  Info,
  CheckCircle2,
  Eye
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAccessibility } from '../context/AccessibilityContext';
import { lessonsAPI } from '../services/api';
import {
  youtubeService,
  BUNDLED_ISL_DICTIONARY,
  BUNDLED_ISL_ALPHABET,
  BUNDLED_ISL_NUMBERS
} from '../services/youtubeService';

const OFFICIAL_DICTIONARY = 'https://divyangjan.depwd.gov.in/islrtc/';
const ISLRTC_CHANNEL = 'https://www.youtube.com/@ISLRTC';
const LEARNED_KEY = 'learnbridge_isl_practiced';

export default function SignLanguageLearning() {
  const { '*': lessonId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { signLanguageEnabled, toggleSignLanguage } = useAccessibility();

  // State
  const [lesson, setLesson] = useState(location.state?.lesson || null);
  const [dictionary, setDictionary] = useState(BUNDLED_ISL_DICTIONARY);
  const [alphabet, setAlphabet] = useState(BUNDLED_ISL_ALPHABET);
  const [numbers, setNumbers] = useState(BUNDLED_ISL_NUMBERS);
  const [selectedSign, setSelectedSign] = useState(BUNDLED_ISL_DICTIONARY[0]);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [selectedNum, setSelectedNum] = useState(null);
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('hello');
  const [category, setCategory] = useState('All phrases');
  const [videoUrl, setVideoUrl] = useState(BUNDLED_ISL_DICTIONARY[0].embedUrl);
  const [loading, setLoading] = useState(false);
  const [mirrorActive, setMirrorActive] = useState(false);
  const [mirrorError, setMirrorError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Practiced signs list
  const [learned, setLearned] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LEARNED_KEY) || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return ['hello'];
    }
  });

  const videoIframeRef = useRef(null);
  const webcamVideoRef = useRef(null);
  const webcamStreamRef = useRef(null);
  const requestNumber = useRef(0);

  // Fetch full remote dictionary on mount if available
  useEffect(() => {
    youtubeService.getISLDictionary().then((data) => {
      if (data?.dictionary?.length) {
        setDictionary(data.dictionary);
        if (data.alphabet?.length) setAlphabet(data.alphabet);
        if (data.numbers?.length) setNumbers(data.numbers);
      }
    }).catch(() => {});
  }, []);

  // Fetch parent lesson if arriving from lesson route
  useEffect(() => {
    if (!lessonId || lesson) return undefined;
    let cancelled = false;
    lessonsAPI.getOne(lessonId).then((response) => {
      if (!cancelled && response?.success) setLesson(response.lesson);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [lessonId, lesson]);

  // Sync lesson title into search
  useEffect(() => {
    if (lesson?.title && lessonId && activeQuery === 'hello') {
      setQuery(lesson.title);
      setActiveQuery(lesson.title);
    }
  }, [lesson, lessonId, activeQuery]);

  // Persist practiced signs
  useEffect(() => {
    try {
      localStorage.setItem(LEARNED_KEY, JSON.stringify(learned));
    } catch {
      // Storage unavailable fallback
    }
  }, [learned]);

  // Resolve video for active query
  useEffect(() => {
    if (!activeQuery.trim()) return undefined;
    const currentRequest = ++requestNumber.current;
    setLoading(true);

    youtubeService.searchSignLanguageVideo(activeQuery.trim())
      .then((result) => {
        if (currentRequest === requestNumber.current) {
          // Construct embed URL with parameters
          let embed = result.embedUrl;
          if (embed && !embed.includes('autoplay')) {
            embed += (embed.includes('?') ? '&' : '?') + 'rel=0&modestbranding=1';
          }
          setVideoUrl(embed);

          // Update current sign metadata
          const matched = dictionary.find(
            (item) =>
              item.id === result.title?.toLowerCase() ||
              item.phrase.toLowerCase() === result.title?.toLowerCase() ||
              item.videoId === result.videoId
          );
          if (matched) {
            setSelectedSign(matched);
          } else {
            // Virtual item from search result
            setSelectedSign({
              id: activeQuery.toLowerCase().replace(/\s+/g, '-'),
              phrase: result.title || activeQuery,
              hindiPhrase: result.hindiPhrase || '',
              group: result.group || 'Custom search',
              search: [activeQuery.toLowerCase()],
              videoId: result.videoId,
              embedUrl: embed,
              handshape: result.handshape || 'Watch the demonstrator’s handshape in the official video.',
              movement: result.movement || 'Follow the hand trajectory and motion shown above.',
              expression: result.expression || 'Observe facial markers and eye contact.',
              etiquette: result.etiquette || 'Maintain respectful gaze and clear visual boundaries.',
              difficulty: result.difficulty || 'Beginner'
            });
          }
        }
      })
      .catch(() => {
        // Safe fallback
        if (currentRequest === requestNumber.current) {
          const fallback = dictionary[0];
          setSelectedSign(fallback);
          setVideoUrl(fallback.embedUrl);
        }
      })
      .finally(() => {
        if (currentRequest === requestNumber.current) setLoading(false);
      });

    return () => { requestNumber.current += 1; };
  }, [activeQuery, dictionary]);

  // Handle webcam practice mirror lifecycle
  useEffect(() => {
    if (mirrorActive) {
      setMirrorError('');
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } })
        .then((stream) => {
          webcamStreamRef.current = stream;
          if (webcamVideoRef.current) {
            webcamVideoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn('Webcam permission not granted:', err);
          setMirrorError('Camera access unavailable. You can still practice using the visual guide below.');
          setMirrorActive(false);
        });
    } else {
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach((track) => track.stop());
        webcamStreamRef.current = null;
      }
    }

    return () => {
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach((track) => track.stop());
        webcamStreamRef.current = null;
      }
    };
  }, [mirrorActive]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(dictionary.map((item) => item.group));
    return ['All phrases', ...Array.from(set), 'Alphabet (A-Z)', 'Numbers (1-10)'];
  }, [dictionary]);

  // Filtered phrases
  const visiblePhrases = useMemo(() => {
    const s = query.trim().toLowerCase();
    return dictionary.filter((item) => {
      const matchesCategory =
        category === 'All phrases' ||
        category === 'Alphabet (A-Z)' ||
        category === 'Numbers (1-10)' ||
        item.group === category;

      const matchesSearch =
        !s ||
        item.phrase.toLowerCase().includes(s) ||
        item.hindiPhrase?.toLowerCase().includes(s) ||
        item.search.some((k) => k.toLowerCase().includes(s)) ||
        item.group.toLowerCase().includes(s);

      return matchesCategory && matchesSearch;
    });
  }, [category, query, dictionary]);

  const selectPhrase = (sign) => {
    setSelectedSign(sign);
    setSelectedLetter(null);
    setSelectedNum(null);
    setQuery(sign.phrase);
    setActiveQuery(sign.phrase);
  };

  const selectLetter = (item) => {
    setSelectedLetter(item.letter);
    setSelectedNum(null);
    setActiveQuery(`Alphabet letter ${item.letter}`);
  };

  const selectNumber = (item) => {
    setSelectedNum(item.num);
    setSelectedLetter(null);
    setActiveQuery(`Number ${item.num}`);
  };

  const submitSearch = (event) => {
    event.preventDefault();
    if (query.trim()) {
      setActiveQuery(query.trim());
    }
  };

  const togglePracticed = (id) => {
    setLearned((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]
    );
  };

  const speakPhrase = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const isCurrentLearned = selectedSign ? learned.includes(selectedSign.id) : false;
  const progressPercent = Math.round((learned.length / Math.max(dictionary.length, 1)) * 100);

  return (
    <main className="min-h-screen bg-app-bg px-4 py-8 sm:py-12 transition-colors duration-300">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header Hero */}
        <header className="relative overflow-hidden rounded-[2.5rem] border border-app-border bg-app-bg p-6 shadow-inst sm:p-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-ai-accent/5 blur-3xl pointer-events-none" />
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center relative z-10">
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ai-accent/10 text-ai-accent">
                  <Hand size={28} />
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-ai-accent/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-ai-accent">
                  Indian Sign Language · ISL
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={13} /> ISLRTC & NCERT Standardized
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-app-text-main sm:text-4xl">
                Sign Language Learning Hub
              </h1>
              <p className="mt-3 max-w-2xl text-base font-medium leading-relaxed text-app-text-sub">
                Explore standardized signs from the Indian Sign Language Research and Training Centre (ISLRTC),
                watch high-definition sign demonstrations, and track your practice progress.
                {lesson?.title ? ` Current lesson context: ${lesson.title}.` : ''}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {lessonId && (
                <Button variant="outline" onClick={() => navigate('/lessons/' + lessonId)}>
                  Back to lesson
                </Button>
              )}
              <Button
                aria-pressed={signLanguageEnabled}
                onClick={toggleSignLanguage}
                className={signLanguageEnabled ? 'bg-ai-accent text-white shadow-lg shadow-ai-accent/20' : ''}
              >
                {signLanguageEnabled ? 'Sign Mode Active' : 'Enable Sign Mode'}
              </Button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-app-border pt-6 text-sm">
            <div className="flex flex-wrap items-center gap-6 font-bold text-app-text-sub">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ai-accent/10 text-ai-accent">
                  <Award size={18} />
                </span>
                <span>
                  <strong className="text-app-text-main">{learned.length}</strong> / {dictionary.length} Signs Practiced ({progressPercent}%)
                </span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-app-border" />
              <a
                className="inline-flex items-center gap-1.5 text-ai-accent hover:underline"
                href={OFFICIAL_DICTIONARY}
                target="_blank"
                rel="noreferrer"
              >
                Official ISLRTC Dictionary <ExternalLink size={14} />
              </a>
              <div className="hidden sm:block h-4 w-px bg-app-border" />
              <a
                className="inline-flex items-center gap-1.5 text-app-text-muted hover:text-ai-accent transition-colors"
                href={ISLRTC_CHANNEL}
                target="_blank"
                rel="noreferrer"
              >
                Official ISLRTC Channel <ExternalLink size={14} />
              </a>
            </div>

            {/* Progress Bar */}
            <div className="w-full sm:w-48 bg-app-bg-alt h-2.5 rounded-full overflow-hidden border border-app-border">
              <div
                className="h-full bg-ai-accent transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </header>

        {/* Main Grid: Phrase Browser + Video Player */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          {/* Left Panel: Search & Catalog */}
          <Card className="space-y-6 rounded-[2rem] border border-app-border p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="flex items-center gap-3 text-xl font-black text-app-text-main">
                  <BookOpen className="text-ai-accent" size={22} />
                  Dictionary & Phrases
                </h2>
                <p className="mt-1 text-sm font-medium text-app-text-sub">
                  Select a phrase, letter, or number to view its official sign demonstration.
                </p>
              </div>
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-xl bg-app-bg-alt text-app-text-muted">
                {visiblePhrases.length} items
              </span>
            </div>

            {/* Search Input */}
            <form onSubmit={submitSearch} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  id="isl-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search a sign (e.g. water, hello, help)..."
                  className="w-full rounded-2xl border border-app-border bg-app-bg pl-11 pr-4 py-3 text-sm text-app-text-main outline-none transition-all focus:border-ai-accent focus:ring-4 focus:ring-ai-accent/10"
                />
                <Search size={18} className="absolute left-4 top-3.5 text-app-text-muted" />
              </div>
              <Button type="submit" aria-label="Search signs" className="flex items-center gap-2 rounded-2xl px-5">
                <Search size={16} />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </form>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2" aria-label="Phrase categories">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  aria-pressed={category === item}
                  className={
                    'rounded-full px-3.5 py-1.5 text-xs font-black transition-all ' +
                    (category === item
                      ? 'bg-ai-accent text-white shadow-md shadow-ai-accent/20'
                      : 'bg-app-bg-alt text-app-text-sub hover:bg-app-border/40 hover:text-app-text-main')
                  }
                >
                  {item}
                </button>
              ))}
            </div>

            {/* View A-Z Alphabet Grid if Alphabet Category Selected */}
            {category === 'Alphabet (A-Z)' ? (
              <div className="space-y-4">
                <p className="text-xs font-bold text-app-text-sub uppercase tracking-wider">
                  ISL One-Handed Manual Alphabet (A to Z)
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[26rem] overflow-y-auto pr-1">
                  {alphabet.map((item) => {
                    const isSelected = selectedLetter === item.letter;
                    return (
                      <button
                        key={item.letter}
                        type="button"
                        onClick={() => selectLetter(item)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                          isSelected
                            ? 'border-ai-accent bg-ai-accent/10 text-ai-accent ring-2 ring-ai-accent/30 font-black'
                            : 'border-app-border bg-app-bg hover:bg-app-bg-alt text-app-text-main'
                        }`}
                      >
                        <span className="text-2xl font-black">{item.letter}</span>
                        <span className="text-[10px] text-app-text-muted truncate mt-1">Letter</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : category === 'Numbers (1-10)' ? (
              /* View 1-10 Numbers Grid */
              <div className="space-y-4">
                <p className="text-xs font-bold text-app-text-sub uppercase tracking-wider">
                  ISL Counting Signs (0 to 10)
                </p>
                <div className="grid grid-cols-5 gap-2 max-h-[26rem] overflow-y-auto pr-1">
                  {numbers.map((item) => {
                    const isSelected = selectedNum === item.num;
                    return (
                      <button
                        key={item.num}
                        type="button"
                        onClick={() => selectNumber(item)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                          isSelected
                            ? 'border-ai-accent bg-ai-accent/10 text-ai-accent ring-2 ring-ai-accent/30 font-black'
                            : 'border-app-border bg-app-bg hover:bg-app-bg-alt text-app-text-main'
                        }`}
                      >
                        <span className="text-2xl font-black">{item.num}</span>
                        <span className="text-[10px] text-app-text-muted mt-1">Sign</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Regular Phrases List */
              <div className="max-h-[26rem] space-y-2.5 overflow-y-auto pr-1">
                {visiblePhrases.length ? (
                  visiblePhrases.map((phrase) => {
                    const isLearned = learned.includes(phrase.id);
                    const isSelected = selectedSign?.id === phrase.id;

                    return (
                      <div
                        key={phrase.id}
                        className={`flex items-center gap-3 rounded-2xl border p-3 transition-all ${
                          isSelected
                            ? 'border-ai-accent bg-ai-accent/5 ring-1 ring-ai-accent/30'
                            : 'border-app-border bg-app-bg hover:border-app-border/80'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => selectPhrase(phrase)}
                          className="flex min-h-11 min-w-0 flex-1 items-center justify-between gap-3 rounded-xl px-2 text-left focus:outline-none"
                          aria-label={`Find ISL sign for ${phrase.phrase}`}
                        >
                          <div className="min-w-0">
                            <span className="font-bold text-app-text-main block truncate">
                              {phrase.phrase}
                            </span>
                            {phrase.hindiPhrase && (
                              <span className="text-xs font-medium text-app-text-muted block truncate">
                                {phrase.hindiPhrase}
                              </span>
                            )}
                          </div>
                          <span className="shrink-0 rounded-lg bg-app-bg-alt px-2 py-0.5 text-[10px] font-bold text-app-text-muted">
                            {phrase.group}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => togglePracticed(phrase.id)}
                          aria-pressed={isLearned}
                          title={isLearned ? 'Practiced' : 'Mark practiced'}
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${
                            isLearned
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                              : 'bg-app-bg-alt text-app-text-muted hover:bg-ai-accent/10 hover:text-ai-accent'
                          }`}
                        >
                          {isLearned ? <Check size={18} /> : <span className="text-lg">+</span>}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl bg-app-bg-alt p-6 text-center">
                    <p className="text-sm font-medium text-app-text-sub">
                      No exact phrase matches for "{query}".
                    </p>
                    <p className="text-xs text-app-text-muted mt-1">
                      Click Search to query the complete Indian Sign Language knowledge base.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Standard Notice */}
            <div className="rounded-2xl bg-ai-accent/5 p-4 text-xs leading-relaxed text-app-text-sub border border-ai-accent/10">
              <p className="flex items-start gap-2">
                <CircleHelp size={16} className="mt-0.5 shrink-0 text-ai-accent" />
                <span>
                  All signs follow ISLRTC standards. Sign languages naturally have regional dialects; this platform
                  relies on certified national educational gestures.
                </span>
              </p>
            </div>
          </Card>

          {/* Right Panel: Video Player & Practice Hub */}
          <section aria-live="polite" aria-busy={loading} className="space-y-6">
            <Card className="overflow-hidden rounded-[2.5rem] border border-app-border p-5 sm:p-7 shadow-inst">
              {/* Player Header */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Video className="text-ai-accent" size={20} />
                    <h2 className="text-lg font-black text-app-text-main">
                      {selectedLetter
                        ? `Alphabet Letter "${selectedLetter}" in ISL`
                        : selectedNum
                        ? `Number "${selectedNum}" in ISL`
                        : selectedSign?.phrase || activeQuery}
                    </h2>
                  </div>
                  {selectedSign?.hindiPhrase && (
                    <p className="mt-0.5 text-xs font-bold text-app-text-muted">
                      {selectedSign.hindiPhrase}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Text-to-speech button for hearing learners/allies */}
                  <button
                    type="button"
                    onClick={() => speakPhrase(selectedSign?.phrase || activeQuery)}
                    title="Pronounce phrase"
                    className="p-2.5 rounded-xl bg-app-bg-alt text-app-text-sub hover:text-ai-accent hover:bg-ai-accent/10 transition-colors"
                  >
                    <Volume2 size={18} className={isSpeaking ? 'animate-pulse text-ai-accent' : ''} />
                  </button>

                  {/* Toggle Practice Webcam Mirror */}
                  <button
                    type="button"
                    onClick={() => setMirrorActive(!mirrorActive)}
                    title={mirrorActive ? 'Close practice mirror' : 'Open practice camera'}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      mirrorActive
                        ? 'bg-ai-accent text-white shadow-md shadow-ai-accent/20'
                        : 'bg-app-bg-alt text-app-text-sub hover:text-app-text-main'
                    }`}
                  >
                    {mirrorActive ? <CameraOff size={15} /> : <Camera size={15} />}
                    <span>{mirrorActive ? 'Hide Mirror' : 'Practice Mirror'}</span>
                  </button>

                  {/* Mark Practiced */}
                  {selectedSign && (
                    <Button
                      variant={isCurrentLearned ? 'success' : 'outline'}
                      onClick={() => togglePracticed(selectedSign.id)}
                      className="text-xs py-2 px-4 rounded-xl flex items-center gap-2"
                    >
                      {isCurrentLearned ? (
                        <>
                          <Check size={15} /> Practiced
                        </>
                      ) : (
                        'Mark Practiced'
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Video Player Display Container */}
              <div
                className={`grid gap-4 ${
                  mirrorActive ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
                }`}
              >
                {/* Primary Video Embed */}
                <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-950 text-center shadow-inner">
                  {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 text-white bg-slate-950/80 backdrop-blur-sm">
                      <Loader2 className="animate-spin text-ai-accent" size={36} />
                      <p className="text-sm font-bold">Loading official ISL demonstration…</p>
                    </div>
                  ) : videoUrl ? (
                    <iframe
                      ref={videoIframeRef}
                      className="absolute inset-0 h-full w-full rounded-2xl border-0"
                      src={videoUrl}
                      title={`Indian Sign Language video for ${selectedSign?.phrase || activeQuery}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center p-6 text-white space-y-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                        <Hand size={28} />
                      </span>
                      <p className="font-bold text-sm">Select any sign to start learning.</p>
                    </div>
                  )}
                </div>

                {/* Optional Practice Mirror (Webcam Side-by-Side) */}
                {mirrorActive && (
                  <div className="relative aspect-video overflow-hidden rounded-2xl bg-black border-2 border-ai-accent/30 flex items-center justify-center shadow-lg">
                    <video
                      ref={webcamVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="h-full w-full object-cover transform -scale-x-100 rounded-2xl"
                    />
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold text-white flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                      Self-Practice Mirror (Mirror Mode)
                    </div>
                  </div>
                )}
              </div>

              {mirrorError && (
                <p className="mt-2 text-xs text-amber-500 font-medium">{mirrorError}</p>
              )}

              {/* Video Footer Actions */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-app-text-sub font-medium">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Standardized Indian Sign Language demonstration</span>
                </div>
                <div className="flex items-center gap-4">
                  <a
                    href={OFFICIAL_DICTIONARY}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-ai-accent hover:underline"
                  >
                    Open DEPwD Portal <ExternalLink size={13} />
                  </a>
                  <a
                    href={`https://www.youtube.com/@ISLRTC/search?query=${encodeURIComponent(activeQuery)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-app-text-muted hover:text-ai-accent transition-colors"
                  >
                    Watch on ISLRTC <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </Card>

            {/* Gesture Instructions & Non-Manual Markers */}
            {selectedLetter ? (
              /* Detail for manual alphabet */
              <Card className="rounded-[2rem] border border-app-border p-6 sm:p-7 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ai-accent/10 text-ai-accent font-black text-2xl">
                    {selectedLetter}
                  </span>
                  <div>
                    <h3 className="font-black text-app-text-main text-lg">
                      Fingerspelling Letter "{selectedLetter}"
                    </h3>
                    <p className="text-xs font-bold text-app-text-muted">
                      Indian Sign Language Manual Alphabet
                    </p>
                  </div>
                </div>
                {(() => {
                  const item = alphabet.find((a) => a.letter === selectedLetter);
                  return item ? (
                    <div className="grid gap-3 sm:grid-cols-2 pt-2">
                      <div className="p-4 rounded-2xl bg-app-bg-alt border border-app-border">
                        <span className="text-xs font-black uppercase tracking-wider text-ai-accent block mb-1">
                          Handshape & Position
                        </span>
                        <p className="text-sm font-medium text-app-text-main">{item.shape}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-app-bg-alt border border-app-border">
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                          Practice Tip
                        </span>
                        <p className="text-sm font-medium text-app-text-main">{item.tip}</p>
                      </div>
                    </div>
                  ) : null;
                })()}
              </Card>
            ) : selectedNum ? (
              /* Detail for number */
              <Card className="rounded-[2rem] border border-app-border p-6 sm:p-7 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ai-accent/10 text-ai-accent font-black text-2xl">
                    {selectedNum}
                  </span>
                  <div>
                    <h3 className="font-black text-app-text-main text-lg">
                      Number "{selectedNum}" in ISL
                    </h3>
                    <p className="text-xs font-bold text-app-text-muted">
                      Standard Indian Sign Language Numeral
                    </p>
                  </div>
                </div>
                {(() => {
                  const item = numbers.find((n) => n.num === selectedNum);
                  return item ? (
                    <div className="grid gap-3 sm:grid-cols-2 pt-2">
                      <div className="p-4 rounded-2xl bg-app-bg-alt border border-app-border">
                        <span className="text-xs font-black uppercase tracking-wider text-ai-accent block mb-1">
                          Handshape
                        </span>
                        <p className="text-sm font-medium text-app-text-main">{item.shape}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-app-bg-alt border border-app-border">
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                          Forming the Numeral
                        </span>
                        <p className="text-sm font-medium text-app-text-main">{item.tip}</p>
                      </div>
                    </div>
                  ) : null;
                })()}
              </Card>
            ) : selectedSign ? (
              /* Rich Gesture Step-by-Step Breakdown */
              <Card className="rounded-[2.5rem] border border-app-border p-6 sm:p-7 space-y-5">
                <div className="flex items-center justify-between border-b border-app-border pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-ai-accent/10 text-ai-accent">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-app-text-main text-lg">
                        Sign Breakdown & Instructions
                      </h3>
                      <p className="text-xs font-bold text-app-text-muted">
                        Official gesture guidelines from ISLRTC curriculum
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-ai-accent/10 text-ai-accent">
                    {selectedSign.difficulty || 'Beginner'}
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Handshape */}
                  <div className="rounded-2xl bg-app-bg-alt p-4 border border-app-border">
                    <div className="flex items-center gap-2 mb-2 text-ai-accent">
                      <Hand size={16} />
                      <span className="text-xs font-black uppercase tracking-wider">Handshape</span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-app-text-main">
                      {selectedSign.handshape}
                    </p>
                  </div>

                  {/* Movement */}
                  <div className="rounded-2xl bg-app-bg-alt p-4 border border-app-border">
                    <div className="flex items-center gap-2 mb-2 text-primary">
                      <RotateCcw size={16} />
                      <span className="text-xs font-black uppercase tracking-wider">Movement</span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-app-text-main">
                      {selectedSign.movement}
                    </p>
                  </div>

                  {/* Expression */}
                  <div className="rounded-2xl bg-app-bg-alt p-4 border border-app-border">
                    <div className="flex items-center gap-2 mb-2 text-amber-500">
                      <Eye size={16} />
                      <span className="text-xs font-black uppercase tracking-wider">Facial Expression</span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-app-text-main">
                      {selectedSign.expression}
                    </p>
                  </div>

                  {/* Cultural Etiquette */}
                  <div className="rounded-2xl bg-app-bg-alt p-4 border border-app-border">
                    <div className="flex items-center gap-2 mb-2 text-emerald-500">
                      <Info size={16} />
                      <span className="text-xs font-black uppercase tracking-wider">Etiquette & Context</span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-app-text-main">
                      {selectedSign.etiquette}
                    </p>
                  </div>
                </div>
              </Card>
            ) : null}

            {/* Lesson Context Text if Arrived from a Lesson */}
            {lesson && (
              <Card className="rounded-[2rem] border border-app-border p-6">
                <h3 className="mb-2 font-black text-app-text-main text-base">
                  Lesson Study Notes: {lesson.title}
                </h3>
                <p className="whitespace-pre-wrap leading-relaxed text-sm text-app-text-sub">
                  {lesson.explanation || lesson.textVersion || lesson.description || 'No additional lesson notes.'}
                </p>
              </Card>
            )}

            {/* Practice Routine Card */}
            <Card className="rounded-[2rem] border border-app-border bg-ai-accent/5 p-6 border-ai-accent/10">
              <h3 className="mb-3 flex items-center gap-2 font-black text-app-text-main">
                <CheckCircle2 size={18} className="text-ai-accent" />
                Recommended Practice Routine
              </h3>
              <ol className="list-inside list-decimal space-y-2 text-sm font-medium leading-relaxed text-app-text-sub">
                <li>
                  <strong className="text-app-text-main">Observe Carefully:</strong> Watch the signer’s handshape, wrist movement, and facial cues in the video demonstration.
                </li>
                <li>
                  <strong className="text-app-text-main">Use the Practice Mirror:</strong> Click "Practice Mirror" to check your hand formation side-by-side with the instructional video.
                </li>
                <li>
                  <strong className="text-app-text-main">Mark Practiced:</strong> Click "Mark Practiced" once confident so your progress is saved across sessions.
                </li>
              </ol>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
