import { RefreshCw, Brain, Bell } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: RefreshCw,
      title: 'Real-Time Updates',
      description: 'Track packages from 800+ carriers worldwide with instant status updates',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Brain,
      title: 'AI Predictions',
      description: 'Smart delivery estimates powered by machine learning and historical data',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Bell,
      title: 'Email & SMS Alerts',
      description: 'Never miss an update with customizable notifications for every milestone',
      color: 'from-green-500 to-green-600'
    }
  ];

  return (
    <section id="features" className="py-16 md:py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
            Why Choose LiveTrackings for Package Tracking?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Advanced real-time package tracking with AI predictions for accurate delivery estimates across 800+ global carriers
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-200"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6`} role="img" aria-label={feature.title}>
                  <Icon className="h-7 w-7 text-white" strokeWidth={2.5} aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
