import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserPlus, 
  Mail, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  ChevronDown,
  User
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { authAPI } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import type { SupportedLanguage } from '../i18n/translations';
import type { UserRole } from '../context/AuthContext';

const Register = () => {
  const { settings, updateLearning, updateThemeAccessibility } = useSettings();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [preferredLanguage, setPreferredLanguage] = useState<SupportedLanguage>(settings.learning.language);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const languageOptions = useMemo<SupportedLanguage[]>(
    () => ['English', 'Telugu', 'Hindi', 'Spanish', 'French'],
    []
  );

  const roleOptions: { label: string; value: UserRole }[] = [
    { label: 'Student', value: 'student' },
    { label: 'Teacher', value: 'teacher' },
    { label: 'Parent', value: 'parent' },
    { label: 'Admin (restricted)', value: 'admin' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Persist preferred language immediately so the whole app switches right after signup.
      updateLearning({ language: preferredLanguage });
      updateThemeAccessibility({ voiceLanguage: preferredLanguage });

      const response = await authAPI.register(name, email, password, role);
      if (response?.success) {
        setSuccessMessage('Registration successful! You can now sign in.');
        setName('');
        setEmail('');
        setPassword('');
      } else {
        setErrorMessage(response?.error || 'Registration failed. Please try again.');
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        error?.message ||
        'Registration failed. Please try again.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-app-text-main flex items-center justify-center py-12 px-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 mb-6 shadow-sm ring-1 ring-primary/20">
            <UserPlus size={40} className="text-primary" />
          </div>
          <h1 className="text-4xl font-black text-app-text-main tracking-tight uppercase">Create Account</h1>
          <p className="text-app-text-sub mt-3 font-bold uppercase text-xs tracking-widest">Join the LearnBridge community today</p>
        </div>

        <Card className="shadow-2xl border-app-border bg-app-bg-alt rounded-3xl overflow-hidden p-8">
          {errorMessage && (
            <div className="mb-6 rounded-2xl border-2 border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-600 font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="shrink-0"><AlertCircle size={20} /></div>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 rounded-2xl border-2 border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-600 font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="shrink-0"><CheckCircle size={20} /></div>
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-black text-app-text-sub ml-1 uppercase tracking-widest">I am a...</label>
              <div className="relative group">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full pl-10 pr-10 py-4 bg-app-bg border border-app-border text-app-text-main rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold shadow-sm appearance-none"
                >
                  {roleOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <User size={18} className="text-primary" />
                </div>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-app-text-muted">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-app-text-sub ml-1 uppercase tracking-widest">Preferred Language</label>
              <div className="relative group">
                <select
                  value={preferredLanguage}
                  onChange={(e) => {
                    const lang = e.target.value as SupportedLanguage;
                    setPreferredLanguage(lang);
                    updateLearning({ language: lang });
                    updateThemeAccessibility({ voiceLanguage: lang });
                  }}
                  className="w-full pl-4 pr-10 py-4 bg-app-bg border border-app-border text-app-text-main rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold shadow-sm appearance-none"
                >
                  {languageOptions.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-app-text-muted">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-app-text-sub ml-1 uppercase tracking-widest">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserPlus size={20} className="text-primary group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-app-bg border border-app-border text-app-text-main rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold shadow-sm placeholder:opacity-50 placeholder:text-app-text-muted"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-app-text-sub ml-1 uppercase tracking-widest">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={20} className="text-primary group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-app-bg border border-app-border text-app-text-main rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold shadow-sm placeholder:opacity-50 placeholder:text-app-text-muted"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-app-text-sub ml-1 uppercase tracking-widest">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={20} className="text-primary group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-app-bg border border-app-border text-app-text-main rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold shadow-sm placeholder:opacity-50 placeholder:text-app-text-muted"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full py-5 rounded-2xl shadow-xl shadow-indigo-500/20 text-sm font-black uppercase tracking-widest" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account Now'}
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-app-border text-center">
            <p className="text-app-text-sub text-xs font-bold uppercase tracking-widest">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 font-black hover:text-indigo-700 transition-colors ml-1 underline decoration-2 underline-offset-4">
                Sign In
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;
