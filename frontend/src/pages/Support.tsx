const Support = () => {
	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-10 px-4">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold text-gray-900 mb-4">Support</h1>
				<p className="text-gray-900 mb-6">
					Need help? Reach out to our support team and we will assist you.
				</p>
				<div className="grid gap-4">
					<div className="rounded-2xl bg-white shadow-md p-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-2">Help Center</h2>
						<p className="text-gray-900">
							Browse FAQs, guides, and troubleshooting tips for RuralAccess AI.
						</p>
					</div>
					<div className="rounded-2xl bg-white shadow-md p-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-2">Contact Us</h2>
						<p className="text-gray-900">Email: sheelamrahulreddy18@gmail.com</p>
						<p className="text-gray-900">Phone: +91-90100-01281</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Support;
