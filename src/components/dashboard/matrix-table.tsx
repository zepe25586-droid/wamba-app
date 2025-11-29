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
import { PlusCircle, Trash2, Download } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as XLSX from 'xlsx';

type MatrixData = {
  dates: string[]; // ISO date strings
  values: {
    [memberId: string]: {
      [date: string]: string;
    };
  };
};

type MatrixTableProps = {
  title: string;
  description: string;
  storageKey: string;
  dataType: 'currency' | 'text';
};

export default function MatrixTable({
  title,
  description,
  storageKey,
  dataType,
}: MatrixTableProps) {
  const { members } = useAuth();
  const [data, setData] = useLocalStorage<MatrixData>(storageKey, {
    dates: [],
    values: {},
  });
  const [newDate, setNewDate] = useState<string>('');

  const sortedMembers = useMemo(() => {
    if (!members) return [];
    return [...members].sort((a, b) => a.name.localeCompare(b.name));
  }, [members]);

  const sortedDates = useMemo(() => {
    return [...data.dates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }, [data.dates]);

  const handleAddDate = () => {
    if (newDate && !data.dates.includes(newDate)) {
      const updatedDates = [...data.dates, newDate];
      setData((prev) => ({ ...prev, dates: updatedDates }));
      setNewDate('');
    }
  };

  const handleDeleteDate = (dateToDelete: string) => {
    const updatedDates = data.dates.filter(d => d !== dateToDelete);
    const updatedValues = { ...data.values };
    // Also remove values associated with that date
    Object.keys(updatedValues).forEach(memberId => {
      delete updatedValues[memberId][dateToDelete];
    });
    setData({ dates: updatedDates, values: updatedValues });
  };

  const handleValueChange = (
    memberId: string,
    date: string,
    value: string
  ) => {
    setData((prev) => {
      const newValues = { ...prev.values };
      if (!newValues[memberId]) {
        newValues[memberId] = {};
      }
      newValues[memberId][date] = value;
      return { ...prev, values: newValues };
    });
  };

  const handleExport = () => {
    const dataToExport = sortedMembers.map(member => {
      const row: {[key: string]: string | number} = { 'Membre': member.name };
      sortedDates.forEach(date => {
        const formattedDate = isValid(parseISO(date)) ? format(parseISO(date), 'dd/MM/yyyy', { locale: fr }) : date;
        const rawValue = data.values[member.id]?.[date] || '';
        if (dataType === 'currency') {
          row[formattedDate] = parseFloat(rawValue) || 0;
        } else {
          row[formattedDate] = rawValue;
        }
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, title);
    XLSX.writeFile(workbook, `${title}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex items-center gap-2">
                <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-auto"
                />
                <Button onClick={handleAddDate} size="sm" className="gap-1">
                <PlusCircle />
                Ajouter une date
                </Button>
            </div>
            <Button onClick={handleExport} variant="outline" className="gap-2 sm:ml-auto">
                <Download className="h-4 w-4" />
                Exporter
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table className="border">
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 z-10 bg-card border-r min-w-[250px]">
                    Membre
                  </TableHead>
                  {sortedDates.map((date) => {
                    const d = parseISO(date);
                    return (
                        <TableHead key={date} className="text-center min-w-[150px]">
                            <div className='flex items-center justify-center gap-2'>
                                <span>{isValid(d) ? format(d, 'dd/MM/yyyy', { locale: fr }) : 'Date invalide'}</span>
                                <Button variant="ghost" size="icon" className='h-6 w-6' onClick={() => handleDeleteDate(date)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </TableHead>
                    );
                   })}
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
                    {sortedDates.map((date) => (
                      <TableCell key={date}>
                        <Input
                          type={dataType === 'currency' ? 'number' : 'text'}
                          placeholder="0.00"
                          value={data.values[member.id]?.[date] || ''}
                          onChange={(e) =>
                            handleValueChange(member.id, date, e.target.value)
                          }
                          className="text-right"
                        />
                      </TableCell>
                    ))}
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
