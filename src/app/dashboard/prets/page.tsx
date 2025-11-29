
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { MoreHorizontal, PlusCircle, ArrowUpDown, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import type { Pret } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

type SortableKeys = 'member' | 'amount' | 'date' | 'status';
type SortConfig = {
    key: SortableKeys;
    direction: 'ascending' | 'descending';
} | null;

export default function PretsPage() {
  const { isAdmin, members, prets, setPrets } = useAuth();
  const { toast } = useToast();

  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPret, setNewPret] = useState({
    memberId: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'En cours' as 'En cours' | 'Remboursé'
  });


  const getMemberInfo = (memberId: string) => {
    return members?.find((m) => m.id === memberId);
  };
  
  const handleStatusChange = (id: string, status: 'En cours' | 'Remboursé') => {
    setPrets(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const handleDelete = (id: string) => {
    setPrets(prev => prev.filter(p => p.id !== id));
    toast({
        title: "Prêt supprimé",
        description: "Le prêt a été supprimé de la liste.",
        variant: "destructive"
    });
  };
  
  const handleAddPret = () => {
    if (!newPret.memberId || !newPret.amount || !newPret.date) {
        toast({
            variant: 'destructive',
            title: "Erreur",
            description: "Veuillez remplir tous les champs.",
        });
        return;
    }
    const newLoan: Pret = {
        id: `pret-${Date.now()}`,
        memberId: newPret.memberId,
        amount: parseFloat(newPret.amount),
        date: newPret.date,
        status: newPret.status,
    };
    setPrets(prev => [...prev, newLoan]);
    setIsAddModalOpen(false);
    setNewPret({ memberId: '', amount: '', date: format(new Date(), 'yyyy-MM-dd'), status: 'En cours' });
    toast({
        title: "Prêt ajouté",
        description: "Le nouveau prêt a été enregistré.",
    });
  };
  
  const requestSort = (key: SortableKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedPrets = useMemo(() => {
    if (!prets) return [];
    let sortableItems = [...prets];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        if (sortConfig.key === 'member') {
          aValue = getMemberInfo(a.memberId)?.name || '';
          bValue = getMemberInfo(b.memberId)?.name || '';
        } else if (sortConfig.key === 'amount') {
          aValue = a.amount;
          bValue = b.amount;
        } else if (sortConfig.key === 'date') {
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
        } else { // status
          aValue = a.status;
          bValue = b.status;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    } else {
        sortableItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return sortableItems;
  }, [prets, sortConfig, members]);
  
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Prêts</h1>
            <p className="text-muted-foreground">
                Suivez et gérez tous les prêts accordés.
            </p>
        </div>
        <Button size="sm" className="gap-1" onClick={() => setIsAddModalOpen(true)}>
          <PlusCircle className="h-4 w-4" />
          Ajouter un prêt
        </Button>
      </div>
      <Card>
        <CardContent className="pt-6">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>
                        <Button variant="ghost" onClick={() => requestSort('member')}>
                            Membre
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                        <Button variant="ghost" onClick={() => requestSort('amount')}>
                            Montant
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                        <Button variant="ghost" onClick={() => requestSort('date')}>
                            Date
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    </TableHead>
                    <TableHead>
                        <Button variant="ghost" onClick={() => requestSort('status')}>
                            Statut
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    </TableHead>
                    <TableHead>
                    <span className="sr-only">Actions</span>
                    </TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {sortedPrets.map((pret) => {
                    const member = getMemberInfo(pret.memberId);
                    return (
                    <TableRow key={pret.id}>
                        <TableCell>
                            <div className='flex items-center gap-2'>
                                {member ? (
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={member?.avatarUrl} alt={member?.name} />
                                            <AvatarFallback>
                                            {member?.name.split(' ').map((n) => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{member?.name}</div>
                                            <div className="text-sm text-muted-foreground hidden md:block">{member?.email}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground">Membre inconnu</div>
                                )}
                            </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                        {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'XOF',
                        }).format(pret.amount)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                        {new Date(pret.date).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                        <Badge
                            variant={
                            pret.status === 'Remboursé' ? 'default' : 'secondary'
                            }
                            className={cn(
                            pret.status === 'Remboursé'
                                ? 'bg-accent text-accent-foreground'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                            )}
                        >
                            {pret.status}
                        </Badge>
                        </TableCell>
                        <TableCell>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                                >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onSelect={() => handleStatusChange(pret.id, 'Remboursé')}>
                                    Marquer comme remboursé
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleStatusChange(pret.id, 'En cours')}>
                                    Marquer comme en cours
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(pret.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    );
                })}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
      
       <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau prêt</DialogTitle>
            <DialogDescription>
              Sélectionnez un membre et entrez les détails du prêt.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
                <label>Membre</label>
                 <Select value={newPret.memberId} onValueChange={(value) => setNewPret(prev => ({...prev, memberId: value}))}>
                    <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un membre" />
                    </SelectTrigger>
                    <SelectContent>
                        {members?.map(member => (
                            <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <label>Montant</label>
                <Input 
                    type="number"
                    placeholder="ex: 1000"
                    value={newPret.amount}
                    onChange={(e) => setNewPret(prev => ({...prev, amount: e.target.value}))}
                />
            </div>
             <div className="space-y-2">
                <label>Date</label>
                <Input 
                    type="date"
                    value={newPret.date}
                    onChange={(e) => setNewPret(prev => ({...prev, date: e.target.value}))}
                />
            </div>
             <div className="space-y-2">
                <label>Statut</label>
                 <Select value={newPret.status} onValueChange={(value: 'En cours' | 'Remboursé') => setNewPret(prev => ({...prev, status: value}))}>
                    <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="En cours">En cours</SelectItem>
                        <SelectItem value="Remboursé">Remboursé</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={handleAddPret}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
