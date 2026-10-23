import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Check, CircleHelp, ExternalLink, Hand, Loader2, Search, Sparkles, Video } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAccessibility } from '../context/AccessibilityContext';
import { lessonsAPI } from '../services/api';
import { youtubeService } from '../services/youtubeService';

const OFFICIAL_DICTIONARY = 'https://divyangjan.depwd.gov.in/islrtc/';
const LEARNED_KEY = 'learnbridge_isl_practiced';
const PHRASES = [
  { id: 'hello', phrase: 'Hello', group: 'Greetings', search: 'hello' },
  { id: 'how-are-you', phrase: 'How are you?', group: 'Greetings', search: 'how are you' },
  { id: 'thank-you', phrase: 'Thank you', group: 'Greetings', search: 'thank you' },
  { id: 'my-name', phrase: 'My name is…', group: 'Greetings', search: 'my name' },
  { id: 'goodbye', phrase: 'Goodbye', group: 'Greetings', search: 'goodbye' },
  { id: 'help', phrase: 'Please help me', group: 'In class', search: 'help me' },
  { id: 'repeat', phrase: 'Please repeat', group: 'In class', search: 'repeat' },
  { id: 'understand', phrase: 'I understand', group: 'In class', search: 'understand' },
  { id: 'question', phrase: 'I have a question', group: 'In class', search: 'question' },
  { id: 'water', phrase: 'I need water', group: 'Everyday needs', search: 'water' },
  { id: 'bathroom', phrase: 'Where is the bathroom?', group: 'Everyday needs', search: 'bathroom' },
  { id: 'yes', phrase: 'Yes', group: 'Everyday needs', search: 'yes' },
  { id: 'no', phrase: 'No', group: 'Everyday needs', search: 'no' },
  { id: 'please', phrase: 'Please', group: 'Everyday needs', search: 'please' },
];

