

'use client'

import StatsCards from '@/components/dashboard/stats-cards';
import { ProjetChart } from '@/components/dashboard/projet-chart';
import { RecentProjets } from '@/components/dashboard/recent-projets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LastBeneficiaries } from '@/components/dashboard/last-beneficiaries';
import { SpreadsheetData, CellData } from '@/lib/types';
import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useLocalStorage } from '@/hooks/use-local-storage';

export default function DashboardPage() {
  const { members, projets, beneficiaries, loading: authLoading } = useAuth();
  
  const [banqueData] = useLocalStorage<SpreadsheetData | null>('banque_data', null);

  const totalMembers = members?.length ?? 0;
  const totalProjets = projets
    ?.filter((c) => c.status === 'Payé')
    .reduce((acc, c) => acc + c.amount, 0) ?? 0;

  const totalBanque = useMemo(() => {
    if (!banqueData || !banqueData.data) {
      return 0;
    }
    const amountHeader = banqueData.headers.find(h => h.toLowerCase().includes('montant'));
    if (!amountHeader) {
      return 0;
    }
    return banqueData.data.reduce((sum, row) => {
      const cell = row[amountHeader] as CellData;
      const value = parseFloat(cell?.value);
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
  }, [banqueData]);

  const isLoading = authLoading;


  return (
    <div className="grid gap-4 md:gap-8">
       <Card>
        <CardHeader>
          <CardTitle>Derniers Bénéficiaires</CardTitle>
        </CardHeader>
        <CardContent>
            { !isLoading && beneficiaries && members && (
              <LastBeneficiaries beneficiaries={beneficiaries} members={members} />
            )}
            { isLoading && <p>Chargement des bénéficiaires...</p>}
        </CardContent>
      </Card>
      <StatsCards
        totalMembers={totalMembers}
        totalProjets={totalProjets}
        totalBanque={totalBanque}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Aperçu des projets</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
             <ProjetChart projets={projets || []} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Projets Récents</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentProjets projets={(projets || []).slice(0, 5)} members={members || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
