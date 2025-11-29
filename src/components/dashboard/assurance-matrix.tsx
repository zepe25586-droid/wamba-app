'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useLocalStorage } from '@/hooks/use-local-storage';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, Archive, ArchiveRestore, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import * as XLSX from 'xlsx';

type Objectif = {
  name: string;
  isArchived: boolean;
};

type AssuranceData = {
  objectifs: Objectif[];
  values: {
    [memberId: string]: {
      [objectifName: string]: string;
    };
  };
};

const TARGET_AMOUNT = 10000;

export default function AssuranceMatrix() {
  const { members } = useAuth();
  const [data, setData] = useLocalStorage<AssuranceData>('assurance_matrix_data', {
    objectifs: [],
    values: {},
  });
  const [newObjectif, setNewObjectif] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const sortedMembers = useMemo(() => {
    if (!members) return [];
    return [...members].sort((a, b) => a.name.localeCompare(b.name));
  }, [members]);
  
  const visibleObjectifs = useMemo(() => {
    return data.objectifs.filter(o => !o.isArchived || showArchived);
  }, [data.objectifs, showArchived]);

  const handleAddObjectif = () => {
    if (newObjectif && !data.objectifs.find(o => o.name === newObjectif)) {
      const updatedObjectifs = [...data.objectifs, { name: newObjectif, isArchived: false }];
      setData((prev) => ({ ...prev, objectifs: updatedObjectifs }));
      setNewObjectif('');
    }
  };

  const toggleArchiveObjectif = (objectifName: string) => {
    const updatedObjectifs = data.objectifs.map(o => 
      o.name === objectifName ? { ...o, isArchived: !o.isArchived } : o
    );
    setData(prev => ({ ...prev, objectifs: updatedObjectifs }));
  };
  
  const handleValueChange = (
    memberId: string,
    objectifName: string,
    value: string
  ) => {
    setData((prev) => {
      const newValues = { ...prev.values };
      if (!newValues[memberId]) {
        newValues[memberId] = {};
      }
      newValues[memberId][objectifName] = value;
      return { ...prev, values: newValues };
    });
  };
  
  const getStatusInfo = (value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return { status: 'N/A', color: 'bg-muted', textColor: 'text-muted-foreground' };
    if (numValue >= TARGET_AMOUNT) return { status: 'Assuré', color: 'bg-green-100 dark:bg-green-900/50', textColor: 'text-green-700 dark:text-green-300' };
    return { status: 'Non Assuré', color: 'bg-red-100 dark:bg-red-900/50', textColor: 'text-red-700 dark:text-red-300' };
  };

  const handleExport = () => {
    const dataToExport = sortedMembers.map(member => {
      const row: {[key: string]: any} = { 'Membre': member.name };
      visibleObjectifs.forEach(objectif => {
        const rawValue = data.values[member.id]?.[objectif.name] || '';
        const numValue = parseFloat(rawValue);
        const { status } = getStatusInfo(rawValue);
        row[`${objectif.name} (Montant)`] = isNaN(numValue) ? '' : numValue;
        row[`${objectif.name} (Statut)`] = status;
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Assurance");
    XLSX.writeFile(workbook, `Assurance_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Matrice d'Assurance</CardTitle>
          <CardDescription>Gérez les objectifs d'assurance pour chaque membre.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex items-center gap-2 flex-grow">
                <Input
                type="text"
                placeholder="Nom du nouvel objectif"
                value={newObjectif}
                onChange={(e) => setNewObjectif(e.target.value)}
                />
                <Button onClick={handleAddObjectif} size="sm" className="gap-1">
                    <PlusCircle className="h-4 w-4" />
                    Ajouter
                </Button>
            </div>
            <div className="flex items-center gap-4">
                 <div className="flex items-center space-x-2">
                    <Switch id="show-archived" checked={showArchived} onCheckedChange={setShowArchived} />
                    <Label htmlFor="show-archived">Afficher les archives</Label>
                </div>
                <Button onClick={handleExport} variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Exporter
                </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table className="border">
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 z-10 bg-card border-r min-w-[250px]">
                    Membre
                  </TableHead>
                  {visibleObjectifs.map((objectif) => (
                    <TableHead key={objectif.name} className="text-center min-w-[200px]">
                      <div className='flex items-center justify-center gap-2'>
                        <span className={cn(objectif.isArchived && 'line-through text-muted-foreground')}>{objectif.name}</span>
                        <Button variant="ghost" size="icon" className='h-6 w-6' onClick={() => toggleArchiveObjectif(objectif.name)}>
                          {objectif.isArchived ? <ArchiveRestore className="h-4 w-4 text-gray-500" /> : <Archive className="h-4 w-4 text-yellow-600" />}
                        </Button>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="sticky left-0 z-10 bg-card border-r font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={member.avatarUrl} alt={member.name} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{member.name}</span>
                      </div>
                    </TableCell>
                    {visibleObjectifs.map((objectif) => {
                      const value = data.values[member.id]?.[objectif.name] || '';
                      const { status, color, textColor } = getStatusInfo(value);
                      return (
                        <TableCell key={objectif.name} className={cn('p-2', color)}>
                          <div className="flex flex-col gap-1">
                            <Input
                              type="number"
                              placeholder="0"
                              value={value}
                              onChange={(e) =>
                                handleValueChange(member.id, objectif.name, e.target.value)
                              }
                              className={cn("text-right bg-transparent border-0 focus-visible:ring-1 focus-visible:ring-ring", textColor)}
                            />
                             <Badge variant="outline" className={cn("border-0 justify-center", textColor)}>{status}</Badge>
                          </div>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {sortedMembers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Aucun membre trouvé.</p>
              <p className="text-sm">Veuillez d'abord ajouter des membres à la tontine.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
