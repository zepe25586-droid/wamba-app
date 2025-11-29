
'use client';

import MatrixTable from '@/components/dashboard/matrix-table';
import { useAuth } from '@/context/auth-context';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProjetsPage() {
    const { isAdmin, projets, setProjets } = useAuth();

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
            title="Projets"
            description="Gérez les projets des membres sous forme de matrice."
            storageKey="projets_matrix_data"
            dataType='currency'
        />
    );
}
