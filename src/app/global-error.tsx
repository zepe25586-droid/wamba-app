'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-destructive mb-4">
              Quelque chose s'est mal passé !
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Une erreur inattendue est survenue.
            </p>
            
            {/* Developer-facing error message */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-muted p-4 rounded-md text-left text-sm max-w-2xl mx-auto mb-6">
                  <h2 className="font-semibold text-destructive-foreground mb-2">Détails de l'erreur :</h2>
                  <pre className="whitespace-pre-wrap break-words font-mono text-destructive-foreground/80">
                      {error.stack || error.message}
                  </pre>
              </div>
            )}
            
            <Button onClick={() => reset()}>Réessayer</Button>
          </div>
        </div>
      </body>
    </html>
  );
}
