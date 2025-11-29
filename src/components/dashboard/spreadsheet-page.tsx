
'use client';

import { useState, useMemo, useCallback } from 'react';
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
import { PlusCircle, Trash2, Download, Upload, FileText, FileUp } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import type { SpreadsheetData, RowData, CellData } from '@/lib/types';


export default function SpreadsheetPage({
  title,
  description,
  exportFileName,
  storageKey
}: {
  title: string,
  description: string,
  exportFileName: string,
  storageKey: string
}) {
  const [data, setData] = useLocalStorage<SpreadsheetData>(storageKey, { headers: [], data: [] });
  const [newRow, setNewRow] = useState<RowData>({ id: '' });
  const [newHeader, setNewHeader] = useState('');
  const { toast } = useToast();

  const addHeader = () => {
    if (newHeader && !data.headers.includes(newHeader)) {
      setData(prev => ({ ...prev, headers: [...prev.headers, newHeader] }));
      setNewHeader('');
    }
  };

  const deleteHeader = (header: string) => {
    setData(prev => ({
      headers: prev.headers.filter(h => h !== header),
      data: prev.data.map(row => {
        const newRow = { ...row };
        delete newRow[header];
        return newRow;
      })
    }));
  };

  const addRow = () => {
    const rowToAdd = { ...newRow, id: `row-${Date.now()}` };
    setData(prev => ({ ...prev, data: [...prev.data, rowToAdd] }));
    setNewRow({ id: '' }); // Reset for next entry
  };
  
  const deleteRow = (id: string) => {
    setData(prev => ({...prev, data: prev.data.filter(row => row.id !== id)}));
  }

  const handleCellChange = (rowId: string, header: string, value: string) => {
    setData(prev => ({
      ...prev,
      data: prev.data.map(row => {
        if (row.id === rowId) {
          const newRow = {...row};
          const currentCell = newRow[header];
          if (typeof currentCell === 'object' && currentCell !== null && 'value' in currentCell) {
             (newRow[header] as CellData).value = value;
          } else {
             newRow[header] = { value: value, color: 'transparent' };
          }
          return newRow;
        }
        return row;
      })
    }));
  };

  const handleExport = () => {
    const worksheetData = data.data.map(row => {
      const newRow: {[key: string]: string} = {};
      data.headers.forEach(header => {
        const cell = row[header] as CellData;
        newRow[header] = cell ? cell.value : '';
      });
      return newRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Données");
    XLSX.writeFile(workbook, exportFileName);
  };
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const fileData = e.target?.result;
        if (!fileData) {
            toast({ variant: "destructive", title: "Erreur", description: "Impossible de lire le fichier." });
            return;
        }
        const workbook = XLSX.read(fileData, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (json.length > 0) {
          const headers = Object.keys(json[0]);
          const newData = json.map((row, index) => {
            const newRow: RowData = { id: `row-import-${Date.now()}-${index}` };
            headers.forEach(header => {
              newRow[header] = { value: String(row[header] || ''), color: 'transparent' };
            });
            return newRow;
          });
          setData({ headers, data: newData });
          toast({ title: "Importation réussie", description: `${json.length} lignes ont été importées.` });
        } else {
          toast({ variant: "destructive", title: "Fichier vide", description: "Le fichier ne contient aucune donnée." });
        }

      } catch (error) {
         toast({ variant: "destructive", title: "Erreur d'importation", description: "Le format du fichier est invalide." });
      }
    };

    reader.readAsBinaryString(file);

  }, [setData, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
    }
  });


  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
                 <div
                    {...getRootProps()}
                    className={`flex-1 p-6 border-2 border-dashed rounded-md text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-primary bg-primary/10' : 'hover:border-primary/50'
                    }`}
                >
                    <input {...getInputProps()} />
                    <div className='flex items-center justify-center gap-2 text-muted-foreground'>
                        <FileUp className="h-5 w-5"/>
                        {isDragActive ? <p>Déposez le fichier...</p> : <p>Glissez-déposez un fichier ou cliquez pour importer</p>}
                    </div>
                </div>

                <Button onClick={handleExport} variant="outline" className="gap-2">
                   <FileText className="h-5 w-5"/>
                   Exporter en CSV/Excel
                </Button>
            </div>


            <div className="flex items-center gap-2 mb-4">
                <Input
                type="text"
                placeholder="Nom de la nouvelle colonne"
                value={newHeader}
                onChange={(e) => setNewHeader(e.target.value)}
                />
                <Button onClick={addHeader} className="gap-1"><PlusCircle className='h-4 w-4'/>Ajouter une colonne</Button>
            </div>

            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    {data.headers.map(header => (
                        <TableHead key={header} className="min-w-[150px]">
                            <div className='flex items-center gap-2'>
                                {header}
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteHeader(header)}>
                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                </Button>
                            </div>
                        </TableHead>
                    ))}
                    <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.data.map(row => (
                    <TableRow key={row.id}>
                        {data.headers.map(header => (
                        <TableCell key={header}>
                            <Input
                            type="text"
                            value={(row[header] as CellData)?.value || ''}
                            onChange={(e) => handleCellChange(row.id, header, e.target.value)}
                            />
                        </TableCell>
                        ))}
                        <TableCell>
                             <Button variant="ghost" size="icon" onClick={() => deleteRow(row.id)}>
                                <Trash2 className="h-4 w-4 text-destructive"/>
                             </Button>
                        </TableCell>
                    </TableRow>
                    ))}
                    {/* New Row Input */}
                    <TableRow>
                        {data.headers.map(header => (
                        <TableCell key={`new-${header}`}>
                            <Input
                            type="text"
                            placeholder="..."
                            value={(newRow[header] as CellData)?.value || ''}
                            onChange={(e) => setNewRow(prev => ({...prev, [header]: { value: e.target.value, color: 'transparent'}}))}
                            />
                        </TableCell>
                        ))}
                        <TableCell>
                            <Button onClick={addRow} size="sm" className="w-full gap-1"><PlusCircle className="h-4 w-4"/>Ajouter</Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
