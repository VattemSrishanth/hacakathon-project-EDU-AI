import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import {
  Settings as SettingsIcon,
  Shield,
  Mail,
  Key,
  Compass,
  Database,
  CheckCircle,
  RotateCw
} from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    roles: { student: true, teacher: true, admin: true },
    permissions: { createContent: 'admin', editContent: 'admin', deleteContent: 'admin' },
    auth: { googleLogin: true, githubLogin: false, maxLoginAttempts: 5 },
    emailConfig: { senderEmail: 'noreply@eduai.com', host: 'smtp.mailtrap.io', port: 2525 },
    notificationSettings: { push: true, email: true, inApp: true },
    apiKeys: { googleGemini: '••••••••••••••••', groqApi: '••••••••••••••••' },
    theme: 'dark',
    languages: ['English', 'Telugu', 'Hindi'],
    backupSchedule: 'weekly'
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAdminSettings();
      if (res.success) {
        setSettings(res.settings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await adminAPI.saveAdminSettings(settings);
      if (res.success) {
        setSuccess('System settings updated successfully.');
        setSettings(res.settings);
      }
    } catch (err) {
      setError('Failed to update system configurations.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = () => {
    alert('System backup initiated. Downloading archive...');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-app-text-main">System Configurations</h1>
        <p className="text-app-text-sub mt-1 text-sm">Manage system permissions, API integrations, global flags, and database backup controls.</p>
      </div>

      {error && <div className="bg-error/10 border border-error text-error p-3.5 rounded-lg text-sm font-semibold">{error}</div>}
      {success && <div className="bg-emerald-50 border border-emerald-500 text-emerald-700 p-3.5 rounded-lg text-sm font-semibold">{success}</div>}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Config forms */}
        <div className="space-y-6 lg:col-span-2">
          {/* Email configs */}
          <div className="bg-app-bg-alt border border-app-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-primary flex items-center gap-1.5">
              <Mail size={18} /> SMTP Server Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Sender Email</label>
                <input
                  type="email"
                  value={settings.emailConfig.senderEmail}
                  onChange={(e) => setSettings({ ...settings, emailConfig: { ...settings.emailConfig, senderEmail: e.target.value } })}
                  className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">SMTP Host</label>
                <input
                  type="text"
                  value={settings.emailConfig.host}
                  onChange={(e) => setSettings({ ...settings, emailConfig: { ...settings.emailConfig, host: e.target.value } })}
                  className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>
          </div>

          {/* Access keys configs */}
          <div className="bg-app-bg-alt border border-app-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-primary flex items-center gap-1.5">
              <Key size={18} /> API Access Credentials
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Google Gemini API Key</label>
                <input
                  type="text"
                  value={settings.apiKeys.googleGemini}
                  onChange={(e) => setSettings({ ...settings, apiKeys: { ...settings.apiKeys, googleGemini: e.target.value } })}
                  className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Groq API Key</label>
                <input
                  type="text"
                  value={settings.apiKeys.groqApi}
                  onChange={(e) => setSettings({ ...settings, apiKeys: { ...settings.apiKeys, groqApi: e.target.value } })}
                  className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>
          </div>

          {/* Auth settings */}
          <div className="bg-app-bg-alt border border-app-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-primary flex items-center gap-1.5">
              <Shield size={18} /> Security & Auth Controls
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Max Login Attempts</label>
                <input
                  type="number"
                  value={settings.auth.maxLoginAttempts}
                  onChange={(e) => setSettings({ ...settings, auth: { ...settings.auth, maxLoginAttempts: Number(e.target.value) } })}
                  className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2 text-sm font-semibold text-app-text-sub cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.auth.googleLogin}
                    onChange={(e) => setSettings({ ...settings, auth: { ...settings.auth, googleLogin: e.target.checked } })}
                    className="rounded"
                  />
                  Enable Google SSO Login
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="space-y-6">
          <div className="bg-app-bg-alt border border-app-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-primary flex items-center gap-1.5">
              <Database size={18} /> System Backups
            </h3>
            <div>
              <label className="block text-xs font-bold text-app-text-sub uppercase mb-1">Backup Interval</label>
              <select
                value={settings.backupSchedule}
                onChange={(e) => setSettings({ ...settings, backupSchedule: e.target.value })}
                className="w-full px-3 py-2 border border-app-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary">
                <option value="daily">Daily Cron Backup</option>
                <option value="weekly">Weekly Schedule Backup</option>
                <option value="monthly">Monthly Archive Backup</option>
              </select>
            </div>
            <button
              type="button"
              onClick={handleBackup}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors">
              Trigger Manual MongoDB Backup
            </button>
          </div>

          <div className="bg-app-bg-alt border border-app-border rounded-xl p-5 shadow-sm space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-extrabold py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50">
              <CheckCircle size={16} /> {loading ? 'Saving configs...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;
