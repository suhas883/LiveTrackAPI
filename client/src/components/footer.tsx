import { Package } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 py-8" data-testid="footer">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <span className="font-semibold">LiveTrackings</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Track
            </Link>
            <Link href="/history" className="hover:text-foreground transition-colors">
              History
            </Link>
            <Link href="/api-docs" className="hover:text-foreground transition-colors">
              API Documentation
            </Link>
          </nav>
          <p className="text-sm text-muted-foreground">
            Powered by Perplexity AI
          </p>
        </div>
      </div>
    </footer>
  );
}
