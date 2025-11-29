'use client';

import { AuthProvider } from '@/context/auth-context';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from 'next-themes';

import { FirebaseProvider } from '@/firebase/provider';
import { firebaseApp, firestore, auth } from '@/firebase'; // <-- IMPORT NECESSAIRE

export function Providers({ children }: { children: React.ReactNode }) {
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
          firestore={firestore}
          auth={auth}
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
