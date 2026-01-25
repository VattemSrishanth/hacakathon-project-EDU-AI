import Card from '../components/Card';
import { useSettings } from '../context/SettingsContext';
import type { AccessibilityMode } from '../context/SettingsContext';
import { 
  Check, 
  Eye, 
  EyeOff, 
  VolumeX, 
  MicOff, 
  ShieldCheck, 
  Zap, 
  Globe, 
  MessageSquare,
  Accessibility as AccessibilityIcon,
  CheckCircle2
} from 'lucide-react';

const Accessibility = () => {
  const { settings, updateThemeAccessibility } = useSettings();

  const modes: { id: AccessibilityMode; label: string; desc: string; icon: any; color: string }[] = [
    { id: 'Normal', label: 'Normal Mode', desc: 'Standard interface for all users.', icon: ShieldCheck, color: 'primary' },
    { id: 'Deaf', label: 'Deaf Mode', desc: 'Enhanced visual indicators and captions.', icon: VolumeX, color: 'blue' },
    { id: 'Dumb', label: 'Dumb Mode', desc: 'Communication tools for non-verbal users.', icon: MicOff, color: 'emerald' },
    { id: 'Blind', label: 'Blind Mode', desc: 'Screen reader and voice-guided optimization.', icon: EyeOff, color: 'amber' }
  ];

  return (
    <div className="min-h-screen bg-app-bg-alt py-12 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <AccessibilityIcon size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-app-text-main tracking-tight">Accessibility</h1>
              <p className="text-app-text-sub font-bold uppercase tracking-widest text-xs mt-1">Our commitment to inclusive learning</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => updateThemeAccessibility({ accessibilityMode: mode.id })}
              className={`
                group p-8 rounded-3xl border-2 transition-all duration-300 text-left relative overflow-hidden bg-app-bg shadow-lg
                ${settings.themeAccessibility.accessibilityMode === mode.id
                  ? 'border-primary ring-4 ring-primary/10 scale-[1.02]'
                  : 'border-app-border hover:border-primary/50 grayscale hover:grayscale-0'
                }
              `}
            >
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors
                ${settings.themeAccessibility.accessibilityMode === mode.id ? 'bg-primary text-white' : 'bg-app-bg-alt text-app-text-muted group-hover:bg-primary/10 group-hover:text-primary'}
              `}>
                <mode.icon size={24} />
              </div>
              
              <h3 className={`text-xl font-black tracking-tight mb-2 ${
                settings.themeAccessibility.accessibilityMode === mode.id ? 'text-app-text-main' : 'text-app-text-sub'
              }`}>
                {mode.label}
              </h3>
              <p className="text-sm font-medium text-app-text-muted leading-relaxed">
                {mode.desc}
              </p>

              {settings.themeAccessibility.accessibilityMode === mode.id && (
                <div className="absolute top-4 right-4 text-primary animate-in fade-in zoom-in">
                  <CheckCircle2 size={24} fill="currentColor" className="text-primary bg-white rounded-full border-2 border-primary" />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="p-8 bg-app-bg border border-app-border shadow-xl rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                <Eye size={20} />
              </div>
              <h2 className="text-lg font-black text-app-text-main tracking-tight">Visual Support</h2>
            </div>
            <ul className="space-y-4">
              {['High contrast themes', 'Adjustable text sizes', 'Screen reader support', 'Focus indicators'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-app-text-sub font-bold text-sm">
                  <Check size={16} className="text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-8 bg-app-bg border border-app-border shadow-xl rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                <Zap size={20} />
              </div>
              <h2 className="text-lg font-black text-app-text-main tracking-tight">Performance</h2>
            </div>
            <ul className="space-y-4">
              {['Reduced motion', 'Low bandwidth optimization', 'Fast loading times', 'Resource conservation'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-app-text-sub font-bold text-sm">
                  <Check size={16} className="text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-8 bg-app-bg border border-app-border shadow-xl rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                <Globe size={20} />
              </div>
              <h2 className="text-lg font-black text-app-text-main tracking-tight">Localization</h2>
            </div>
            <ul className="space-y-4">
              {['Multiple languages', 'Regional formats', 'Cultural relevance', 'Translatable content'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-app-text-sub font-bold text-sm">
                  <Check size={16} className="text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-8 bg-app-bg border border-app-border shadow-xl rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <MessageSquare size={20} />
              </div>
              <h2 className="text-lg font-black text-app-text-main tracking-tight">Feedback</h2>
            </div>
            <p className="text-sm font-medium text-app-text-sub leading-relaxed mb-6">
              We continuously improve our platform based on community feedback and inclusive design principles.
            </p>
            <button className="w-full py-3 bg-app-bg-alt border border-app-border rounded-xl text-xs font-black uppercase tracking-widest text-app-text-main hover:bg-app-border transition-colors">
              Contact Support
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Accessibility;
