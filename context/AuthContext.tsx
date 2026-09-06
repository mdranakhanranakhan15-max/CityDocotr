'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface PatientUser {
  id: string;
  name: string;
  phone: string;
  location?: string | null;
  email?: string | null;
  createdAt?: string | Date;
}

interface OpenAuthModalOptions {
  isLoginView?: boolean;
  onAuthSuccess?: (user: PatientUser) => void;
  /** Optional destination pushed after successful login/signup (when no onAuthSuccess callback is registered). */
  redirectTo?: string | null;
}

interface AuthContextType {
  currentUser: PatientUser | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  isLoginView: boolean;
  openAuthModal: (options?: OpenAuthModalOptions) => void;
  closeAuthModal: () => void;
  toggleAuthView: () => void;
  setAuthView: (isLogin: boolean) => void;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string; user?: PatientUser }>;
  signup: (data: {
    name: string;
    mobileNumber?: string;
    email?: string;
    location: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string; user?: PatientUser }>;
  logout: () => Promise<void>;
  setCurrentUser: React.Dispatch<React.SetStateAction<PatientUser | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'citydoctor_patient_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<PatientUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [authSuccessCallback, setAuthSuccessCallback] = useState<((user: PatientUser) => void) | null>(null);
  const [authRedirectTo, setAuthRedirectTo] = useState<string | null>(null);

  // Initialize from localStorage and verify with server
  useEffect(() => {
    let isMounted = true;

    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id) {
          setCurrentUser(parsed);
        }
      }
    } catch {
      // Ignore localStorage error
    }

    async function checkSession() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (isMounted) {
          if (data.success && data.patient) {
            setCurrentUser(data.patient);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.patient));
          } else {
            // Keep local data or sync if needed
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const openAuthModal = useCallback((options?: OpenAuthModalOptions) => {
    if (options?.isLoginView !== undefined) {
      setIsLoginView(options.isLoginView);
    }
    if (options?.onAuthSuccess) {
      setAuthSuccessCallback(() => options.onAuthSuccess);
    } else {
      setAuthSuccessCallback(null);
    }
    // Optional post-auth destination (e.g. /patient/appointments). When set and no
    // onAuthSuccess callback was registered, successful login/signup redirects here.
    setAuthRedirectTo(options?.redirectTo || null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthSuccessCallback(null);
    setAuthRedirectTo(null);
  }, []);

  const toggleAuthView = useCallback(() => {
    setIsLoginView((prev) => !prev);
  }, []);

  const setAuthView = useCallback((isLogin: boolean) => {
    setIsLoginView(isLogin);
  }, []);

  const handleAuthSuccess = useCallback(
    (user: PatientUser) => {
      setCurrentUser(user);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
      setIsAuthModalOpen(false);

      const cb = authSuccessCallback;
      const redirectTo = authRedirectTo;
      setAuthSuccessCallback(null);
      setAuthRedirectTo(null);

      // Contextual flows (e.g. booking / checkout) register a callback that decides
      // where the user goes next — let it take over.
      if (cb) {
        cb(user);
        return;
      }

      // Plain "Login / Sign Up" buttons land the user in their patient dashboard.
      // Full navigation makes sure the freshly-set httpOnly session cookie
      // (citydoctor_patient_token) is honored by the destination page.
      if (redirectTo) {
        window.location.assign(redirectTo);
      }
    },
    [authSuccessCallback, authRedirectTo]
  );

  const login = async (identifier: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to login' };
      }

      handleAuthSuccess(data.patient);
      return { success: true, user: data.patient };
    } catch (err: any) {
      return { success: false, error: err.message || 'An unexpected error occurred.' };
    }
  };

  const signup = async (data: {
    name: string;
    mobileNumber?: string;
    email?: string;
    location: string;
    password: string;
  }) => {
    try {
      const res = await fetch('/api/patient/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const responseData = await res.json();

      if (!res.ok || !responseData.success) {
        return { success: false, error: responseData.error || 'Failed to sign up' };
      }

      handleAuthSuccess(responseData.patient);
      return { success: true, user: responseData.patient };
    } catch (err: any) {
      return { success: false, error: err.message || 'An unexpected error occurred.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      setCurrentUser(null);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        isAuthModalOpen,
        isLoginView,
        openAuthModal,
        closeAuthModal,
        toggleAuthView,
        setAuthView,
        login,
        signup,
        logout,
        setCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

