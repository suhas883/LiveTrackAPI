import { Route, useLocation } from "wouter";

export function ProtectedRoute({ path, component: Component }: { path: string; component: any }) {
  const [location] = useLocation();
  
  // For now, just render the route without protection
  // You can add auth logic here later
  return <Route path={path} component={Component} />;
}