export default function SignLanguageLearning() {
  const { '*': lessonId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { signLanguageEnabled, toggleSignLanguage } = useAccessibility();
  const [lesson, setLesson] = useState(location.state?.lesson || null);
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [category, setCategory] = useState('All phrases');
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [learned, setLearned] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LEARNED_KEY) || '[]');
      return Array.isArray(saved) ? saved : [];
    }
    catch { return []; }
  });
  const requestNumber = useRef(0);

  useEffect(() => {
    if (!lessonId || lesson) return undefined;
    let cancelled = false;
    lessonsAPI.getOne(lessonId).then((response) => {
      if (!cancelled && response?.success) setLesson(response.lesson);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [lessonId, lesson]);

  useEffect(() => {
    if (lesson?.title && lessonId && !activeQuery) {
      setQuery(lesson.title);
      setActiveQuery(lesson.title);
    }
  }, [lesson, lessonId, activeQuery]);

  useEffect(() => {
    if (!activeQuery.trim()) return undefined;
    const currentRequest = ++requestNumber.current;
    setLoading(true);
    setError('');
    setVideoUrl('');
    youtubeService.searchSignLanguageVideo(activeQuery.trim() + ' Indian Sign Language ISLRTC')
      .then((result) => {
        if (currentRequest === requestNumber.current) setVideoUrl(result.embedUrl);
      })
      .catch((err) => {
        if (currentRequest === requestNumber.current) setError(err?.message || 'The official ISL video could not be loaded right now.');
      })
      .finally(() => {
        if (currentRequest === requestNumber.current) setLoading(false);
      });
    return () => { requestNumber.current += 1; };
  }, [activeQuery]);

  useEffect(() => {
    try { localStorage.setItem(LEARNED_KEY, JSON.stringify(learned)); }
    catch { /* Keep practice usable if storage is disabled. */ }
  }, [learned]);

  const categories = useMemo(() => ['All phrases', ...new Set(PHRASES.map((item) => item.group))], []);
  const visiblePhrases = useMemo(() => {
    const search = query.trim().toLowerCase();
    return PHRASES.filter((item) =>
      (category === 'All phrases' || item.group === category) &&
      (!search || item.phrase.toLowerCase().includes(search) || item.group.toLowerCase().includes(search))
    );
  }, [category, query]);
  const currentPhrase = PHRASES.find((phrase) => phrase.phrase === query);
  const lessonTranscript = lesson?.explanation || lesson?.textVersion || lesson?.description || '';

  const selectPhrase = (phrase) => {
    setQuery(phrase.phrase);
    setActiveQuery(phrase.search);
  };
  const submitSearch = (event) => {
    event.preventDefault();
    if (query.trim()) setActiveQuery(query.trim());
  };
  const togglePracticed = (id) => setLearned((previous) =>
    previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]
  );

  return (
    <main className="min-h-screen bg-app-bg px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-[2.5rem] border border-app-border bg-app-bg p-6 shadow-inst sm:p-10">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-3xl">
              <div className="mb-4 flex items-center gap-3 text-ai-accent">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ai-accent/10"><Hand size={28} /></span>
                <span className="text-xs font-black uppercase tracking-[0.2em]">Indian Sign Language · ISL</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-app-text-main sm:text-4xl">Sign Language Learning</h1>
              <p className="mt-3 max-w-2xl text-base font-medium leading-relaxed text-app-text-sub">
                Look up a phrase, watch an ISLRTC sign video when available, and track what you have practiced.
                {lesson?.title ? ' Current lesson: ' + lesson.title + '.' : ''}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {lessonId && <Button variant="outline" onClick={() => navigate('/lessons/' + lessonId)}>Back to lesson</Button>}
              <Button aria-pressed={signLanguageEnabled} onClick={toggleSignLanguage}>
                {signLanguageEnabled ? 'Sign mode enabled' : 'Enable sign mode'}
              </Button>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-app-border pt-5 text-sm font-bold text-app-text-sub">
            <span className="inline-flex items-center gap-2"><Check size={16} className="text-ai-accent" />{learned.length} phrases practiced on this device</span>
            <a className="inline-flex items-center gap-2 text-ai-accent underline-offset-4 hover:underline" href={OFFICIAL_DICTIONARY} target="_blank" rel="noreferrer">
              Official ISLRTC Dictionary <ExternalLink size={15} />
            </a>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.4fr)]">
          <Card className="space-y-6 rounded-[2rem] border border-app-border p-6 sm:p-8">
            <div>
              <h2 className="flex items-center gap-3 text-xl font-black text-app-text-main"><BookOpen className="text-primary" /> Phrase practice</h2>
              <p className="mt-2 text-sm font-medium text-app-text-sub">Choose a phrase to look for its sign, then mark it practiced.</p>
            </div>
            <form onSubmit={submitSearch} className="flex gap-2">
              <label className="sr-only" htmlFor="isl-search">Search phrases</label>
              <input id="isl-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a phrase or lesson topic" className="min-w-0 flex-1 rounded-xl border border-app-border bg-app-bg px-4 py-3 text-app-text-main outline-none focus:border-ai-accent focus:ring-2 focus:ring-ai-accent/20" />
              <Button type="submit" aria-label="Search official sign videos" className="flex items-center gap-2"><Search size={17} /><span className="hidden sm:inline">Search</span></Button>
            </form>
            <div className="flex flex-wrap gap-2" aria-label="Phrase categories">
              {categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={'rounded-full px-3 py-2 text-xs font-black transition-colors ' + (category === item ? 'bg-ai-accent text-white' : 'bg-app-bg-alt text-app-text-sub hover:text-app-text-main')}>{item}</button>)}
            </div>
            <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
              {visiblePhrases.length ? visiblePhrases.map((phrase) => {
                const isLearned = learned.includes(phrase.id);
                return <div key={phrase.id} className="flex items-center gap-2 rounded-2xl border border-app-border bg-app-bg p-3">
                  <button type="button" onClick={() => selectPhrase(phrase)} className="flex min-h-12 min-w-0 flex-1 items-center justify-between gap-3 rounded-xl px-2 text-left hover:bg-app-bg-alt focus:outline-none focus:ring-2 focus:ring-ai-accent" aria-label={'Find ISL sign for ' + phrase.phrase}>
                    <span className="font-bold text-app-text-main">{phrase.phrase}</span><span className="shrink-0 text-xs font-bold text-app-text-muted">{phrase.group}</span>
                  </button>
                  <button type="button" onClick={() => togglePracticed(phrase.id)} aria-pressed={isLearned} aria-label={(isLearned ? 'Remove practiced status for ' : 'Mark as practiced: ') + phrase.phrase} className={'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ' + (isLearned ? 'bg-emerald-100 text-emerald-700' : 'bg-app-bg-alt text-app-text-muted hover:text-ai-accent')}>
                    {isLearned ? <Check size={18} /> : <span className="text-lg">+</span>}
                  </button>
                </div>;
              }) : <p className="rounded-xl bg-app-bg-alt p-5 text-sm font-medium text-app-text-sub">No phrase matches. Search any word above to look it up in the official ISL video library.</p>}
            </div>
            <div className="rounded-2xl bg-primary/5 p-4 text-sm leading-relaxed text-app-text-sub">
              <p className="flex items-start gap-2"><CircleHelp size={18} className="mt-0.5 shrink-0 text-primary" /><span>Sign languages have regional variation. Use ISLRTC materials as the source for each sign; this page does not invent hand gestures.</span></p>
            </div>
          </Card>

          <section aria-live="polite" aria-busy={loading} className="space-y-5">
            <Card className="overflow-hidden rounded-[2rem] border border-app-border p-4 sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-black text-app-text-main"><Video className="text-primary" /> ISL sign video</h2>
                  <p className="mt-1 text-sm font-bold text-app-text-sub">{activeQuery ? 'Looking up: ' + activeQuery : 'Select a phrase or search a lesson topic.'}</p>
                </div>
                {currentPhrase && <Button variant={learned.includes(currentPhrase.id) ? 'success' : 'outline'} onClick={() => togglePracticed(currentPhrase.id)}>
                  {learned.includes(currentPhrase.id) ? 'Practiced' : 'Mark practiced'}
                </Button>}
              </div>
              <div className="relative flex aspect-video min-h-56 items-center justify-center overflow-hidden rounded-2xl bg-slate-950 text-center">
                {loading ? <div className="space-y-3 text-white"><Loader2 className="mx-auto animate-spin" size={34} /><p className="text-sm font-bold">Searching official ISLRTC videos…</p></div>
                  : videoUrl ? <iframe className="absolute inset-0 h-full w-full" src={videoUrl} title={'Indian Sign Language video for ' + activeQuery} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
                    : <div className="max-w-lg space-y-3 px-6 text-white">
                      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10"><Hand size={30} /></span>
                      <p className="font-bold">{error ? 'The in-app video is unavailable.' : 'Choose a phrase to find its sign.'}</p>
                      {error && <p className="text-sm text-slate-300">{error.includes('YOUTUBE_API_KEY') ? 'The video search key is not configured for this installation.' : error.includes('API_KEY_IP_ADDRESS_BLOCKED') ? 'Google is blocking this key from the backend server’s IP address. Use the official dictionary below while the key restriction is corrected.' : 'You can still use the official dictionary below.'}</p>}
                    </div>}
              </div>
              {activeQuery && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                <span className="font-bold text-app-text-sub">Video search is restricted to the ISLRTC channel.</span>
                <a href={OFFICIAL_DICTIONARY} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-black text-ai-accent hover:underline">Open official dictionary <ExternalLink size={15} /></a>
              </div>}
            </Card>

            {lessonTranscript && <Card className="rounded-[2rem] border border-app-border p-6">
              <h3 className="mb-3 font-black text-app-text-main">Lesson text</h3>
              <p className="whitespace-pre-wrap leading-relaxed text-app-text-sub">{lessonTranscript}</p>
            </Card>}

            <Card className="rounded-[2rem] border border-app-border bg-ai-accent/5 p-6">
              <h3 className="mb-2 flex items-center gap-2 font-black text-app-text-main"><Sparkles size={18} className="text-ai-accent" /> Practice routine</h3>
              <ol className="list-inside list-decimal space-y-1 text-sm font-medium leading-relaxed text-app-text-sub">
                <li>Watch the signer’s handshape, movement, and facial expression.</li>
                <li>Pause and try the sign yourself, then replay to compare.</li>
                <li>Mark the phrase practiced when you are ready to revisit it later.</li>
              </ol>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
