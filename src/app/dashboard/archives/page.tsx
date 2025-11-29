
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Archive, PlusCircle, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import type { Archive as ArchiveType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function ArchivesPage() {
  const { isAdmin, members, projets, archives, setArchives } = useAuth();
  const { toast } = useToast();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newArchiveName, setNewArchiveName] = useState('');
  const [selectedProjetIds, setSelectedProjetIds] = useState<string[]>([]);
  
  const getMemberInfo = (memberId: string) => members?.find((m) => m.id === memberId);

  const archivedProjetIds = useMemo(() => {
    return new Set(archives?.flatMap(a => a.projetIds || []) || []);
  }, [archives]);
  
  const unarchivedProjets = useMemo(() => {
    if (!projets) return [];
    return projets.filter(c => !archivedProjetIds.has(c.id));
  }, [projets, archivedProjetIds]);

  const handleCreateArchive = () => {
    if (!newArchiveName.trim() || selectedProjetIds.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Veuillez donner un nom à l\'archive et sélectionner au moins un projet.',
      });
      return;
    }

    const newArchive: ArchiveType = {
        id: `archive-${Date.now()}`,
        name: newArchiveName,
        description: `Archive contenant ${selectedProjetIds.length} projet(s).`,
        dateCreated: new Date().toISOString(),
        projetIds: selectedProjetIds,
    };
    
    setArchives(prev => [...prev, newArchive]);

    toast({
      title: 'Archive créée',
      description: `L'archive "${newArchiveName}" a été créée avec succès.`,
    });

    setIsCreateModalOpen(false);
    setNewArchiveName('');
    setSelectedProjetIds([]);
  };

  const handleDeleteArchive = (archiveId: string) => {
    setArchives(prev => prev.filter(a => a.id !== archiveId));
    toast({
      title: 'Archive supprimée',
      variant: 'destructive',
    });
  };
  
  const getProjetsForArchive = (projetIds: string[]) => {
    if (!projets) return [];
    return projets.filter(c => projetIds.includes(c.id));
  };
  
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
          <h1 className="text-2xl font-bold tracking-tight">Archives des projets</h1>
          <p className="text-muted-foreground">
            Consultez et gérez les archives des projets passés.
          </p>
        </div>
        <Button size="sm" className="gap-1" onClick={() => setIsCreateModalOpen(true)}>
            <PlusCircle className="h-4 w-4" />
            Créer une archive
        </Button>
      </div>

      {archives && archives.length > 0 ? (
        <Accordion type="multiple" className="w-full space-y-2">
          {archives.sort((a,b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()).map((archive) => (
            <AccordionItem value={archive.id} key={archive.id} className="border rounded-lg bg-card">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center justify-between w-full">
                    <div className='flex items-center gap-4'>
                        <Archive className="h-6 w-6 text-primary" />
                        <div>
                            <h3 className="font-semibold text-lg">{archive.name}</h3>
                            <p className="text-sm text-muted-foreground">
                                Créée le {new Date(archive.dateCreated).toLocaleDateString('fr-FR')} - {archive.projetIds?.length || 0} projet(s)
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="mr-4" onClick={(e) => { e.stopPropagation(); handleDeleteArchive(archive.id); }}>
                        <Trash2 className="h-4 w-4 text-destructive"/>
                    </Button>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Membre</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Date</TableHead>
                      
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getProjetsForArchive(archive.projetIds || []).map(c => {
                      const member = getMemberInfo(c.memberId);
                      return (
                        <TableRow key={c.id}>
                          <TableCell>{member?.name || 'Inconnu'}</TableCell>
                          <TableCell>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(c.amount)}</TableCell>
                          <TableCell>{new Date(c.date).toLocaleDateString('fr-FR')}</TableCell>
                          
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-muted-foreground">
                <p>Aucune archive pour le moment.</p>
                <p className="text-sm">Cliquez sur "Créer une archive" pour commencer.</p>
              </div>
            </CardContent>
          </Card>
      )}

      {/* Create Archive Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Créer une nouvelle archive</DialogTitle>
            <DialogDescription>
              Donnez un nom à votre archive et sélectionnez les projets à y inclure.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
                <label>Nom de l'archive</label>
                <Input 
                    placeholder="ex: Projets Janvier 2024"
                    value={newArchiveName}
                    onChange={(e) => setNewArchiveName(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <label>Projets à archiver</label>
                <Card>
                    <CardContent className="p-0">
                    <ScrollArea className="h-64">
                    <Table>
                        <TableHeader className='sticky top-0 bg-secondary'>
                            <TableRow>
                                <TableHead className="w-10"></TableHead>
                                <TableHead>Membre</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Montant</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {unarchivedProjets.map(c => {
                                const member = getMemberInfo(c.memberId);
                                return (
                                <TableRow key={c.id}>
                                    <TableCell>
                                        <Checkbox 
                                            checked={selectedProjetIds.includes(c.id)}
                                            onCheckedChange={(checked) => {
                                                setSelectedProjetIds(prev => 
                                                    checked ? [...prev, c.id] : prev.filter(id => id !== c.id)
                                                )
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={member?.avatarUrl} />
                                                <AvatarFallback>{member?.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span>{member?.name || 'Inconnu'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{new Date(c.date).toLocaleDateString('fr-FR')}</TableCell>
                                    <TableCell>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(c.amount)}</TableCell>
                                </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                    </ScrollArea>
                    </CardContent>
                </Card>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={handleCreateArchive}>Créer l'archive ({selectedProjetIds.length})</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
