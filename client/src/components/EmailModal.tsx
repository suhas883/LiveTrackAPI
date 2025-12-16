import { X, Mail, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { getAffiliateUrl } from '../lib/affiliate';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackingNumber: string;
  carrier: string;
}

export default function EmailModal({ isOpen, onClose, trackingNumber, carrier }: EmailModalProps) {
  const [email, setEmail] = useState('');
  const [notifyOutForDelivery, setNotifyOutForDelivery] = useState(true);
  const [notifyDelivered, setNotifyDelivered] = useState(true);
  const [notifyDelays, setNotifyDelays] = useState(true);
  const [notifyAll, setNotifyAll] = useState(false);
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
      console.error('Error saving email subscription:', error);
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
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Mail className="h-6 w-6 text-blue-800" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Email Notifications</h2>
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
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Subscribed!</h3>
            <p className="text-gray-600 mb-4">
              You'll receive email updates for tracking number <span className="font-semibold">{trackingNumber}</span>
            </p>
            <p className="text-sm text-gray-500">Redirecting...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <p className="text-gray-600 mb-6">
              Get instant email alerts for tracking number <span className="font-semibold">{trackingNumber}</span>
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
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
                  className="w-5 h-5 text-blue-800 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">Package is out for delivery</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyDelivered}
                  onChange={(e) => setNotifyDelivered(e.target.checked)}
                  className="w-5 h-5 text-blue-800 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">Package is delivered</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyDelays}
                  onChange={(e) => setNotifyDelays(e.target.checked)}
                  className="w-5 h-5 text-blue-800 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">Delays or exceptions occur</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyAll}
                  onChange={(e) => setNotifyAll(e.target.checked)}
                  className="w-5 h-5 text-blue-800 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">All tracking updates</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-blue-800 text-white font-bold text-lg rounded-xl hover:bg-blue-900 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Subscribing...' : 'Subscribe Free'}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Free forever. Unsubscribe anytime.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
