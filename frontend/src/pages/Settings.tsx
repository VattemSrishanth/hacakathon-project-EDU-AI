import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type LearningLevel = 'Beginner' | 'Intermediate' | 'Advanced';
type ContentPreference = 'Text' | 'Video' | 'Both';
type AnswerStyle = 'Short' | 'Detailed';
type ReminderFrequency = 'Daily' | 'Weekly' | 'Off';
type ThemeMode = 'Light' | 'Dark';
type FontSize = 'Small' | 'Medium' | 'Large';

interface ProfileSettings {
	name: string;
	email: string;
	avatarDataUrl: string;
}

interface LearningPreferences {
	language: string;
	level: LearningLevel;
	contentPreference: ContentPreference;
}

interface AiTutorSettings {
	enabled: boolean;
	answerStyle: AnswerStyle;
	showChatHistory: boolean;
}

interface NotificationSettings {
	assignmentReminders: boolean;
	newLessonNotifications: boolean;
	reminderFrequency: ReminderFrequency;
}

interface ThemeAccessibilitySettings {
	theme: ThemeMode;
	fontSize: FontSize;
	highContrast: boolean;
	reduceMotion: boolean;
}

interface SettingsState {
	profile: ProfileSettings;
	learning: LearningPreferences;
	aiTutor: AiTutorSettings;
	notifications: NotificationSettings;
	themeAccessibility: ThemeAccessibilitySettings;
}

const SETTINGS_KEY = 'settings';
const AUTH_KEY = 'auth';

const defaultSettings: SettingsState = {
	profile: {
		name: 'Student',
		email: 'student@example.com',
		avatarDataUrl: '',
	},
	learning: {
		language: 'English',
		level: 'Beginner',
		contentPreference: 'Both',
	},
	aiTutor: {
		enabled: true,
		answerStyle: 'Detailed',
		showChatHistory: true,
	},
	notifications: {
		assignmentReminders: true,
		newLessonNotifications: true,
		reminderFrequency: 'Weekly',
	},
	themeAccessibility: {
		theme: 'Light',
		fontSize: 'Medium',
		highContrast: false,
		reduceMotion: false,
	},
};

