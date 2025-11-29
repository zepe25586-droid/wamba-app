'use client';

import MatrixTable from '@/components/dashboard/matrix-table';
import { useAuth } from '@/context/auth-context';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BanquePage() {
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
        <MatrixTable
            title="Banque"
            description="Gérez les données de la banque sous forme de matrice."
            storageKey="banque_matrix_data"
            dataType='currency'
        />
    );
}
