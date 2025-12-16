import { TrendingUp, Clock, AlertTriangle, Sparkles, Cloud, Loader2 } from 'lucide-react';

interface AIPredictionsProps {
  trackingData: any;
  isLoading: boolean;
}

export default function AIPredictions({ trackingData, isLoading }: AIPredictionsProps) {
  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200 p-6 md:p-8">
          <div className="flex items-center justify-center gap-3 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Analyzing with AI...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!trackingData) return null;

  const formatDeliveryTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return `Today by ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric' });
  };

  const getRiskColor = (level: string) => {
    if (level === 'low') return 'text-green-600';
    if (level === 'medium') return 'text-yellow-600';
    return 'text-red-600';
  };

  const predictions = [
    {
      icon: Clock,
      title: 'AI Prediction',
      value: trackingData.aiPrediction?.prediction || 'Calculating...',
      confidence: `${trackingData.aiPrediction?.confidence || 85}% confidence`,
      color: 'text-blue-600'
    },
    {
      icon: Cloud,
      title: 'Weather Impact',
      value: trackingData.weatherImpact?.condition || 'Normal',
      confidence: trackingData.weatherImpact?.impact || 'No delays',
      color: 'text-sky-600'
    },
    {
      icon: TrendingUp,
      title: 'Estimated Delivery',
      value: trackingData.estimatedDelivery ? formatDeliveryTime(trackingData.estimatedDelivery) : 'Calculating...',
      confidence: trackingData.status === 'Delivered' ? 'Completed' : 'On track',
      color: 'text-green-600'
    },
    {
      icon: AlertTriangle,
      title: 'Delay Risk',
      value: (trackingData.delayRisk?.level || 'low').toUpperCase(),
      confidence: trackingData.delayRisk?.explanation || 'On schedule',
      color: getRiskColor(trackingData.delayRisk?.level || 'low')
    }
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI Delivery Insights</h3>
            <p className="text-sm text-gray-600">Powered by machine learning</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {predictions.map((prediction, index) => {
            const Icon = prediction.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 ${prediction.color} bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${prediction.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 mb-1">{prediction.title}</p>
                    <p className="text-lg font-bold text-gray-900 mb-1">{prediction.value}</p>
                    <p className="text-xs text-gray-500">{prediction.confidence}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {trackingData.recommendations && trackingData.recommendations.length > 0 && (
          <div className="mt-6 pt-6 border-t border-blue-200">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Recommendations
            </h4>
            <ul className="space-y-2">
              {trackingData.recommendations.map((rec: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-blue-600 mt-0.5">-</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
