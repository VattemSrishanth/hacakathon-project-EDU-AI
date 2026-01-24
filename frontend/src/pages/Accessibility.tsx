import Card from '../components/Card';
import { useSettings } from '../context/SettingsContext';
import type { AccessibilityMode } from '../context/SettingsContext';

const Accessibility = () => {
  const { settings, updateThemeAccessibility } = useSettings();

  const modes: { id: AccessibilityMode; label: string; desc: string }[] = [
    { id: 'Normal', label: 'Normal Mode', desc: 'Standard interface for all users.' },
    { id: 'Deaf', label: 'Deaf Mode', desc: 'Enhanced visual indicators and captions for all audio content.' },
    { id: 'Dumb', label: 'Dumb Mode', desc: 'Communication tools optimized for non-verbal users.' },
    { id: 'Blind', label: 'Blind Mode', desc: 'Full screen reader optimization and voice-guided navigation.' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Accessibility</h1>
          <p className="text-gray-900 mt-2">Our commitment to inclusive learning</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Advanced Accessibility Modes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => updateThemeAccessibility({ accessibilityMode: mode.id })}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    settings.themeAccessibility.accessibilityMode === mode.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <h3 className="font-bold text-gray-900">{mode.label}</h3>
                  <p className="text-sm text-gray-600 mt-1">{mode.desc}</p>
                  {settings.themeAccessibility.accessibilityMode === mode.id && (
                    <div className="mt-2 text-blue-600 text-xs font-semibold flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      Active
                    </div>
                  )}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Visual Accessibility</h2>
            <ul className="space-y-2 text-gray-900">
              <li>• High contrast color schemes</li>
              <li>• Adjustable text sizes</li>
              <li>• Low Power Mode for resource conservation</li>
              <li>• Screen reader compatibility</li>
              <li>• Clear navigation structure</li>
            </ul>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Learning Support</h2>
            <ul className="space-y-2 text-gray-900">
              <li>• Multiple language support</li>
              <li>• Audio descriptions</li>
              <li>• Interactive content</li>
              <li>• Personalized learning paths</li>
            </ul>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Technical Features</h2>
            <ul className="space-y-2 text-gray-900">
              <li>• Low bandwidth optimization</li>
              <li>• Offline content access</li>
              <li>• Mobile-friendly design</li>
              <li>• Fast loading times</li>
            </ul>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Feedback & Support</h2>
            <p className="text-gray-900">
              We continuously improve our accessibility features based on user feedback.
              If you encounter any accessibility issues, please contact our support team.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Accessibility;
