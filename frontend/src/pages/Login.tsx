import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { authAPI } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await authAPI.login(email, password);
      if (response?.success) {
        login({ token: response?.token, user: response?.user });
        setSuccessMessage('Login successful!');
        navigate('/', { replace: true });
      } else {
        setErrorMessage(response?.error || 'Login failed. Please try again.');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      const message =
        err?.response?.data?.error ||
        err?.message ||
        'Login failed. Please try again.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-app-text-main flex items-center justify-center py-12 px-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-500/10 text-blue-600 mb-6 shadow-sm ring-1 ring-blue-500/20">
            <LogIn className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-app-text-main tracking-tight uppercase">Welcome Back</h1>
          <p className="text-app-text-sub mt-3 font-bold uppercase text-xs tracking-widest">Sign in to your LearnBridge account</p>
        </div>

        <Card className="shadow-2xl border-app-border bg-app-bg-alt rounded-3xl overflow-hidden p-8">
          {errorMessage && (
            <div className="mb-6 rounded-2xl border-2 border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-600 font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 rounded-2xl border-2 border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-600 font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-black text-app-text-sub ml-1 uppercase tracking-widest">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-app-text-muted group-focus-within:text-blue-500 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-4 bg-app-bg border border-app-border text-app-text-main rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold shadow-sm placeholder:opacity-50 placeholder:text-app-text-muted"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-app-text-sub ml-1 uppercase tracking-widest">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-app-text-muted group-focus-within:text-blue-500 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-app-bg border border-app-border text-app-text-main rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold shadow-sm placeholder:opacity-50 placeholder:text-app-text-muted"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full py-5 rounded-2xl shadow-xl shadow-blue-500/20 text-sm font-black uppercase tracking-widest" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In Now'}
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-app-border text-center">
            <p className="text-app-text-sub text-xs font-bold uppercase tracking-widest">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-blue-600 font-black hover:text-blue-700 transition-colors ml-1 underline decoration-2 underline-offset-4">
                Create One
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
