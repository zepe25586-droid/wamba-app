import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Wallet, PiggyBank } from 'lucide-react';

interface StatsCardsProps {
  totalMembers: number;
  totalProjets: number;
  totalBanque: number;
}

export default function StatsCards({
  totalMembers,
  totalProjets,
  totalBanque,
}: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total des membres</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalMembers}</div>
          <p className="text-xs text-muted-foreground">Actuellement actifs dans la tontine</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total des projets</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XOF',
            }).format(totalProjets)}
          </div>
          <p className="text-xs text-muted-foreground">Montant total collecté</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Banque</CardTitle>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XOF',
            }).format(totalBanque)}
          </div>
          <p className="text-xs text-muted-foreground">Somme totale de la banque</p>
        </CardContent>
      </Card>
    </div>
  );
}