const Settings = () => {
	const navigate = useNavigate();
	const [settings, setSettings] = useState<SettingsState>(defaultSettings);
	const [saveMessage, setSaveMessage] = useState('');

	useEffect(() => {
		try {
			const stored = window.localStorage.getItem(SETTINGS_KEY);
			const storedSettings = stored ? (JSON.parse(stored) as SettingsState) : null;
			const authRaw = window.localStorage.getItem(AUTH_KEY);
			const auth = authRaw ? JSON.parse(authRaw) : null;

			const fallbackName = auth?.user?.name || auth?.user?.username || defaultSettings.profile.name;
			const fallbackEmail = auth?.user?.email || defaultSettings.profile.email;
			const fallbackAvatar = auth?.user?.avatarUrl || '';

			const merged: SettingsState = {
				...defaultSettings,
				...storedSettings,
				profile: {
					...defaultSettings.profile,
					...storedSettings?.profile,
					name: storedSettings?.profile?.name || fallbackName,
					email: storedSettings?.profile?.email || fallbackEmail,
					avatarDataUrl: storedSettings?.profile?.avatarDataUrl || fallbackAvatar,
				},
			};

			setSettings(merged);
		} catch {
			setSettings(defaultSettings);
		}
	}, []);

	useEffect(() => {
		try {
			window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
			setSaveMessage('Changes saved');
			const timeout = window.setTimeout(() => setSaveMessage(''), 1500);
			return () => window.clearTimeout(timeout);
		} catch {
			// ignore save errors
		}
		return undefined;
	}, [settings]);

	const initials = useMemo(() => {
		const source = settings.profile.name || settings.profile.email;
		if (!source) return 'U';
		return source
			.split(/\s+|@/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase())
			.join('') || 'U';
	}, [settings.profile.name, settings.profile.email]);

	const handleAvatarChange = (file?: File) => {
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			const result = typeof reader.result === 'string' ? reader.result : '';
			setSettings((prev) => ({
				...prev,
				profile: { ...prev.profile, avatarDataUrl: result },
			}));
		};
		reader.readAsDataURL(file);
	};

	const clearChatHistory = () => {
		try {
			window.localStorage.removeItem('aiChatHistory');
			window.localStorage.removeItem('ai_chat_history');
			setSaveMessage('Chat history cleared');
		} catch {
			// ignore
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-10 px-4">
			<div className="max-w-5xl mx-auto">
				<div className="mb-8 flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Settings</h1>
						<p className="text-gray-900 mt-2">Manage your account and learning preferences.</p>
					</div>
					{saveMessage && (
						<div className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800">
							{saveMessage}
						</div>
					)}
				</div>

				<div className="grid gap-6">
					{/* Profile Settings */}
					<section className="bg-white rounded-2xl shadow-md p-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Settings</h2>
						<div className="flex flex-col md:flex-row gap-6">
							<div className="flex flex-col items-center gap-3">
								<div className="h-24 w-24 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold overflow-hidden">
									{settings.profile.avatarDataUrl ? (
										<img
											src={settings.profile.avatarDataUrl}
											alt="Avatar"
											className="h-full w-full object-cover"
										/>
									) : (
										initials
									)}
								</div>
								<label className="text-sm font-medium text-gray-700">
									Upload Avatar
									<input
										type="file"
										accept="image/*"
										className="mt-2 block w-full text-sm text-gray-600"
										onChange={(e) => handleAvatarChange(e.target.files?.[0])}
									/>
								</label>
								{settings.profile.avatarDataUrl && (
									<button
										type="button"
										onClick={() =>
											setSettings((prev) => ({
												...prev,
												profile: { ...prev.profile, avatarDataUrl: '' },
											}))
										}
										className="text-sm text-red-600 hover:underline"
									>
										Remove avatar
									</button>
								)}
							</div>
							<div className="flex-1 grid gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
									<input
										type="text"
										value={settings.profile.name}
										onChange={(e) =>
											setSettings((prev) => ({
												...prev,
												profile: { ...prev.profile, name: e.target.value },
											}))
										}
										className="w-full rounded-lg border border-gray-300 px-4 py-2"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
									<input
										type="email"
										value={settings.profile.email}
										readOnly
										className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-600"
									/>
								</div>
							</div>
						</div>
					</section>

					{/* Learning Preferences */}
					<section className="bg-white rounded-2xl shadow-md p-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-4">Learning Preferences</h2>
						<div className="grid md:grid-cols-3 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
								<select
									value={settings.learning.language}
									onChange={(e) =>
										setSettings((prev) => ({
											...prev,
											learning: { ...prev.learning, language: e.target.value },
										}))
									}
									className="w-full rounded-lg border border-gray-300 px-3 py-2"
								>
									<option>English</option>
									<option>Hindi</option>
									<option>Telugu</option>
									<option>Spanish</option>
									<option>French</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Learning Level</label>
								<select
									value={settings.learning.level}
									onChange={(e) =>
										setSettings((prev) => ({
											...prev,
											learning: { ...prev.learning, level: e.target.value as LearningLevel },
										}))
									}
									className="w-full rounded-lg border border-gray-300 px-3 py-2"
								>
									<option>Beginner</option>
									<option>Intermediate</option>
									<option>Advanced</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Content Preference</label>
								<select
									value={settings.learning.contentPreference}
									onChange={(e) =>
										setSettings((prev) => ({
											...prev,
											learning: {
												...prev.learning,
												contentPreference: e.target.value as ContentPreference,
											},
										}))
									}
									className="w-full rounded-lg border border-gray-300 px-3 py-2"
								>
									<option>Text</option>
									<option>Video</option>
									<option>Both</option>
								</select>
							</div>
						</div>
					</section>

					{/* AI Tutor Settings */}
					<section className="bg-white rounded-2xl shadow-md p-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-4">AI Tutor Settings</h2>
						<div className="grid md:grid-cols-3 gap-4">
							<label className="flex items-center gap-2 text-sm text-gray-700">
								<input
									type="checkbox"
									checked={settings.aiTutor.enabled}
									onChange={(e) =>
										setSettings((prev) => ({
											...prev,
											aiTutor: { ...prev.aiTutor, enabled: e.target.checked },
										}))
									}
								/>
								Enable AI Tutor
							</label>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Answer Style</label>
								<select
									value={settings.aiTutor.answerStyle}
									onChange={(e) =>
										setSettings((prev) => ({
											...prev,
											aiTutor: { ...prev.aiTutor, answerStyle: e.target.value as AnswerStyle },
										}))
									}
									className="w-full rounded-lg border border-gray-300 px-3 py-2"
								>
									<option>Short</option>
									<option>Detailed</option>
								</select>
							</div>
							<label className="flex items-center gap-2 text-sm text-gray-700">
								<input
									type="checkbox"
									checked={settings.aiTutor.showChatHistory}
									onChange={(e) =>
										setSettings((prev) => ({
											...prev,
											aiTutor: { ...prev.aiTutor, showChatHistory: e.target.checked },
										}))
									}
								/>
								Show chat history
							</label>
						</div>
						<button
							type="button"
							onClick={clearChatHistory}
							className="mt-4 inline-flex items-center rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
						>
							Clear AI chat history
						</button>
					</section>

					{/* Notification Settings */}
					<section className="bg-white rounded-2xl shadow-md p-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Settings</h2>
						<div className="grid md:grid-cols-3 gap-4">
							<label className="flex items-center gap-2 text-sm text-gray-700">
								<input
									type="checkbox"
									checked={settings.notifications.assignmentReminders}
									onChange={(e) =>
										setSettings((prev) => ({
											...prev,
											notifications: {
												...prev.notifications,
												assignmentReminders: e.target.checked,
											},
										}))
									}
								/>
								Assignment reminders
							</label>
							<label className="flex items-center gap-2 text-sm text-gray-700">
								<input
									type="checkbox"
									checked={settings.notifications.newLessonNotifications}
									onChange={(e) =>
										setSettings((prev) => ({
											...prev,
											notifications: {
												...prev.notifications,
												newLessonNotifications: e.target.checked,
											},
										}))
									}
								/>
								New lesson notifications
							</label>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Reminder Frequency</label>
								<select
									value={settings.notifications.reminderFrequency}
									onChange={(e) =>
										setSettings((prev) => ({
											...prev,
											notifications: {
												...prev.notifications,
												reminderFrequency: e.target.value as ReminderFrequency,
											},
										}))
									}
									className="w-full rounded-lg border border-gray-300 px-3 py-2"
								>
									<option>Daily</option>
									<option>Weekly</option>
									<option>Off</option>
								</select>
							</div>
						</div>
					</section>

					{/* Theme & Accessibility */}
					<section className="bg-white rounded-2xl shadow-md p-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-4">Theme & Accessibility</h2>
						<div className="grid md:grid-cols-4 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
								<select
									value={settings.themeAccessibility.theme}
									onChange={(e) =>
										setSettings((prev) => ({
											...prev,
											themeAccessibility: {
												...prev.themeAccessibility,
												theme: e.target.value as ThemeMode,
											},
										}))
									}
									className="w-full rounded-lg border border-gray-300 px-3 py-2"
								>
									<option>Light</option>
									<option>Dark</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
								<select
									value={settings.themeAccessibility.fontSize}
									onChange={(e) =>
										setSettings((prev) => ({
											...prev,
											themeAccessibility: {
												...prev.themeAccessibility,
												fontSize: e.target.value as FontSize,
											},
										}))
									}
									className="w-full rounded-lg border border-gray-300 px-3 py-2"
								>
									<option>Small</option>
									<option>Medium</option>
									<option>Large</option>
								</select>
							</div>
							<label className="flex items-center gap-2 text-sm text-gray-700">
								<input
									type="checkbox"
									checked={settings.themeAccessibility.highContrast}
									onChange={(e) =>
										setSettings((prev) => ({
											...prev,
											themeAccessibility: {
												...prev.themeAccessibility,
												highContrast: e.target.checked,
											},
										}))
									}
								/>
								High contrast
							</label>
							<label className="flex items-center gap-2 text-sm text-gray-700">
								<input
									type="checkbox"
									checked={settings.themeAccessibility.reduceMotion}
									onChange={(e) =>
										setSettings((prev) => ({
											...prev,
											themeAccessibility: {
												...prev.themeAccessibility,
												reduceMotion: e.target.checked,
											},
										}))
									}
								/>
								Reduce motion
							</label>
						</div>
					</section>

					{/* Navigation */}
					<section className="bg-white rounded-2xl shadow-md p-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-4">Navigation</h2>
						<div className="flex flex-wrap gap-3">
							<button
								type="button"
								onClick={() => navigate('/accessibility')}
								className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-indigo-700"
							>
								Accessibility Settings
							</button>
							<button
								type="button"
								onClick={() => navigate('/support')}
								className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
							>
								Support
							</button>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
};

export default Settings;
