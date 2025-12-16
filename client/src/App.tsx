import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import Header from './components/Header';
import Hero from './components/Hero';
import TrackingResults from './components/TrackingResults';
import AIPredictions from './components/AIPredictions';
import SweepstakesBanner from './components/SweepstakesBanner';
import YendoOffer from './components/YendoOffer';
import Features from './components/Features';
import Carriers from './components/Carriers';
// import Footer from './components/Footer';  // Commented out - removed for build fix
import EmailModal from './components/EmailModal';
import SmsModal from './components/SmsModal';
import AIChat from './components/AIChat';

function App() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('auto');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleTrack = async (inputTrackingNumber: string, inputCarrier: string) => {
    if (!inputTrackingNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a tracking number",
        variant: "destructive"
      });
      return;
    }

    setTrackingNumber(inputTrackingNumber);
    setCarrier(inputCarrier);
    setIsLoading(true);
    setShowResults(true);
    setTrackingData(null);
    setTrackingError(null);

    try {
      const response = await fetch('/api/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackingNumber: inputTrackingNumber,
          carrier: inputCarrier
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to track package');
      }

      setTrackingData(data);
      setCarrier(data.carrier || inputCarrier);
    } catch (err: any) {
      console.error('Tracking error:', err);
      setTrackingError(err.message || 'Failed to track package. Please try again.');
      toast({
        title: "Tracking Error",
        description: err.message || 'Failed to track package. Please check the tracking number and try again.',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      {!showResults && <Hero onTrack={handleTrack} />}
      
      {showResults && (
        <>
          {trackingError ? (
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Tracking Not Found</h3>
                <p className="text-gray-600 mb-6">{trackingError}</p>
                <button
                  onClick={() => {
                    setShowResults(false);
                    setTrackingError(null);
                  }}
                  className="px-6 py-3 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900 transition-all"
                  data-testid="button-try-again"
                >
                  Try Another Number
                </button>
              </div>
            </div>
          ) : (
            <>
              <TrackingResults
                trackingNumber={trackingNumber}
                carrier={carrier}
                trackingData={trackingData}
                isLoading={isLoading}
                onEmailClick={() => setEmailModalOpen(true)}
                onSmsClick={() => setSmsModalOpen(true)}
              />
              <AIPredictions
                trackingData={trackingData}
                isLoading={isLoading}
              />
              <SweepstakesBanner />
              <YendoOffer />
            </>
          )}
        </>
      )}
      
      {!showResults && <SweepstakesBanner />}
      
      <Features />
      <Carriers />
      {/* Footer was here - Removed for build fix */}
      
      <EmailModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        trackingNumber={trackingNumber}
        carrier={carrier}
      />
      
      <SmsModal
        isOpen={smsModalOpen}
        onClose={() => setSmsModalOpen(false)}
        trackingNumber={trackingNumber}
        carrier={carrier}
      />
      
      <AIChat />
      
      <Toaster />
    </div>
  );
}

export default App;
