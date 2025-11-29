

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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, PlusCircle, ArrowUpDown, Award, X, Check, Upload, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import type { Member, Badge as BadgeType, BadgeColor } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { ADMIN_EMAIL } from '@/lib/auth';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { useFirestore, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { doc } from '@/firebase/firestore';


type SortableKeys = 'name' | 'joinDate' | 'status';

type SortConfig = {
    key: SortableKeys;
    direction: 'ascending' | 'descending';
} | null;

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
};


export default function MembersPage() {
  const { isAdmin, user, members, setMembers, createMemberByAdmin } = useAuth();
  const firestore = useFirestore();
  
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [newBadgeName, setNewBadgeName] = useState('');
  const [newBadgeColor, setNewBadgeColor] = useState<BadgeColor>('default');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editedData, setEditedData] = useState({ name: '', email: '', avatarUrl: '' });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMemberData, setNewMemberData] = useState({ name: '', email: '', password: '', avatar: '', phoneNumber: '' });
  const [showPassword, setShowPassword] = useState(false);

  const { toast } = useToast();
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    const memberRef = doc(firestore, 'members', id);
    deleteDocumentNonBlocking(memberRef);
    setMembers(prev => prev.filter(m => m.id !== id));
     toast({
        title: "Membre supprimé",
        description: "Le membre a été supprimé.",
        variant: "destructive"
    });
  };
  
  const handleStatusChange = (id: string, status: 'approved' | 'rejected') => {
    if (!firestore) return;
    if (status === 'rejected') {
       handleDelete(id);
       toast({
           title: "Membre rejeté",
           description: "L'inscription du membre a été rejetée et supprimée.",
           variant: "destructive"
       });
    } else {
        const memberRef = doc(firestore, 'members', id);
        setDocumentNonBlocking(memberRef, { status: 'approved' }, { merge: true });
        setMembers(prev => prev.map(m => m.id === id ? {...m, status: 'approved'} : m));
        toast({
            title: "Membre approuvé",
            description: "Le membre peut maintenant se connecter.",
        });
    }
  };
  
  const requestSort = (key: SortableKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedMembers = useMemo(() => {
    let sortableItems = [...members];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;
        if (sortConfig.key === 'name') {
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
        } else if (sortConfig.key === 'joinDate') {
            aValue = new Date(a.joinDate).getTime();
            bValue = new Date(b.joinDate).getTime();
        } else { // status
            aValue = a.status || '';
            bValue = b.status || '';
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    // Always show pending members first
    sortableItems.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return 0;
    });

    return sortableItems;
  }, [members, sortConfig]);
  
  const openBadgeModal = (member: Member) => {
    setSelectedMember(member);
    setIsBadgeModalOpen(true);
  };

  const updateMemberBadges = (memberId: string, newBadges: BadgeType[]) => {
    if (!firestore) return;
    const memberRef = doc(firestore, 'members', memberId);
    setDocumentNonBlocking(memberRef, { badges: newBadges }, { merge: true });
    setMembers(prev => prev.map(m => m.id === memberId ? {...m, badges: newBadges} : m));
  }
  
  const handleAddBadge = () => {
    if (selectedMember && newBadgeName.trim()) {
      const newBadge: BadgeType = { name: newBadgeName.trim(), color: newBadgeColor };
      const newBadges = [...(selectedMember.badges || []), newBadge];
      updateMemberBadges(selectedMember.id, newBadges);
      setNewBadgeName('');
      setNewBadgeColor('default');
      setIsBadgeModalOpen(false);
    }
  };

  const handleRemoveBadge = (badgeToRemove: BadgeType) => {
    if (selectedMember) {
        const newBadges = (selectedMember.badges || []).filter(b => b.name !== badgeToRemove.name || b.color !== badgeToRemove.color);
        updateMemberBadges(selectedMember.id, newBadges);
        // Update selected member to reflect change in the modal
        setSelectedMember(prev => prev ? { ...prev, badges: newBadges } : null);
    }
  };

   const openEditModal = (member: Member) => {
    setEditingMember(member);
    setEditedData({ name: member.name, email: member.email, avatarUrl: member.avatarUrl });
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
  
  const handleNewMemberAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setNewMemberData(prev => ({...prev, avatar: loadEvent.target?.result as string}));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateMember = () => {
    if (!editingMember || !firestore) return;

    const memberRef = doc(firestore, 'members', editingMember.id);
    const dataToUpdate = {
        name: editedData.name,
        avatarUrl: editedData.avatarUrl
    };
    setDocumentNonBlocking(memberRef, dataToUpdate, { merge: true });
    
    setMembers(prev => prev.map(m => m.id === editingMember.id ? {...m, ...dataToUpdate} : m));
    
    toast({
        title: "Membre mis à jour",
        description: "Les informations du membre ont été modifiées.",
    });

    setIsEditModalOpen(false);
    setEditingMember(null);
  };
  
  const handleAddMember = async () => {
    if (!newMemberData.name || !newMemberData.email || !newMemberData.password || !newMemberData.avatar || !newMemberData.phoneNumber) {
      toast({
        variant: "destructive",
        title: "Champs incomplets",
        description: "Veuillez remplir tous les champs."
      });
      return;
    }

     // In a real app, you'd also want to check if the email already exists
    if (members.some(m => m.email.toLowerCase() === newMemberData.email.toLowerCase())) {
        toast({
            variant: "destructive",
            title: "Email déjà utilisé",
            description: "Un membre avec cette adresse e-mail existe déjà.",
        });
        return;
    }

    try {
        await createMemberByAdmin({ ...newMemberData });
         toast({
            title: "Membre ajouté",
            description: `${newMemberData.name} a été ajouté et est en attente d'approbation.`,
        });
        setIsAddModalOpen(false);
        setNewMemberData({ name: '', email: '', password: '', avatar: '', phoneNumber: '' });
    } catch(error: any) {
        toast({
            variant: "destructive",
            title: "Erreur",
            description: error.message || "Impossible d'ajouter le membre."
        })
    }
  };

  const getPrimaryBadgeColor = (member: Member): BadgeColor | null => {
    if (!member.badges || member.badges.length === 0) return null;
    if (member.badges.some(b => b.color === 'gold')) return 'gold';
    if (member.badges.some(b => b.color === 'silver')) return 'silver';
    if (member.badges.some(b => b.color === 'bronze')) return 'bronze';
    return 'default';
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Membres</h1>
          <p className="text-muted-foreground">
            Gérez les membres et les nouvelles inscriptions.
          </p>
        </div>
        {isAdmin && (
          <Button size="sm" className="gap-1" onClick={() => setIsAddModalOpen(true)}>
            <PlusCircle className="h-4 w-4" />
            Ajouter un membre
          </Button>
        )}
      </div>
      <Card>
        <CardContent className="pt-6">
          {members.length === 0 && <p>Chargement des membres...</p>}
          {members.length > 0 && (
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>
                        <Button variant="ghost" onClick={() => requestSort('name')}>
                            Nom
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                        <Button variant="ghost" onClick={() => requestSort('joinDate')}>
                            Date d'inscription
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
                {sortedMembers.map((member) => {
                    const primaryBadgeColor = getPrimaryBadgeColor(member);
                    return (
                    <TableRow key={member.id} className={cn(member.status === 'pending' && 'bg-yellow-50 dark:bg-yellow-900/20')}>
                    <TableCell>
                        <div className="flex items-center gap-3">
                        <div className="relative">
                            <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatarUrl} alt={member.name} />
                            <AvatarFallback>
                                {member.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                            </Avatar>
                            {primaryBadgeColor && (
                            <div className={cn("absolute -bottom-1 -right-1 p-0.5 rounded-full border-2 border-background", badgeColorClasses[primaryBadgeColor])}>
                                <Award className={cn("h-3 w-3", badgeIconColorClasses[primaryBadgeColor])} />
                            </div>
                            )}
                        </div>
                        <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">
                            {member.email}
                            {member.email === ADMIN_EMAIL && (
                                <Badge variant="destructive" className="ml-2">Admin</Badge>
                            )}
                            </div>
                            {member.badges && member.badges.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {member.badges.map(badge => (
                                <Badge key={badge.name} variant="secondary" className={cn("border", badgeColorClasses[badge.color])}>
                                    <Award className={cn("h-3 w-3 mr-1", badgeIconColorClasses[badge.color])}/>
                                    {badge.name}
                                </Badge>
                                ))}
                            </div>
                            )}
                        </div>
                        </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                        {new Date(member.joinDate).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                        <Badge variant={member.status === 'approved' ? 'default' : member.status === 'pending' ? 'secondary' : 'destructive'}
                            className={cn(
                                member.status === 'approved' && 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
                                member.status === 'pending' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400'
                            )}
                        >
                            {member.status === 'approved' ? 'Approuvé' : member.status === 'pending' ? 'En attente' : 'Rejeté'}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        {isAdmin && member.email !== user?.email && (
                        <>
                            {member.status === 'pending' ? (
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700" onClick={() => handleStatusChange(member.id, 'approved')}>
                                        <Check className="h-4 w-4 mr-1"/> Approuver
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleStatusChange(member.id, 'rejected')}>
                                        <X className="h-4 w-4 mr-1"/> Rejeter
                                    </Button>
                                </div>
                            ) : (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onSelect={() => openEditModal(member)}>Modifier</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => openBadgeModal(member)}>
                                    Gérer les badges
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDelete(member.id)}
                                >
                                    Supprimer
                                </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            )}
                        </>
                        )}
                    </TableCell>
                    </TableRow>
                )})}
                </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isBadgeModalOpen} onOpenChange={setIsBadgeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gérer les badges de {selectedMember?.name}</DialogTitle>
            <DialogDescription>
              Ajoutez ou supprimez des badges pour ce membre.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
                <Input 
                    value={newBadgeName}
                    onChange={(e) => setNewBadgeName(e.target.value)}
                    placeholder="Nom du nouveau badge"
                    className="flex-1"
                />
                <Select value={newBadgeColor} onValueChange={(value) => setNewBadgeColor(value as BadgeColor)}>
                    <SelectTrigger className="w-full sm:w-[120px]">
                        <SelectValue placeholder="Couleur" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="default">Défaut</SelectItem>
                        <SelectItem value="gold">Or</SelectItem>
                        <SelectItem value="silver">Argent</SelectItem>
                        <SelectItem value="bronze">Bronze</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={handleAddBadge} className="w-full sm:w-auto">Ajouter</Button>
            </div>
            {selectedMember?.badges && selectedMember.badges.length > 0 ? (
                <div className="space-y-2">
                    <p className="text-sm font-medium">Badges actuels :</p>
                    <div className="flex flex-wrap gap-2">
                        {selectedMember.badges.map(badge => (
                           <Badge key={badge.name} variant="secondary" className={cn("pr-1 border", badgeColorClasses[badge.color])}>
                             <Award className={cn("h-3 w-3 mr-1", badgeIconColorClasses[badge.color])}/>
                             {badge.name}
                             <button onClick={() => handleRemoveBadge(badge)} className="ml-1.5 p-0.5 rounded-full hover:bg-black/10">
                                <X className="h-3 w-3"/>
                             </button>
                           </Badge>
                        ))}
                    </div>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">Ce membre n'a aucun badge.</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline" onClick={() => { setNewBadgeName(''); setNewBadgeColor('default'); setSelectedMember(null); }}>Fermer</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le membre : {editingMember?.name}</DialogTitle>
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
              <Label htmlFor="edit-email">Email</Label>
              <Input 
                id="edit-email" 
                type="email"
                value={editedData.email}
                onChange={(e) => setEditedData(prev => ({...prev, email: e.target.value}))}
                disabled
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
            <Button onClick={handleUpdateMember}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau membre</DialogTitle>
            <DialogDescription>Créez un nouveau profil membre. Le membre devra être approuvé avant de pouvoir se connecter.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Nom et Prénom</Label>
              <Input id="new-name" value={newMemberData.name} onChange={(e) => setNewMemberData(prev => ({...prev, name: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">Email</Label>
              <Input id="new-email" type="email" value={newMemberData.email} onChange={(e) => setNewMemberData(prev => ({...prev, email: e.target.value}))} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="new-phone">Numéro de téléphone</Label>
                <Input id="new-phone" type="tel" value={newMemberData.phoneNumber} onChange={(e) => setNewMemberData(prev => ({...prev, phoneNumber: e.target.value}))} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="new-password">Mot de passe temporaire</Label>
                <div className="relative">
                    <Input id="new-password" type={showPassword ? 'text' : 'password'} value={newMemberData.password} onChange={(e) => setNewMemberData(prev => ({...prev, password: e.target.value}))} />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-avatar">Photo de profil</Label>
              <div className="flex items-center gap-4">
                {newMemberData.avatar && <Image src={newMemberData.avatar} alt="Aperçu de l'avatar" width={64} height={64} className="rounded-full w-16 h-16 object-cover" />}
                <Button type="button" variant="outline" asChild>
                   <label htmlFor="avatar-upload-new" className="cursor-pointer flex items-center gap-2">
                     <Upload className="h-4 w-4" />
                     <span>Choisir</span>
                   </label>
                </Button>
                <Input id="avatar-upload-new" type="file" className="hidden" accept="image/*" onChange={handleNewMemberAvatarChange}/>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={handleAddMember}>Ajouter le membre</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
