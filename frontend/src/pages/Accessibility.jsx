import {
  User,
  Ear,
  MessageSquare,
  Eye,
  Accessibility as AccessibilityIcon,
  CheckCircle2,
  Lightbulb,
  Globe,
  MessageCircle } from
'lucide-react';
import Card from '../components/Card';
import { useSettings } from '../context/SettingsContext';
import { useAccessibility } from '../context/AccessibilityContext';


const Accessibility = () => {
  const { settings, updateThemeAccessibility } = useSettings();
  const {
    updateAccessibility
  } = useAccessibility();

  const handleModeChange = (modeId) => {
    // First update the theme mode
    updateThemeAccessibility({ accessibilityMode: modeId });

    // Then update the specific flags based on the mode
    switch (modeId) {
      case 'Normal':
        updateAccessibility({
          signLanguageEnabled: false,
          captionsEnabled: false,
          speechAssistEnabled: false,
          highContrastEnabled: false,
          largeTextEnabled: false
        });
        break;
      case 'Deaf':
        updateAccessibility({
          signLanguageEnabled: false,
          captionsEnabled: true,
          speechAssistEnabled: false,
          highContrastEnabled: false,
          largeTextEnabled: false
        });
        break;
      case 'Dumb':
        updateAccessibility({
          signLanguageEnabled: true,
          captionsEnabled: true, // Also enable captions for better accessibility in sign mode
          speechAssistEnabled: false,
          highContrastEnabled: false,
          largeTextEnabled: false
        });
        break;
      case 'Blind':
        updateAccessibility({
          signLanguageEnabled: false,
          captionsEnabled: false,
          speechAssistEnabled: true,
          highContrastEnabled: true,
          largeTextEnabled: true
        });
        break;
    }
  };

  const modes = [
  { id: 'Normal', label: 'Normal Mode', desc: 'Standard interface for all users.', icon: User, color: 'primary' },
  { id: 'Deaf', label: 'Deaf Mode', desc: 'Enhanced visual indicators and captions.', icon: Ear, color: 'primary' },
  { id: 'Dumb', label: 'Dumb Mode', desc: 'Communication tools for non-verbal users.', icon: MessageSquare, color: 'secondary' },
  { id: 'Blind', label: 'Blind Mode', desc: 'Screen reader and voice-guided optimization.', icon: Eye, color: 'secondary' }];


  return (
    <div className="min-h-screen bg-app-bg py-12 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <AccessibilityIcon size={32} className="text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-app-text-main tracking-tight">Accessibility</h1>
              <p className="text-app-text-sub font-bold uppercase tracking-widest text-xs mt-1">Our commitment to inclusive learning</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {modes.map((mode) =>
          <button
            key={mode.id}
            onClick={() => handleModeChange(mode.id)}
            className={`
                group p-8 rounded-3xl border-2 transition-all duration-300 text-left relative overflow-hidden bg-app-bg shadow-lg
                ${settings.themeAccessibility.accessibilityMode === mode.id ?
            'border-primary ring-4 ring-primary/10 scale-[1.02]' :
            'border-app-border hover:border-primary/50 grayscale hover:grayscale-0'}
              `
            }>
            
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors
                ${settings.themeAccessibility.accessibilityMode === mode.id ? 'bg-primary text-white' : 'bg-app-bg-alt text-app-text-muted group-hover:bg-primary/10'}
              `}>
                <mode.icon size={28} />
              </div>
              
              <h3 className={`text-xl font-black tracking-tight mb-2 ${
            settings.themeAccessibility.accessibilityMode === mode.id ? 'text-app-text-main' : 'text-app-text-sub'}`
            }>
                {mode.label}
              </h3>
              <p className="text-sm font-medium text-app-text-muted leading-relaxed">
                {mode.desc}
              </p>

              {settings.themeAccessibility.accessibilityMode === mode.id &&
            <div className="absolute top-4 right-4 animate-in fade-in zoom-in text-primary">
                  <CheckCircle2 size={24} />
                </div>
            }
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="p-8 bg-app-bg border border-app-border shadow-inst rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <Eye size={24} />
              </div>
              <h2 className="text-lg font-black text-app-text-main tracking-tight">Visual Support</h2>
            </div>
            <ul className="space-y-4">
              {['High contrast themes', 'Adjustable text sizes', 'Screen reader support', 'Focus indicators'].map((item) =>
              <li key={item} className="flex items-center gap-3 text-app-text-sub font-bold text-sm">
                  <CheckCircle2 size={16} className="text-primary" />
                  {item}
                </li>
              )}
            </ul>
          </Card>

          <Card className="p-8 bg-app-bg border border-app-border shadow-inst rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
                <Lightbulb size={24} />
              </div>
              <h2 className="text-lg font-black text-app-text-main tracking-tight">Performance</h2>
            </div>
            <ul className="space-y-4">
              {['Reduced motion', 'Low bandwidth optimization', 'Fast loading times', 'Resource conservation'].map((item) =>
              <li key={item} className="flex items-center gap-3 text-app-text-sub font-bold text-sm">
                  <CheckCircle2 size={16} className="text-primary" />
                  {item}
                </li>
              )}
            </ul>
          </Card>

          <Card className="p-8 bg-app-bg border border-app-border shadow-inst rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
                <Globe size={24} />
              </div>
              <h2 className="text-lg font-black text-app-text-main tracking-tight">Localization</h2>
            </div>
            <ul className="space-y-4">
              {['Multiple languages', 'Regional formats', 'Cultural relevance', 'Translatable content'].map((item) =>
              <li key={item} className="flex items-center gap-3 text-app-text-sub font-bold text-sm">
                  <CheckCircle2 size={16} className="text-primary" />
                  {item}
                </li>
              )}
            </ul>
          </Card>

          <Card className="p-8 bg-app-bg border border-app-border shadow-inst rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <MessageCircle size={24} />
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
    </div>);

};

export default Accessibility;