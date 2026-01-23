import Card from '../components/Card';

const Accessibility = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Accessibility</h1>
          <p className="text-gray-900 mt-2">Our commitment to inclusive learning</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Visual Accessibility</h2>
            <ul className="space-y-2 text-gray-900">
              <li>• High contrast color schemes</li>
              <li>• Adjustable text sizes</li>
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
