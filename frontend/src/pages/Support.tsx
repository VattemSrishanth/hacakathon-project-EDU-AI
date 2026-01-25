import { useSettings } from '../context/SettingsContext';
import { Mail, Phone, LifeBuoy, BookOpen, ExternalLink, MessageCircle } from 'lucide-react';

const Support = () => {
  const { t } = useSettings();
  
  return (
    <div className="min-h-screen bg-app-bg-alt py-12 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6 shadow-lg shadow-primary/5">
            <LifeBuoy size={40} className="animate-spin-slow" />
          </div>
          <h1 className="text-4xl font-black text-app-text-main tracking-tight mb-4">{t.support.title}</h1>
          <p className="text-app-text-sub font-medium max-w-xl mx-auto leading-relaxed">{t.support.subtitle}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Help Center */}
          <div className="group rounded-3xl bg-app-bg border border-app-border shadow-2xl p-8 hover:border-primary/50 transition-all duration-300">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
              <BookOpen size={24} />
            </div>
            <h2 className="text-xl font-black text-app-text-main mb-3 tracking-tight">{t.support.helpCenter}</h2>
            <p className="text-app-text-sub text-sm font-medium leading-relaxed mb-6">
              {t.support.helpCenterDesc}
            </p>
            <button className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest hover:gap-3 transition-all">
              Browse Articles <ExternalLink size={14} />
            </button>
          </div>

          {/* Contact Info */}
          <div className="group rounded-3xl bg-app-bg border border-app-border shadow-2xl p-8 hover:border-emerald-500/50 transition-all duration-300">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
              <MessageCircle size={24} />
            </div>
            <h2 className="text-xl font-black text-app-text-main mb-3 tracking-tight">{t.support.contactUs}</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-app-bg-alt rounded-lg flex items-center justify-center text-app-text-muted">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-app-text-muted">Email</p>
                  <p className="text-sm font-bold text-app-text-main">sheelamrahulreddy18@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-app-bg-alt rounded-lg flex items-center justify-center text-app-text-muted">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-app-text-muted">Phone</p>
                  <p className="text-sm font-bold text-app-text-main">+91-90100-01281</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center p-8 bg-primary/3 rounded-3xl border border-primary/10">
          <p className="text-sm font-bold text-app-text-sub">
            Available 24/7 for Enterprise users. Standard support hours: Mon-Fri, 9am-6pm IST.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Support;
