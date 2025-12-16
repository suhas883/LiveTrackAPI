import { CreditCard, TrendingUp, Shield, Zap, Clock, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAffiliateUrl } from '../lib/affiliate';

export default function YendoOffer() {
  const [timeLeft, setTimeLeft] = useState(3600);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 3600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const benefits = [
    { icon: TrendingUp, text: '5% cashback on all purchases' },
    { icon: CreditCard, text: '$200 sign-up bonus TODAY' },
    { icon: Shield, text: 'No annual fee EVER' },
    { icon: Zap, text: 'Instant approval (2 min)' }
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl shadow-2xl overflow-hidden relative">
        <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse">
          <Clock className="h-4 w-4" />
          Limited Time: {formatTime(timeLeft)}
        </div>
        <div className="p-6 md:p-8 pt-16 md:pt-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <div className="w-48 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-lg flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform">
                <CreditCard className="h-16 w-16 text-gray-700" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold mb-3">
                <AlertCircle className="h-3 w-3" />
                LAST CHANCE - $200 BONUS ENDS SOON
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white mb-3">
                Get $200 FREE + 5% Cashback
              </h3>
              <p className="text-green-100 mb-6">
                Instant approval in 2 minutes | Join 50,000+ smart shoppers saving daily
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={index} className="flex items-center gap-2 text-white">
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{benefit.text}</span>
                    </div>
                  );
                })}
              </div>

              <a
                href={getAffiliateUrl('yendo')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-4 bg-white text-green-700 font-bold text-lg rounded-xl hover:bg-green-50 transition-all shadow-lg hover:shadow-xl animate-pulse"
                data-testid="link-yendo"
              >
                CLAIM $200 NOW - Limited Spots
              </a>
              <p className="text-green-100 text-xs mt-3">
                Only 47 spots left today | No credit check required
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
