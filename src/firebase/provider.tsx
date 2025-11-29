'use client';

import { AuthProvider } from '@/context/auth-context';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from 'next-themes';

import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase'; // <-- le bon import

export function Providers({ children }: { children: React.ReactNode }) {
  // Initialise Firebase correctement
  const { firebaseApp, auth, firestore, storage } = initializeFirebase();

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
          storage={storage}
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
