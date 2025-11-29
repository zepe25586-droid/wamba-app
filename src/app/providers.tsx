'use client';

import { AuthProvider } from '@/context/auth-context';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from 'next-themes';
import { FirebaseProvider } from '@/firebase/provider';   // ← IMPORTANT

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <FirebaseProvider>        {/* ← AJOUT OBLIGATOIRE */}
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </FirebaseProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
