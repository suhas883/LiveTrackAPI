import { Package, History, Code } from "lucide-react";
import { Link, useLocation } from "wouter";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";

export function Header() {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between gap-4 px-4">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer" data-testid="link-home">
            <Package className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">LiveTrackings</span>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          <Link href="/">
            <Button
              variant={location === "/" ? "secondary" : "ghost"}
              size="sm"
              data-testid="link-track"
            >
              <Package className="h-4 w-4 mr-1.5" />
              Track
            </Button>
          </Link>
          <Link href="/history">
            <Button
              variant={location === "/history" ? "secondary" : "ghost"}
              size="sm"
              data-testid="link-history"
            >
              <History className="h-4 w-4 mr-1.5" />
              History
            </Button>
          </Link>
          <Link href="/api-docs">
            <Button
              variant={location === "/api-docs" ? "secondary" : "ghost"}
              size="sm"
              data-testid="link-api"
            >
              <Code className="h-4 w-4 mr-1.5" />
              API
            </Button>
          </Link>
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
