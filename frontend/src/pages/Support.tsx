import { useSettings } from '../context/SettingsContext';

const Support = () => {
	const { t } = useSettings();
	
	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-10 px-4">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold text-app-text-main mb-4">{t.support.title}</h1>
				<p className="text-app-text-main mb-6">{t.support.subtitle}</p>
				<div className="grid gap-4">
					<div className="rounded-2xl bg-app-bg shadow-md p-6">
						<h2 className="text-xl font-semibold text-app-text-main mb-2">{t.support.helpCenter}</h2>
						<p className="text-app-text-main">{t.support.helpCenterDesc}</p>
					</div>
					<div className="rounded-2xl bg-app-bg shadow-md p-6">
						<h2 className="text-xl font-semibold text-app-text-main mb-2">{t.support.contactUs}</h2>
						<p className="text-app-text-main">{t.support.email}: sheelamrahulreddy18@gmail.com</p>
						<p className="text-app-text-main">{t.support.phone}: +91-90100-01281</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Support;
