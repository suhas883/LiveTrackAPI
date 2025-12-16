import { Link, useLocation } from "wouter";

export default function Header() {
  const [location] = useLocation();

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <a className="font-bold text-xl text-primary flex items-center gap-2">
            📦 LiveTrackAPI
          </a>
        </Link>
        
        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Link href="/">
            <a className={`text-sm font-medium hover:text-primary transition-colors ${location === '/' ? 'text-primary' : 'text-gray-600'}`}>
              Dashboard
            </a>
          </Link>

          {/* Blog Link - Connects to your existing Blog Page */}
          <Link href="/blog">
            <a className={`text-sm font-medium hover:text-primary transition-colors ${location === '/blog' ? 'text-primary' : 'text-gray-600'}`}>
              Blog
            </a>
          </Link>

          {/* Yendo Affiliate Link */}
          {/* REPLACE THE HREF BELOW WITH YOUR ACTUAL AFFILIATE LINK */}
          <a 
            href="https://www.yendo.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full transition-colors shadow-sm"
          >
            💳 Get Yendo Card
          </a>

          <div className="h-6 w-px bg-gray-200"></div>

          {/* Logout */}
          <div 
            className="cursor-pointer text-sm font-medium text-red-500 hover:text-red-700" 
            onClick={() => window.location.href = '/auth'}
          >
            Logout
          </div>
        </nav>
      </div>
    </header>
  );
}
