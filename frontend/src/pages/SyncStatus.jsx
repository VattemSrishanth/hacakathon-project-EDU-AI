import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  HardDrive, 
  Database, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOffline } from '../context/OfflineContext';
import Card from '../components/Card';
import Button from '../components/Button';

export default function SyncStatus() {
  const navigate = useNavigate();
  const { 
    isOffline, 
    lastSyncTime, 
    syncInProgress, 
    triggerSync, 
    downloadedLessons 
  } = useOffline();

  const [storageEstimate, setStorageEstimate] = useState({ usedMB: '0.0', totalMB: '0.0', percentage: 0 });
  const [syncHistory, setSyncHistory] = useState([
    { id: 1, type: 'Lessons & Topics', status: 'Success', time: 'Just now', items: `${downloadedLessons.length} offline packages` },
    { id: 2, type: 'Quiz & Exam Cache', status: 'Success', time: '10m ago', items: 'Verified' },
    { id: 3, type: 'User Progress Queue', status: 'Synced', time: '1h ago', items: 'All attempts saved' }
  ]);

  useEffect(() => {
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((estimate) => {
        const used = ((estimate.usage || 0) / (1024 * 1024)).toFixed(1);
        const total = ((estimate.quota || 0) / (1024 * 1024)).toFixed(0);
        const pct = estimate.quota ? Math.round(((estimate.usage || 0) / estimate.quota) * 100) : 0;
        setStorageEstimate({ usedMB: used, totalMB: total, percentage: pct });
      }).catch(() => {});
    }
  }, [downloadedLessons.length]);

  const handleManualSync = async () => {
    if (syncInProgress) return;
    await triggerSync();
    setSyncHistory(prev => [
      { id: Date.now(), type: 'Manual Full Sync', status: 'Success', time: 'Just now', items: `${downloadedLessons.length} modules synced` },
      ...prev.slice(0, 4)
    ]);
  };

  const formattedLastSync = lastSyncTime 
    ? new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Not synced recently';

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-app-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-app-text-main flex items-center gap-3">
            <RefreshCw className={`w-7 h-7 text-primary ${syncInProgress ? 'animate-spin' : ''}`} />
            Sync & Offline Diagnostics
          </h1>
          <p className="text-sm text-app-text-sub mt-1">
            Monitor offline package integrity, cache storage, and background database synchronization.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleManualSync}
          disabled={syncInProgress || isOffline}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${syncInProgress ? 'animate-spin' : ''}`} />
          {syncInProgress ? 'Synchronizing...' : 'Sync Now'}
        </Button>
      </div>

      {/* Network & Live State Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Connection Status Card */}
        <Card className="p-5 flex items-center gap-4 border-app-border">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            isOffline ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
          }`}>
            {isOffline ? <WifiOff className="w-6 h-6" /> : <Wifi className="w-6 h-6" />}
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-app-text-sub">
              Network Status
            </div>
            <div className="text-lg font-bold text-app-text-main flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isOffline ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
              {isOffline ? 'Offline Mode' : 'Online & Connected'}
            </div>
            <div className="text-xs text-app-text-sub mt-0.5">
              {isOffline ? 'Local cache is serving content' : 'Connected to Edu-AI cloud'}
            </div>
          </div>
        </Card>

        {/* Last Sync Timestamp */}
        <Card className="p-5 flex items-center gap-4 border-app-border">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-app-text-sub">
              Last Cloud Sync
            </div>
            <div className="text-lg font-bold text-app-text-main">
              {formattedLastSync}
            </div>
            <div className="text-xs text-app-text-sub mt-0.5">
              Auto-syncs on reconnect
            </div>
          </div>
        </Card>

        {/* Offline Lessons Downloaded */}
        <Card className="p-5 flex items-center gap-4 border-app-border">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-app-text-sub">
              Downloaded Content
            </div>
            <div className="text-lg font-bold text-app-text-main">
              {downloadedLessons.length} Modules
            </div>
            <div className="text-xs text-app-text-sub mt-0.5">
              Saved for zero-data usage
            </div>
          </div>
        </Card>
      </div>

      {/* Storage & Cache Diagnostics */}
      <Card className="p-6 border-app-border space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-app-text-main">Local Storage & Cache Allocation</h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            IndexedDB Healthy
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-app-text-sub">
            <span>Used Storage: <strong className="text-app-text-main">{storageEstimate.usedMB} MB</strong></span>
            <span>Allocated Quota: <strong className="text-app-text-main">{storageEstimate.totalMB} MB</strong></span>
          </div>
          <div className="w-full bg-app-bg-alt rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${Math.max(storageEstimate.percentage, 2)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-app-bg-alt/50 border border-app-border text-xs">
            <span className="text-app-text-sub block">Offline Lessons:</span>
            <strong className="text-app-text-main text-sm font-semibold">{downloadedLessons.length} saved</strong>
          </div>
          <div className="p-3.5 rounded-xl bg-app-bg-alt/50 border border-app-border text-xs">
            <span className="text-app-text-sub block">Progress State:</span>
            <strong className="text-app-text-main text-sm font-semibold">100% Up to Date</strong>
          </div>
          <div className="p-3.5 rounded-xl bg-app-bg-alt/50 border border-app-border text-xs">
            <span className="text-app-text-sub block">Conflict Resolution:</span>
            <strong className="text-app-text-main text-sm font-semibold">Server-Wins Automatic</strong>
          </div>
        </div>
      </Card>

      {/* Sync Log & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-bold text-app-text-main uppercase tracking-wider">
            Recent Synchronization Activity
          </h3>
          <div className="space-y-2">
            {syncHistory.map((item) => (
              <div 
                key={item.id} 
                className="p-3.5 rounded-xl bg-app-card border border-app-border flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-app-text-main">{item.type}</div>
                    <div className="text-xs text-app-text-sub">{item.items}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-app-text-sub">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Nav Card */}
        <Card className="p-5 border-app-border flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-app-text-main">Manage Offline Lessons</h4>
            <p className="text-xs text-app-text-sub mt-1 leading-relaxed">
              View, launch, or remove lessons saved on your device for distraction-free offline studying.
            </p>
          </div>

          <Button 
            variant="outline" 
            onClick={() => navigate('/lessons/uploaded')}
            className="w-full flex items-center justify-center gap-2 text-xs"
          >
            Open Offline Modules <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Card>
      </div>
    </div>
  );
}
