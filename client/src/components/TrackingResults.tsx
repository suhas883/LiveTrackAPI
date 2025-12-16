import { Package, MapPin, Clock, Copy, Mail, MessageSquare, Share2, Printer, CheckCircle, Loader2, TrendingUp, AlertCircle, Sparkles, Calendar, Navigation, XCircle, Globe, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface TrackingEvent {
  status: string;
  location: string;
  city?: string;
  state?: string;
  country?: string;
  date?: string;
  time?: string;
  timestamp: string;
  description: string;
}

interface TrackingData {
  trackingNumber: string;
  carrier: string;
  status: string;
  notFound?: boolean;
  estimatedDelivery: string;
  events: TrackingEvent[];
  lastUpdated: string;
  origin?: {
    city?: string;
    state?: string;
    country?: string;
  };
  destination?: {
    city?: string;
    state?: string;
    country?: string;
  };
  trackingUrl?: string;
  aiPrediction?: {
    prediction: string;
    confidence: number;
    reasoning: string;
  };
  weatherImpact?: {
    condition: string;
    impact: string;
    temperature: string;
  };
  delayRisk?: {
    level: string;
    score: number;
    explanation: string;
  };
  recommendations?: string[];
}

interface TrackingResultsProps {
  trackingNumber: string;
  carrier: string;
  trackingData: TrackingData | null;
  isLoading: boolean;
  onEmailClick: () => void;
  onSmsClick: () => void;
}

export default function TrackingResults({ trackingNumber, carrier, trackingData, isLoading, onEmailClick, onSmsClick }: TrackingResultsProps) {
  const [copied, setCopied] = useState(false);

  // Detect carrier from tracking number format (for loading state)
  const detectCarrierFromNumber = (num: string): string => {
    const n = num.trim().toUpperCase();
    if (/^1Z[A-Z0-9]{16}$/i.test(n)) return "UPS";
    if (/^\d{12}$/.test(n) || /^\d{15}$/.test(n) || /^\d{20}$/.test(n)) return "FedEx";
    if (/^(94|93|92|91|90)\d{18,20}$/.test(n) || /^\d{20,22}$/.test(n)) return "USPS";
    if (/^TBA\d{12,}$/i.test(n)) return "Amazon";
    if (/^D\d{8,}$/i.test(n)) return "DTDC";
    if (/^\d{13,14}$/.test(n)) return "Delhivery";
    if (/^\d{9}$/.test(n) || /^\d{11}$/.test(n)) return "Blue Dart";
    if (/^E[A-Z]\d{9}IN$/i.test(n) || /^R[A-Z]\d{9}IN$/i.test(n)) return "India Post";
    if (/^\d{10}$/.test(n)) return "DHL";
    if (/^[A-Z]{2}\d{9}[A-Z]{2}$/i.test(n)) return "International Post";
    return carrier === 'auto' ? 'Detecting...' : carrier;
  };

  const events = trackingData?.events || [];
  const currentStatus = trackingData?.status || 'Processing';
  const estimatedDelivery = trackingData?.estimatedDelivery;
  const actualCarrier = trackingData?.carrier || detectCarrierFromNumber(trackingNumber);
  const isNotFound = trackingData?.notFound === true || trackingData?.status === "Not Found";

  const latestEvent = events.length > 0 ? events[0] : null;

  const copyTrackingNumber = async () => {
    await navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Track Package',
        text: `Track ${actualCarrier.toUpperCase()} package: ${trackingNumber}`,
        url: window.location.href
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatEventDateTime = (event: TrackingEvent) => {
    // If we have date and time separately
    if (event.date && event.time) {
      return `${event.date} at ${event.time}`;
    }
    // If we have a timestamp
    if (event.timestamp) {
      try {
        const date = new Date(event.timestamp);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      } catch {
        return event.timestamp;
      }
    }
    return event.date || 'Date pending';
  };

  const formatEventLocation = (event: TrackingEvent) => {
    // Build location string from parts
    const parts = [];
    if (event.city) parts.push(event.city);
    if (event.state) parts.push(event.state);
    if (event.country) parts.push(event.country);
    
    if (parts.length > 0) {
      return parts.join(', ');
    }
    
    // Fallback to location string
    return event.location || 'Location pending';
  };

  const getStatusColor = (status: string) => {
    if (status === 'Delivered') return 'bg-green-500';
    if (status === 'Out for Delivery') return 'bg-blue-500';
    if (status === 'In Transit') return 'bg-yellow-500';
    if (status === 'Not Found') return 'bg-red-500';
    if (status === 'Exception') return 'bg-orange-500';
    return 'bg-gray-500';
  };

  const getDataAge = () => {
    if (!trackingData?.lastUpdated && events.length === 0) return null;
    
    const lastEventDate = events.length > 0 
      ? new Date(events[0].timestamp || events[0].date || '')
      : trackingData?.lastUpdated ? new Date(trackingData.lastUpdated) : null;
    
    if (!lastEventDate || isNaN(lastEventDate.getTime())) return null;
    
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastEventDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) {
      const months = Math.floor(diffDays / 30);
      return {
        isOld: true,
        message: months > 12 
          ? `Historical record - Last update ${Math.floor(months / 12)} year${Math.floor(months / 12) > 1 ? 's' : ''} ago`
          : `Historical record - Last update ${months} month${months > 1 ? 's' : ''} ago`,
        lastDate: lastEventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
    }
    return { isOld: false, message: null, lastDate: null };
  };

  const dataAge = getDataAge();

  const formatEstimatedDelivery = (timestamp: string | undefined) => {
    if (!timestamp) return isNotFound ? 'N/A' : 'Calculating...';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return timestamp;
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      if (isToday) return 'Today';
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return timestamp;
    }
  };

  const formatOriginDestination = (loc: { city?: string; state?: string; country?: string } | undefined) => {
    if (!loc) return null;
    const parts = [loc.city, loc.state, loc.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-fade-in" data-testid="tracking-results">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className={`p-6 md:p-8 text-white ${isNotFound ? 'bg-gradient-to-r from-red-700 to-red-500' : 'bg-gradient-to-r from-blue-800 to-sky-600'}`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                {isLoading ? (
                  <Loader2 className="h-7 w-7 text-blue-800 animate-spin" />
                ) : isNotFound ? (
                  <XCircle className="h-7 w-7 text-red-600" />
                ) : (
                  <Package className="h-7 w-7 text-blue-800" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium opacity-90" data-testid="text-carrier">{actualCarrier.toUpperCase()}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-lg md:text-xl font-bold font-mono" data-testid="text-tracking-number">{trackingNumber}</p>
                  <button
                    onClick={copyTrackingNumber}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    title="Copy tracking number"
                    data-testid="button-copy"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            {!isLoading && (
              <div className={`px-4 py-2 ${getStatusColor(currentStatus)} rounded-full text-sm font-bold`} data-testid="badge-status">
                {currentStatus}
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-3 mt-4">
            <div className="flex items-center gap-2 bg-white/10 rounded-lg p-3">
              <Clock className="h-5 w-5" />
              <div>
                <p className="text-xs opacity-80">Estimated Delivery</p>
                <p className="font-bold" data-testid="text-estimated-delivery">
                  {isLoading ? 'Loading...' : formatEstimatedDelivery(estimatedDelivery)}
                </p>
              </div>
            </div>
            {trackingData?.aiPrediction && (
              <div className="flex items-center gap-2 bg-white/10 rounded-lg p-3">
                <Sparkles className="h-5 w-5" />
                <div>
                  <p className="text-xs opacity-80">AI Confidence</p>
                  <p className="font-bold" data-testid="text-confidence">{trackingData.aiPrediction.confidence}%</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Powered by AI indicator */}
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white/20 rounded-lg text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Live data powered by AI
          </div>
        </div>

        <div className="p-6 md:p-8">
          {/* Historical Data Warning Banner */}
          {dataAge?.isOld && !isNotFound && (
            <div className="mb-6 rounded-xl p-4 border-2 bg-amber-50 border-amber-300 dark:bg-amber-900/20 dark:border-amber-700" data-testid="banner-historical">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-amber-500">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                    {dataAge.message}
                    <span className="text-xs bg-amber-600 text-white px-2 py-0.5 rounded-full">
                      ARCHIVED
                    </span>
                  </h4>
                  <p className="text-amber-700 dark:text-amber-300 text-sm">
                    This shipment was completed on {dataAge.lastDate}. For current shipments, please verify with the carrier directly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* AI Prediction Banner */}
          {trackingData?.aiPrediction && (
            <div className={`mb-6 rounded-xl p-4 border-2 ${isNotFound ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 dark:from-purple-900/20 dark:to-blue-900/20 dark:border-purple-700'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isNotFound ? 'bg-red-600' : 'bg-gradient-to-br from-purple-600 to-blue-600'}`}>
                  {isNotFound ? (
                    <XCircle className="h-6 w-6 text-white" />
                  ) : (
                    <Sparkles className="h-6 w-6 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
                    {isNotFound ? 'Tracking Not Found' : 'AI-Powered Analysis'}
                    <span className={`text-xs text-white px-2 py-0.5 rounded-full ${isNotFound ? 'bg-red-600' : 'bg-purple-600'}`}>
                      {isNotFound ? 'NOT FOUND' : 'LIVE'}
                    </span>
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-2" data-testid="text-ai-prediction">{trackingData.aiPrediction.prediction}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">{trackingData.aiPrediction.reasoning}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats Grid - Only show if not "Not Found" */}
          {trackingData && !isNotFound && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <p className="font-bold text-gray-900 dark:text-gray-100">{trackingData.status}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                <Navigation className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Updates</p>
                <p className="font-bold text-gray-900 dark:text-gray-100">{trackingData.events.length}</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 text-center">
                <AlertCircle className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Delay Risk</p>
                <p className="font-bold text-gray-900 dark:text-gray-100 uppercase">{trackingData.delayRisk?.level || 'Low'}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
                <Calendar className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Days Transit</p>
                <p className="font-bold text-gray-900 dark:text-gray-100">
                  {events.length > 0 ? Math.max(1, Math.ceil((new Date(latestEvent?.timestamp || trackingData.estimatedDelivery).getTime() - new Date(trackingData.events[0]?.timestamp || Date.now()).getTime()) / (1000 * 60 * 60 * 24))) : '-'}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={onEmailClick}
              className="flex-1 md:flex-none px-6 py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 font-semibold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all flex items-center justify-center gap-2 min-h-[48px]"
              data-testid="button-email"
            >
              <Mail className="h-5 w-5" />
              <span>Email Updates</span>
            </button>
            <button
              onClick={onSmsClick}
              className="flex-1 md:flex-none px-6 py-3 bg-sky-50 dark:bg-sky-900/30 text-sky-800 dark:text-sky-200 font-semibold rounded-xl hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-all flex items-center justify-center gap-2 min-h-[48px]"
              data-testid="button-sms"
            >
              <MessageSquare className="h-5 w-5" />
              <span>SMS Alerts</span>
            </button>
            <button
              onClick={handleShare}
              className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2 min-h-[48px]"
              data-testid="button-share"
            >
              <Share2 className="h-5 w-5" />
              <span className="hidden md:inline">Share</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2 min-h-[48px]"
              data-testid="button-print"
            >
              <Printer className="h-5 w-5" />
              <span className="hidden md:inline">Print</span>
            </button>
          </div>

          {/* AI Recommendations */}
          {trackingData?.recommendations && trackingData.recommendations.length > 0 && (
            <div className={`mb-6 rounded-xl p-4 border-2 ${isNotFound ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700'}`}>
              <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <AlertCircle className={`h-5 w-5 ${isNotFound ? 'text-red-600' : 'text-yellow-600'}`} />
                {isNotFound ? 'What to do next' : 'AI Recommendations'}
              </h4>
              <ul className="space-y-2">
                {trackingData.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className={`mt-0.5 ${isNotFound ? 'text-red-600' : 'text-yellow-600'}`}>-</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Origin/Destination Journey */}
          {trackingData?.origin && trackingData?.destination && (formatOriginDestination(trackingData.origin) || formatOriginDestination(trackingData.destination)) && (
            <div className="mb-6 bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Package Journey
              </h4>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">FROM</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatOriginDestination(trackingData.origin) || 'Origin pending'}
                  </p>
                </div>
                <div className="w-12 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600" />
                <div className="flex-1 text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">TO</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatOriginDestination(trackingData.destination) || 'Destination pending'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tracking Timeline */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Tracking Timeline</h3>
              {trackingData && !isNotFound && (
                <span className="text-sm text-gray-500 dark:text-gray-400">{events.length} updates</span>
              )}
            </div>
            
            {isLoading ? (
              <div className="relative space-y-8">
                {[1, 2, 3].map((_, index) => (
                  <div key={index} className="relative pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    {index !== 2 && (
                      <div className="absolute left-3 top-7 w-0.5 h-full bg-gray-200 dark:bg-gray-700" />
                    )}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 ml-4">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2 animate-pulse" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2 animate-pulse" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : events.length > 0 ? (
              <div className="relative">
                {events.map((event, index) => {
                  const isLatest = index === 0;
                  return (
                    <div key={index} className={`relative pl-10 pb-8 last:pb-0 ${isLatest ? 'mb-2' : ''}`}>
                      {/* Timeline dot */}
                      <div
                        className={`absolute left-0 rounded-full border-4 ${
                          isLatest
                            ? 'top-2 w-8 h-8 bg-green-500 border-green-200 shadow-lg shadow-green-200'
                            : 'top-1 w-6 h-6 bg-blue-500 border-blue-200'
                        }`}
                      >
                        {isLatest && (
                          <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30" />
                        )}
                      </div>
                      {/* Timeline line */}
                      {index !== events.length - 1 && (
                        <div className={`absolute w-0.5 h-full bg-gray-200 dark:bg-gray-700 ${isLatest ? 'left-4 top-10' : 'left-3 top-7'}`} />
                      )}
                      {/* Event card */}
                      <div className={`rounded-xl p-4 ml-4 ${
                        isLatest 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-300 dark:border-green-700 shadow-md' 
                          : 'bg-gray-50 dark:bg-gray-800'
                      }`}>
                        {isLatest && (
                          <div className="inline-block px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full mb-3">
                            LATEST UPDATE
                          </div>
                        )}
                        {/* Status */}
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                          <h4 className={`font-bold ${isLatest ? 'text-2xl text-green-800 dark:text-green-200' : 'text-base text-gray-900 dark:text-gray-100'}`}>
                            {event.status}
                          </h4>
                          {/* Date and Time */}
                          <div className={isLatest ? 'text-base font-semibold text-green-700 dark:text-green-300' : 'text-sm text-gray-500 dark:text-gray-400'}>
                            <div className="flex items-center gap-1">
                              <Clock className={isLatest ? 'h-4 w-4' : 'h-3 w-3'} />
                              {formatEventDateTime(event)}
                            </div>
                          </div>
                        </div>
                        {/* Description */}
                        <p className={`mb-3 ${isLatest ? 'text-lg text-gray-800 dark:text-gray-200 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                          {event.description}
                        </p>
                        {/* Location with city, state, country */}
                        <div className="space-y-1">
                          <div className={`flex items-center gap-2 ${isLatest ? 'text-base text-green-700 dark:text-green-300 font-medium' : 'text-sm text-gray-500 dark:text-gray-400'}`}>
                            <MapPin className={isLatest ? 'h-5 w-5' : 'h-4 w-4'} />
                            <span>{formatEventLocation(event)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={`text-center py-12 rounded-xl ${isNotFound ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                {isNotFound ? (
                  <>
                    <XCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
                    <p className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">Tracking Number Not Found</p>
                    <p className="text-gray-600 dark:text-gray-400">This tracking number does not exist in the {actualCarrier} system.</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Please verify the number and try again.</p>
                  </>
                ) : (
                  <>
                    <Package className="h-16 w-16 mx-auto mb-4 opacity-50 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400">No tracking events available yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Check back in 24-48 hours for updates</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
