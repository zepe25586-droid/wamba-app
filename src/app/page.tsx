
'use client';

import { useAuth } from '@/context/auth-context';
import { redirect } from 'next/navigation';

export default function Home() {
  const { user, loading } = useAuth();

  // Attendre la fin du chargement pour éviter une redirection prématurée
  if (loading) {
    // Vous pouvez afficher un spinner de chargement ici si vous le souhaitez
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
