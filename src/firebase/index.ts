'use client';

import { AuthProvider } from '@/context/auth-context';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from 'next-themes';

import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

export function Providers({ children }: { children: React.ReactNode }) {
  const { firebaseApp, auth, firestore } = initializeFirebase(); // <-- CORRECT

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <FirebaseProvider
          firebaseApp={firebaseApp}
          auth={auth}
          firestore={firestore}
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </FirebaseProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
