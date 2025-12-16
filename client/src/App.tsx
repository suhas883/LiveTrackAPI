import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

// ✅ RESTORED IMPORTS
import Header from "./components/Header";
import Footer from "./components/Footer";

// ✅ IMPORT YOUR BLOG PAGE
// (If your blog file is named differently, update this import!)
import BlogPage from "@/pages/blog"; 

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <Route path="/auth" component={AuthPage} />
      
          {/* ✅ RESTORED BLOG ROUTE - Live deployment */}
      <Route path="/blog" component={BlogPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          {/* ✅ HEADER IS BACK */}
          <Header />
          
          <main className="flex-grow">
             <Router />
          </main>

          <Toaster />
          
          {/* ✅ FOOTER IS BACK */}
          <Footer />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
