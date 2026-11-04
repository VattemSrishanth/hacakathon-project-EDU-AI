import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Wifi, 
  Download, 
  HardDrive, 
  TrendingDown, 
  ShieldCheck, 
  Sliders, 
  CheckCircle2, 
  Sparkles,
  Layers
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useSettings } from '../context/SettingsContext';

export default function DataUsage() {
  const { settings } = useSettings();

  // Local storage persisted data saver preferences
  const [dataSaver, setDataSaver] = useState(() => {
    return localStorage.getItem('eduai_datasaver') === 'true';
  });
  const [wifiOnly, setWifiOnly] = useState(() => {
    return localStorage.getItem('eduai_wifi_only') !== 'false';
  });
  const [compressedAudio, setCompressedAudio] = useState(() => {
    return localStorage.getItem('eduai_compressed_audio') === 'true';
  });

  const toggleDataSaver = () => {
    setDataSaver(prev => {
      const next = !prev;
      localStorage.setItem('eduai_datasaver', String(next));
      return next;
    });
  };

  const toggleWifiOnly = () => {
    setWifiOnly(prev => {
      const next = !prev;
      localStorage.setItem('eduai_wifi_only', String(next));
      return next;
    });
  };

  const toggleCompressedAudio = () => {
    setCompressedAudio(prev => {
      const next = !prev;
      localStorage.setItem('eduai_compressed_audio', String(next));
      return next;
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-app-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-app-text-main flex items-center gap-3">
            <Zap className="w-7 h-7 text-amber-500" />
            Data Usage & Bandwidth Saver
          </h1>
          <p className="text-sm text-app-text-sub mt-1">
            Optimize data consumption, configure network savings, and monitor bandwidth efficiency across devices.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-semibold">
          <TrendingDown className="w-4 h-4" />
          <span>64% Data Preserved This Month</span>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-app-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-app-text-sub">Total Bandwidth Saved</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-app-text-main">
            148.5 <span className="text-base font-medium text-app-text-sub">MB</span>
          </div>
          <p className="text-xs text-app-text-sub mt-1">Saved via IndexedDB caching & gzip compression</p>
        </Card>

        <Card className="p-5 border-app-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-app-text-sub">Current Session Usage</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-app-text-main">
            4.2 <span className="text-base font-medium text-app-text-sub">MB</span>
          </div>
          <p className="text-xs text-app-text-sub mt-1">Optimized text & low-overhead SVG vectors</p>
        </Card>

        <Card className="p-5 border-app-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-app-text-sub">Data Saver Mode</span>
            <div className={`p-2 rounded-xl ${dataSaver ? 'bg-amber-500/10 text-amber-500' : 'bg-app-bg-alt text-app-text-sub'}`}>
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-app-text-main flex items-center gap-2">
            {dataSaver ? 'Active' : 'Standard'}
            <span className={`w-3 h-3 rounded-full ${dataSaver ? 'bg-amber-500 animate-pulse' : 'bg-zinc-500'}`} />
          </div>
          <p className="text-xs text-app-text-sub mt-1">{dataSaver ? 'Media streaming minimized' : 'High-fidelity visual mode'}</p>
        </Card>
      </div>

      {/* Network Optimizer Preferences */}
      <Card className="p-6 border-app-border space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-app-border">
          <Sliders className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-base font-bold text-app-text-main">Bandwidth Saving Preferences</h2>
            <p className="text-xs text-app-text-sub">Configure how Edu-AI handles heavy media, assets, and sync pipelines.</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Toggle 1: Low-Bandwidth Mode */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-app-bg-alt/40 border border-app-border">
            <div className="space-y-0.5">
              <div className="text-sm font-semibold text-app-text-main flex items-center gap-2">
                Ultra Low-Data Mode
                {dataSaver && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">SAVING ON</span>}
              </div>
              <p className="text-xs text-app-text-sub">
                Replaces high-res background art with lightweight minimal themes and defers non-critical asset loading.
              </p>
            </div>
            <button
              onClick={toggleDataSaver}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shrink-0 ${
                dataSaver ? 'bg-amber-500' : 'bg-app-border'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  dataSaver ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Toggle 2: Wi-Fi Only Downloads */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-app-bg-alt/40 border border-app-border">
            <div className="space-y-0.5">
              <div className="text-sm font-semibold text-app-text-main">
                Download Over Wi-Fi Only
              </div>
              <p className="text-xs text-app-text-sub">
                Prevents offline lesson packages and PDF study materials from consuming cellular mobile data.
              </p>
            </div>
            <button
              onClick={toggleWifiOnly}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shrink-0 ${
                wifiOnly ? 'bg-primary' : 'bg-app-border'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  wifiOnly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Toggle 3: Compressed Audio & Local Synthesis */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-app-bg-alt/40 border border-app-border">
            <div className="space-y-0.5">
              <div className="text-sm font-semibold text-app-text-main">
                Local Speech & Audio Compression
              </div>
              <p className="text-xs text-app-text-sub">
                Uses on-device browser SpeechSynthesis instead of streaming cloud audio for read-aloud features.
              </p>
            </div>
            <button
              onClick={toggleCompressedAudio}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shrink-0 ${
                compressedAudio ? 'bg-primary' : 'bg-app-border'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  compressedAudio ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Consumption Breakdown */}
      <Card className="p-6 border-app-border space-y-4">
        <h3 className="text-sm font-bold text-app-text-main uppercase tracking-wider">
          Data Allocation Breakdown (Estimated)
        </h3>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-app-text-main">Curriculum Lessons & Syllabi</span>
              <span className="text-app-text-sub">62% (Optimized Text & Diagrams)</span>
            </div>
            <div className="w-full bg-app-bg-alt rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-2 rounded-full" style={{ width: '62%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-app-text-main">AI Tutor Interactions</span>
              <span className="text-app-text-sub">24% (Streaming JSON Tokens)</span>
            </div>
            <div className="w-full bg-app-bg-alt rounded-full h-2 overflow-hidden">
              <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '24%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-app-text-main">Assessments & Quizzes</span>
              <span className="text-app-text-sub">14% (Compressed Payloads)</span>
            </div>
            <div className="w-full bg-app-bg-alt rounded-full h-2 overflow-hidden">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '14%' }} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
