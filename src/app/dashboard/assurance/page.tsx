'use client';

import { useAuth } from '@/context/auth-context';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AssuranceMatrix from '@/components/dashboard/assurance-matrix';

export default function AssurancePage() {
    const { isAdmin } = useAuth();
    
    if (!isAdmin) {
        return (
          <Card>
            <CardHeader>
              <CardTitle>Accès non autorisé</CardTitle>
              <CardDescription>
                Vous devez être administrateur pour accéder à cette page.
              </CardDescription>
            </CardHeader>
          </Card>
        );
    }

    return (
        <AssuranceMatrix />
    );
}
