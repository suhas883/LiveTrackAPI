import { X, MessageSquare, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { getAffiliateUrl } from '../lib/affiliate';

interface SmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackingNumber: string;
  carrier: string;
}

export default function SmsModal({ isOpen, onClose, trackingNumber, carrier }: SmsModalProps) {
  const [phone, setPhone] = useState('');
  const [notifyOutForDelivery, setNotifyOutForDelivery] = useState(true);
  const [notifyDelivered, setNotifyDelivered] = useState(true);
  const [notifyDelays, setNotifyDelays] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      setSuccess(true);
      setTimeout(() => {
        window.location.href = getAffiliateUrl('sweepstakes');
      }, 2000);
    } catch (error) {
      console.error('Error saving SMS subscription:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-sky-800" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">SMS Notifications</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Enabled!</h3>
            <p className="text-gray-600 mb-4">
              You'll receive SMS alerts for tracking number <span className="font-semibold">{trackingNumber}</span>
            </p>
            <p className="text-sm text-gray-500">Redirecting...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <p className="text-gray-600 mb-6">
              Get instant SMS alerts for tracking number <span className="font-semibold">{trackingNumber}</span>
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                International format recommended (e.g., +1 for US)
              </p>
            </div>

            <div className="mb-6 space-y-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notify me when:
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOutForDelivery}
                  onChange={(e) => setNotifyOutForDelivery(e.target.checked)}
                  className="w-5 h-5 text-sky-800 rounded focus:ring-sky-500"
                />
                <span className="text-gray-700">Package is out for delivery</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyDelivered}
                  onChange={(e) => setNotifyDelivered(e.target.checked)}
                  className="w-5 h-5 text-sky-800 rounded focus:ring-sky-500"
                />
                <span className="text-gray-700">Package is delivered</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyDelays}
                  onChange={(e) => setNotifyDelays(e.target.checked)}
                  className="w-5 h-5 text-sky-800 rounded focus:ring-sky-500"
                />
                <span className="text-gray-700">Delays or exceptions occur</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-sky-800 text-white font-bold text-lg rounded-xl hover:bg-sky-900 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enabling...' : 'Enable SMS Alerts'}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Standard SMS rates may apply. Unsubscribe anytime.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
