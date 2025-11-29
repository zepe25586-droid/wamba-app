
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import type { Beneficiary } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function BeneficiariesPage() {
  const { isAdmin, members, beneficiaries, setBeneficiaries } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBeneficiary, setNewBeneficiary] = useState<{memberId: string, amount: string, date: string}>({
    memberId: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });
  const { toast } = useToast();

  const getMemberInfo = (memberId: string) => {
    return members?.find((m) => m.id === memberId);
  };
  
  const handleAddBeneficiary = () => {
    if (!newBeneficiary.memberId || !newBeneficiary.amount || !newBeneficiary.date) {
        toast({
            variant: 'destructive',
            title: "Erreur",
            description: "Veuillez remplir tous les champs.",
        });
        return;
    }
    const newBene: Beneficiary = {
        id: `bene-${Date.now()}`,
        memberId: newBeneficiary.memberId,
        amount: parseFloat(newBeneficiary.amount),
        date: newBeneficiary.date
    };

    setBeneficiaries(prev => [...prev, newBene]);
    
    setIsAddModalOpen(false);
    setNewBeneficiary({ memberId: '', amount: '', date: format(new Date(), 'yyyy-MM-dd') });
    toast({
        title: "Bénéficiaire ajouté",
        description: `${getMemberInfo(newBeneficiary.memberId)?.name} a été ajouté à la liste des bénéficiaires.`,
    });
  };

  const handleDelete = (id: string) => {
    const beneficiaryToDelete = beneficiaries?.find((b) => b.id === id);
    if (!beneficiaryToDelete) return;
    
    setBeneficiaries(prev => prev.filter(b => b.id !== id));

    toast({
        variant: 'destructive',
        title: "Bénéficiaire supprimé",
        description: `${getMemberInfo(beneficiaryToDelete.memberId)?.name} a été retiré de la liste.`,
    });
  };
  
  const sortedBeneficiaries = useMemo(() => {
    if (!beneficiaries) return [];
    return [...beneficiaries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [beneficiaries]);


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
            <h1 className="text-2xl font-bold tracking-tight">Gérer les bénéficiaires</h1>
            <p className="text-muted-foreground">
                Ajoutez ou supprimez les bénéficiaires de la tontine.
            </p>
        </div>
        <Button size="sm" className="gap-1" onClick={() => setIsAddModalOpen(true)}>
            <PlusCircle className="h-4 w-4" />
            Ajouter un bénéficiaire
        </Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Membre</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedBeneficiaries.map((beneficiary) => {
                const member = getMemberInfo(beneficiary.memberId);
                return (
                  <TableRow key={beneficiary.id}>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'XOF',
                      }).format(beneficiary.amount)}
                    </TableCell>
                    <TableCell>
                      {new Date(beneficiary.date).toLocaleDateString('fr-FR')}
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
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(beneficiary.id)}>
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
            <DialogTitle>Ajouter un nouveau bénéficiaire</DialogTitle>
            <DialogDescription>
              Sélectionnez un membre et entrez le montant et la date.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
                <label>Membre</label>
                 <Select value={newBeneficiary.memberId} onValueChange={(value) => setNewBeneficiary(prev => ({...prev, memberId: value}))}>
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
                    placeholder="ex: 500"
                    value={newBeneficiary.amount}
                    onChange={(e) => setNewBeneficiary(prev => ({...prev, amount: e.target.value}))}
                />
            </div>
             <div className="space-y-2">
                <label>Date</label>
                <Input 
                    type="date"
                    value={newBeneficiary.date}
                    onChange={(e) => setNewBeneficiary(prev => ({...prev, date: e.target.value}))}
                />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={handleAddBeneficiary}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
