import { createContext, useContext, ReactNode } from "react";

interface AuthContextType {
  user: null;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  // Simple auth provider - you can add real auth logic later
  return (
    <AuthContext.Provider value={{ user: null, isAuthenticated: false }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

