import { Search, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface HeroProps {
  onTrack: (trackingNumber: string, carrier: string) => void;
}

export default function Hero({ onTrack }: HeroProps) {
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      onTrack(trackingNumber.trim(), 'auto');
    }
  };

  return (
    <section id="track" className="bg-gradient-to-br from-blue-50 via-white to-sky-50 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-6 animate-fade-in">
            <TrendingUp className="h-4 w-4" />
            Trusted by 100K+ users
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            AI-Powered Courier Tracking
            <br />
            <span className="text-blue-800">Accurate Delivery Predictions for 800+ Carriers</span>
          </h1>

          <p className="text-base md:text-lg text-gray-600 mb-10 leading-relaxed">
            Track packages with intelligent predictions | Real-time updates from global couriers | Never miss a delivery
          </p>

          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-xl p-3 md:p-4 border border-gray-200">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="w-full px-4 py-3 text-base md:text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    data-testid="input-tracking-number"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-800 text-white font-semibold text-base md:text-lg rounded-lg hover:bg-blue-900 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 whitespace-nowrap"
                  data-testid="button-track"
                >
                  <Search className="h-5 w-5" />
                  <span>Track Now</span>
                </button>
              </div>
            </div>
          </form>

          <div className="mt-6 max-w-3xl mx-auto">
            <p className="text-sm text-gray-600 mb-3 font-semibold">Tracking Number Examples:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="bg-white px-4 py-3 rounded-lg border border-gray-200">
                <span className="font-bold text-blue-800">FedEx:</span>
                <span className="text-gray-700 ml-2">123456789012</span>
              </div>
              <div className="bg-white px-4 py-3 rounded-lg border border-gray-200">
                <span className="font-bold text-blue-800">UPS:</span>
                <span className="text-gray-700 ml-2">1Z999AA10123456784</span>
              </div>
              <div className="bg-white px-4 py-3 rounded-lg border border-gray-200">
                <span className="font-bold text-blue-800">USPS:</span>
                <span className="text-gray-700 ml-2">9400111899223456789</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-semibold">100% Free Forever</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">AI Predictions</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-semibold">Instant Alerts</span>
          </div>
        </div>
      </div>
    </section>
  );
}
