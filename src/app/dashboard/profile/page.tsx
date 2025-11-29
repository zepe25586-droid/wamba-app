

'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import type { BadgeColor, SpreadsheetData, CellData } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Award, Trash2, PiggyBank, Edit, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/use-local-storage';

const badgeColorClasses: Record<BadgeColor, string> = {
  gold: 'bg-yellow-200 text-yellow-800 border-yellow-300',
  silver: 'bg-slate-200 text-slate-800 border-slate-300',
  bronze: 'bg-orange-200 text-orange-800 border-orange-300',
  default: 'bg-blue-100 text-blue-800 border-blue-200',
};

const badgeIconColorClasses: Record<BadgeColor, string> = {
  gold: 'text-yellow-500',
  silver: 'text-slate-500',
  bronze: 'text-orange-500',
  default: 'text-blue-500',
}

export default function ProfilePage() {
  const { user, members, loading: isAuthLoading, deleteCurrentUser, projets, updateCurrentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [banqueData] = useLocalStorage<SpreadsheetData | null>('banque_matrix_data', null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedData, setEditedData] = useState({ name: '', avatarUrl: '' });


  const member = useMemo(() => {
    if (user && members) {
      return members.find(m => m.id === user.id);
    }
    return null;
  }, [user, members]);

  const userProjets = useMemo(() => {
    if (user && projets) {
        return projets.filter(p => p.memberId === user.id);
    }
    return [];
  }, [user, projets]);


  const isLoading = isAuthLoading;

  const sortedProjets = useMemo(() => {
    return [...userProjets].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [userProjets]);

  const annualBankBalance = useMemo(() => {
    if (!user || !banqueData || !banqueData.data || !banqueData.headers) {
      return 0;
    }

    const currentYear = new Date().getFullYear();
    const userRow = banqueData.data.find(row => row.id === user.id);

    if (!userRow) {
      return 0;
    }

    let total = 0;
    banqueData.headers.forEach(headerDate => {
      const date = new Date(headerDate);
      if (date.getFullYear() === currentYear) {
        const cell = userRow[headerDate] as CellData;
        if (cell && cell.value) {
          const value = parseFloat(cell.value);
          if (!isNaN(value)) {
            total += value;
          }
        }
      }
    });

    return total;
  }, [user, banqueData]);


  const handleDeleteAccount = async () => {
    try {
        await deleteCurrentUser();
        toast({
            title: "Compte supprimé",
            description: "Votre compte a été supprimé avec succès.",
            variant: "destructive"
        });
        router.push('/login');
    } catch(error: any) {
        toast({
            title: "Erreur",
            description: error.message || "Impossible de supprimer le compte.",
            variant: "destructive"
        });
    }
  }
  
  const openEditModal = () => {
    if (!member) return;
    setEditedData({ name: member.name, avatarUrl: member.avatarUrl });
    setIsEditModalOpen(true);
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setEditedData(prev => ({...prev, avatarUrl: loadEvent.target?.result as string}));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleUpdateProfile = async () => {
    try {
        await updateCurrentUser({ name: editedData.name, avatar: editedData.avatarUrl });
        toast({
            title: "Profil mis à jour",
            description: "Vos informations ont été modifiées avec succès."
        });
        setIsEditModalOpen(false);
    } catch(error: any) {
         toast({
            title: "Erreur",
            description: error.message || "Impossible de mettre à jour le profil.",
            variant: "destructive"
        });
    }
  };

  if (isLoading) {
    return (
       <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-col md:flex-row items-center gap-6">
             <Skeleton className="h-24 w-24 rounded-full" />
             <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-64" />
             </div>
          </CardHeader>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Mes Projets</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
        </Card>
      </div>
    );
  }

  if (!member) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profil non trouvé</CardTitle>
          <CardDescription>Impossible de charger les informations de votre profil.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Mon Profil</h1>
            <Button variant="outline" onClick={openEditModal}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier mon profil
            </Button>
        </div>
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <Avatar className="h-24 w-24 border-2 border-primary">
            <AvatarImage src={member.avatarUrl} alt={member.name} />
            <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <CardTitle className="text-3xl">{member.name}</CardTitle>
            <CardDescription className="text-lg">{member.email}</CardDescription>
            {member.badges && member.badges.length > 0 && (
                <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                    {member.badges.map(badge => (
                    <Badge key={badge.name} variant="secondary" className={cn("border text-sm", badgeColorClasses[badge.color])}>
                        <Award className={cn("h-4 w-4 mr-1.5", badgeIconColorClasses[badge.color])}/>
                        {badge.name}
                    </Badge>
                    ))}
                </div>
            )}
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Solde Banque Annuel</CardTitle>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XOF',
            }).format(annualBankBalance)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total de vos dépôts en banque pour l'année en cours.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mes Projets</CardTitle>
          <CardDescription>Voici la liste de tous vos projets enregistrés.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProjets.length > 0 ? (
                sortedProjets.map((projet) => (
                  <TableRow key={projet.id}>
                    <TableCell>{new Date(projet.date).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(projet.amount)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    Vous n'avez aucun projet pour le moment.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-destructive">
          <CardHeader>
              <CardTitle>Zone de danger</CardTitle>
              <CardDescription>
                  Actions irréversibles.
              </CardDescription>
          </CardHeader>
          <CardContent>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer mon compte
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Cette action est irréversible. Toutes les données associées à votre compte seront définitivement supprimées.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className={cn(buttonVariants({variant: 'destructive'}))}>
                        Oui, supprimer mon compte
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </CardContent>
      </Card>
      
      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier mon profil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom et Prénom</Label>
              <Input 
                id="edit-name" 
                value={editedData.name}
                onChange={(e) => setEditedData(prev => ({...prev, name: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-avatar">Photo de profil</Label>
              <div className="flex items-center gap-4">
                <Image src={editedData.avatarUrl} alt="Aperçu de l'avatar" width={64} height={64} className="rounded-full w-16 h-16 object-cover" />
                <Button type="button" variant="outline" asChild>
                   <label htmlFor="avatar-upload-edit" className="cursor-pointer flex items-center gap-2">
                     <Upload className="h-4 w-4" />
                     <span>Changer</span>
                   </label>
                </Button>
                <Input id="avatar-upload-edit" type="file" className="hidden" accept="image/*" onChange={handleAvatarChange}/>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={handleUpdateProfile}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
