import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShieldCheck,
  Mail,
  Lock,
  AlertCircle,
  Globe,
  ChevronDown,
  Eye,
  EyeOff } from
"lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { useOffline } from "../context/OfflineContext";
import Button from "../components/Button";
import { authAPI } from "../services/api";


import { auth as firebaseAuth, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, continueAsGuest } = useAuth();
  const { isOffline } = useOffline();
  const { settings, updateLearning } = useSettings();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const role = "student";
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [devCreds, setDevCreds] = useState({
    student: { email: "student@eduai.com", password: "student123" },
    teacher: { email: "teacher@eduai.com", password: "teacher123" },
    parent: { email: "parent@eduai.com", password: "parent123" },
    admin: { email: "admin@eduai.com", password: "admin123" }
  });

  useEffect(() => {
    const fetchDevCreds = async () => {
      try {
        const res = await authAPI.getDevCredentials();
        if (res?.success && res?.credentials) {
          setDevCreds(res.credentials);
        }
      } catch (err) {
        console.log("Using default developer credentials", err);
      }
    };
    fetchDevCreds();
  }, []);

  useEffect(() => {
    if (location.state?.message) {
      setErrorMessage(location.state.message);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      if (isOffline) {
        setErrorMessage("Internet connection required for login. Please check your connection.");
        setLoading(false);
        return;
      }
      const response = await authAPI.login(email, password);
      // Backend should return role, or we use the selected one if backend doesn't support it yet
      if (response?.success) {
        login({
          token: response?.token,
          user: { ...response?.user, role: response?.user?.role || role }
        });
        navigate("/", { replace: true });
      } else {
        setErrorMessage(response?.error || "Login failed. Please try again.");
      }
    } catch (error) {
      const message =
      error?.response?.data?.error ||
      error?.message ||
      "Login failed. Please try again.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    continueAsGuest();
    navigate("/", { replace: true });
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const user = result.user;

      login({
        token: await user.getIdToken(),
        user: {
          name: user.displayName || "Google User",
          email: user.email || "",
          avatarUrl: user.photoURL || "",
          id: user.uid,
          role: role // Use the selected role for Google Login
        }
      });

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Auth Error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        setErrorMessage("Login cancelled.");
      } else {
        setErrorMessage(`Google Login failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-app-text-main flex items-center justify-center py-12 px-4 transition-colors duration-300 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-ai-accent/5 rounded-full blur-[120px] animate-pulse delay-1000" />
      
      <div className="w-full max-w-xl relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-app-bg border-2 border-primary shadow-inst mb-8 transition-transform hover:scale-110">
            <ShieldCheck size={48} className="text-primary" />
          </div>
          <h1 className="text-5xl font-black text-primary tracking-tighter uppercase italic">
            WELCOME BACK
          </h1>
          <p className="text-primary mt-3 font-black underline decoration-primary/50 underline-offset-8 uppercase text-xs tracking-[0.3em]">
            SIGN IN TO YOUR ACCOUNT
          </p>
        </div>

        <div className="bg-app-bg border-2 border-app-border rounded-[2.5rem] overflow-hidden p-10 shadow-inst relative">
          {/* Subtle Accent Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          

          <div className="mb-8">
            <div className="relative group">
              <select
                value={settings.learning.language}
                onChange={(e) => updateLearning({ language: e.target.value })}
                className="w-full pl-12 pr-10 py-4 bg-gray-50 border-2 border-gray-100 text-[11px] font-black text-gray-700 uppercase tracking-widest rounded-2xl focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer">
                
                <option value="English">English</option>
                <option value="Telugu">Telugu</option>
                <option value="Hindi">Hindi</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Globe size={18} className="text-primary" />
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-transform group-focus-within:rotate-180">
                <ChevronDown size={18} className="text-gray-400" />
              </div>
            </div>
          </div>

          {errorMessage &&
          <div className="mb-8 rounded-2xl border-2 border-red-500/20 bg-red-500/10 px-6 py-4 text-xs text-red-500 font-black uppercase tracking-widest flex items-center gap-4 animate-shake">
              <AlertCircle size={20} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          }

          <div className="mb-8">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-5 bg-white border-2 border-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-4 hover:border-primary/20 transition-all text-gray-700 active:scale-95">
              
              <FcGoogle size={20} />
              Continue with Google
            </button>
          </div>

          <div className="mb-8 p-6 bg-primary/5 rounded-3xl border border-primary/20 space-y-4">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-widest text-center">
              Developer Quick Login
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.keys(devCreds).map((roleKey) => {
                const creds = devCreds[roleKey];
                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={async () => {
                      setEmail(creds.email);
                      setPassword(creds.password);
                      setLoading(true);
                      setErrorMessage("");
                      try {
                        const response = await authAPI.login(creds.email, creds.password);
                        if (response?.success) {
                          login({
                            token: response?.token,
                            user: { ...response?.user, role: response?.user?.role || roleKey }
                          });
                          navigate("/", { replace: true });
                        } else {
                          setErrorMessage(response?.error || "Login failed.");
                        }
                      } catch (error) {
                        setErrorMessage(error?.response?.data?.error || error?.message || "Login failed.");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="py-3 px-2 bg-white border border-gray-200 hover:border-primary rounded-xl text-[9px] font-black uppercase text-center tracking-wider text-gray-700 hover:text-primary transition-all active:scale-95 shadow-sm">
                    {roleKey}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">or use email</span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-gray-500 ml-1 uppercase tracking-[0.2em]">
                Identity Handle (Email)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Mail size={20} className="text-primary group-focus-within:animate-pulse" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@nexus.ai"
                  className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-gray-100 text-gray-900 rounded-2xl focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-bold placeholder:text-gray-400"
                  required />
                
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end mb-1">
                <label className="block text-[10px] font-black text-gray-500 ml-1 uppercase tracking-[0.2em]">
                  Security Protocol (Password)
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Lock size={20} className="text-primary group-focus-within:animate-pulse" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  className="w-full pl-14 pr-14 py-5 bg-gray-50 border-2 border-gray-100 text-gray-900 rounded-2xl focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-bold placeholder:text-gray-400"
                  required />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-primary transition-colors">
                  
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="text-right">
                <Link to="/forgot-password" virtual-link="true" className="text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors hover:underline">
                  Reset Credentials
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className={`
                w-full py-6 rounded-2xl text-xs font-black uppercase tracking-[0.3em] transition-all
                bg-primary border-2 border-primary text-white hover:bg-primary/90 hover:shadow-inst
                disabled:opacity-30 disabled:pointer-events-none
              `}
              disabled={loading || isOffline}>
              
              {loading ? "INITIALIZING..." : isOffline ? "NETWORK OFFLINE" : "AUTHORIZE ACCESS"}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t-2 border-gray-100 flex flex-col gap-4">
            <button
              type="button"
              onClick={handleGuestMode}
              className="w-full py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors">
              
              Proceed as Anonymous Guest
            </button>
          </div>

          <div className="mt-10 text-center">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              New to the Nexus?{" "}
              <Link to="/register" className="text-primary font-black hover:underline ml-2">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>);

};

export default Login;