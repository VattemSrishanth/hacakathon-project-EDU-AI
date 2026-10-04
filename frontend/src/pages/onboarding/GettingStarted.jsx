import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Settings as SettingsIcon,
  Palette,
  Check,
  User,
  Ear,
  Eye,
  MessageSquare,
  Globe
} from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';

const GettingStarted = () => {
  const navigate = useNavigate();
  const { settings, updateLearning, updateThemeAccessibility } = useSettings();
  const { updateAccessibility } = useAccessibility();

  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Local state for setup
  const [board, setBoard] = useState(settings.learning.board || 'NCERT');
  const [grade, setGrade] = useState(settings.learning.level || 'Intermediate');
  const [language, setLanguage] = useState(settings.learning.language || 'English');
  const [accessMode, setAccessMode] = useState(settings.themeAccessibility.accessibilityMode || 'Normal');
  const [theme, setTheme] = useState(settings.themeAccessibility.theme || 'Crystal Light');

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(prev => prev + 1);
    } else {
      // Finalize and save
      updateLearning({ board, level: grade, language });
      updateThemeAccessibility({ theme, accessibilityMode: accessMode });
      
      // Update specific accessibility context flags
      switch (accessMode) {
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
            captionsEnabled: true,
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
      
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-app-text-main flex flex-col items-center justify-center px-4 py-12 transition-colors duration-500 font-sans">
      <div className="max-w-xl w-full space-y-8 animate-in fade-in zoom-in duration-500">
        
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between border-b border-app-border pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
              {step}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-app-text-muted">
              Step {step} of {totalSteps}
            </span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-350 ${
                  i + 1 === step ? 'w-6 bg-primary' : 'w-2 bg-app-border'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content Wizard Body */}
        <div className="min-h-96">
          {step === 1 && (
            <div className="space-y-6 text-center py-6">
              <div className="relative inline-flex items-center justify-center mx-auto">
                <div className="absolute w-24 h-24 bg-primary/10 rounded-full animate-ping" />
                <div className="w-16 h-16 bg-primary text-white rounded-3xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <Sparkles size={32} />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight uppercase">Welcome to Edu AI</h2>
                <p className="text-app-text-sub font-medium leading-relaxed max-w-sm mx-auto">
                  A personalized, inclusive learning platform optimized for students of all abilities. Let's customize your workspace.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-xl font-black uppercase flex items-center gap-2">
                  <BookOpen className="text-primary" size={20} />
                  Curriculum & Grade
                </h3>
                <p className="text-xs font-bold text-app-text-muted uppercase tracking-widest">
                  Configure your syllabus structure and primary language
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-app-text-sub uppercase tracking-widest ml-1">Education Board</label>
                  <select
                    value={board}
                    onChange={(e) => setBoard(e.target.value)}
                    className="w-full bg-app-bg-alt border border-app-border rounded-xl px-4 py-3 text-app-text-main outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                  >
                    <option value="NCERT">NCERT (National)</option>
                    <option value="Telangana">Telangana Board (TSBIE)</option>
                    <option value="Andhra Pradesh">Andhra Pradesh Board (BIEAP)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-app-text-sub uppercase tracking-widest ml-1">Grade Level</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full bg-app-bg-alt border border-app-border rounded-xl px-4 py-3 text-app-text-main outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                  >
                    <option value="Beginner">Beginner (Class 1-4)</option>
                    <option value="Intermediate">Intermediate (Class 5-8)</option>
                    <option value="Advanced">Advanced (Class 9-10)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-app-text-sub uppercase tracking-widest ml-1">Primary Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-app-bg-alt border border-app-border rounded-xl px-4 py-3 text-app-text-main outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                  >
                    <option value="English">English</option>
                    <option value="Telugu">తెలుగు (Telugu)</option>
                    <option value="Hindi">हिंदी (Hindi)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-xl font-black uppercase flex items-center gap-2">
                  <SettingsIcon className="text-primary" size={20} />
                  Accessibility Mode
                </h3>
                <p className="text-xs font-bold text-app-text-muted uppercase tracking-widest">
                  Enable assistive tools to optimize your viewing/interaction styles
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'Normal', label: 'Normal Mode', desc: 'Standard visual layout.', icon: User },
                  { id: 'Deaf', label: 'Deaf Mode', desc: 'Captions & transcripts active.', icon: Ear },
                  { id: 'Dumb', label: 'Dumb Mode', desc: 'Sign Language helper panels.', icon: MessageSquare },
                  { id: 'Blind', label: 'Blind Mode', desc: 'Screen narrator & contrast enabled.', icon: Eye }
                ].map(mode => (
                  <Card
                    key={mode.id}
                    onClick={() => setAccessMode(mode.id)}
                    className={`p-6 border-2 text-left relative cursor-pointer hover:border-primary/50 transition-all rounded-2xl ${
                      accessMode === mode.id ? 'border-primary bg-primary/5' : 'border-app-border bg-app-bg-alt'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <mode.icon size={18} />
                      <span className="text-sm font-black uppercase">{mode.label}</span>
                    </div>
                    <p className="text-[11px] text-app-text-sub leading-normal font-bold">{mode.desc}</p>
                    {accessMode === mode.id && (
                      <span className="absolute top-4 right-4 text-primary">
                        <Check size={16} />
                      </span>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-xl font-black uppercase flex items-center gap-2">
                  <Palette className="text-primary" size={20} />
                  Visual Theme
                </h3>
                <p className="text-xs font-bold text-app-text-muted uppercase tracking-widest">
                  Choose a style scheme that fits your learning environment
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-80 overflow-y-auto pr-1">
                {[
                  { id: 'Crystal Light', desc: 'Pristine white and cyan theme.' },
                  { id: 'Crystal Glass', desc: 'Light glass elements with rich glowing gradients.' },
                  { id: 'Glass Frost', desc: 'Frosted glass elements with rich radial glows.' },
                  { id: 'Midnight Void', desc: 'Sleek space cadet navy & blue.' },
                  { id: 'Harry Potter', desc: 'Cinematic gold and black magic.' }
                ].map(item => (
                  <Card
                    key={item.id}
                    onClick={() => setTheme(item.id)}
                    className={`p-5 border-2 text-left relative cursor-pointer hover:border-primary/50 transition-all rounded-2xl ${
                      theme === item.id ? 'border-primary bg-primary/5' : 'border-app-border bg-app-bg-alt'
                    }`}
                  >
                    <h4 className="text-xs font-black uppercase text-app-text-main">{item.id}</h4>
                    <p className="text-[10px] text-app-text-muted mt-1 leading-normal font-bold">{item.desc}</p>
                    {theme === item.id && (
                      <span className="absolute top-4 right-4 text-primary">
                        <Check size={16} />
                      </span>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 text-center py-6">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-md">
                <Check size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase">Configuration Saved</h3>
                <p className="text-app-text-sub font-medium leading-relaxed max-w-sm mx-auto">
                  Your customized setup is active. Welcome to your virtual Command Center. Let's begin studying!
                </p>
              </div>

              {/* Selection summary */}
              <div className="max-w-xs mx-auto border border-app-border bg-app-bg-alt rounded-2xl p-4 text-left space-y-1.5 text-[11px] font-bold text-app-text-sub uppercase tracking-wider">
                <div className="flex justify-between">
                  <span>Curriculum:</span>
                  <span className="text-primary font-black">{board} ({grade})</span>
                </div>
                <div className="flex justify-between">
                  <span>Language:</span>
                  <span className="text-primary font-black">{language}</span>
                </div>
                <div className="flex justify-between">
                  <span>Accessibility:</span>
                  <span className="text-primary font-black">{accessMode}</span>
                </div>
                <div className="flex justify-between">
                  <span>Workspace Style:</span>
                  <span className="text-primary font-black">{theme}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Nav Actions */}
        <div className="flex justify-between pt-6 border-t border-app-border">
          {step > 1 ? (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-4"
            >
              <ArrowLeft size={14} /> Back
            </Button>
          ) : (
            <div />
          )}

          <Button
            variant="primary"
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-4 shadow-lg shadow-primary/20"
          >
            {step === totalSteps ? 'Launch Dashboard' : 'Next'} <ArrowRight size={14} />
          </Button>
        </div>

      </div>
    </div>
  );
};

export default GettingStarted;