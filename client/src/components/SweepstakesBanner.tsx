import { Gift, Sparkles, ArrowRight } from 'lucide-react';
import { getAffiliateUrl } from '../lib/affiliate';

export default function SweepstakesBanner() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-xl shadow-lg overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJoLTYweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2EpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-30"></div>

        <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Gift className="h-12 w-12 text-purple-600" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-yellow-300" />
              <span className="text-white text-sm font-bold uppercase tracking-wide">Special Offer</span>
              <Sparkles className="h-5 w-5 text-yellow-300" />
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
              Win $5,000 Cash!
            </h3>

            <p className="text-purple-100 text-sm md:text-base mb-4">
              Enter our monthly sweepstakes! No purchase necessary. Drawing every month.
            </p>

            <a
              href={getAffiliateUrl('sweepstakes')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-white text-purple-600 font-bold rounded-lg hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl gap-2 group"
              data-testid="link-sweepstakes"
            >
              <span>Enter Free Now</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="absolute top-4 right-4 bg-yellow-400 text-purple-900 px-3 py-1 rounded-full text-xs font-bold">
            FREE ENTRY
          </div>
        </div>
      </div>
    </div>
  );
}
