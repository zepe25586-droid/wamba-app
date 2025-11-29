
'use client';

import { useState, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useAuth } from '@/context/auth-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  UploadCloud,
  File as FileIcon,
  Trash2,
  Download,
  HardDrive,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

type StoredFile = {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  dateAdded: string;
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function StockagePage() {
  const { isAdmin } = useAuth();
  const [files, setFiles] = useLocalStorage<StoredFile[]>('stockage_files', []);
  const { toast } = useToast();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!isAdmin) return;
      acceptedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onabort = () => console.log('file reading was aborted');
        reader.onerror = () => console.log('file reading has failed');
        reader.onload = () => {
          const dataUrl = reader.result as string;
          const newFile: StoredFile = {
            name: file.name,
            type: file.type,
            size: file.size,
            dataUrl,
            dateAdded: new Date().toISOString(),
          };
          setFiles((prevFiles) => [...prevFiles, newFile]);
        };
        reader.readAsDataURL(file);
      });
      toast({
        title: 'Fichier(s) téléversé(s)',
        description: `${acceptedFiles.length} fichier(s) ont été ajoutés au stockage.`,
      });
    },
    [setFiles, toast, isAdmin]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: !isAdmin
  });

  const handleDelete = (fileName: string) => {
    if (!isAdmin) return;
    setFiles((prevFiles) => prevFiles.filter((f) => f.name !== fileName));
    toast({
      variant: 'destructive',
      title: 'Fichier supprimé',
      description: `Le fichier "${fileName}" a été supprimé.`,
    });
  };
  
  const handleDownload = (file: StoredFile) => {
    if (typeof document === 'undefined') return;
    const link = document.createElement("a");
    link.href = file.dataUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);


  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stockage de Fichiers</h1>
          <p className="text-muted-foreground">
            Consultez les fichiers partagés de la tontine.
          </p>
        </div>
      </div>
      
      {isAdmin && (
        <Card>
            <CardHeader>
            <CardTitle>Téléverser des fichiers</CardTitle>
            </CardHeader>
            <CardContent>
            <div
                {...getRootProps()}
                className={cn(
                'border-2 border-dashed border-muted-foreground/50 rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors',
                isDragActive && 'border-primary bg-primary/10',
                !isAdmin && 'cursor-not-allowed opacity-50'
                )}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <UploadCloud className="h-10 w-10" />
                {isDragActive ? (
                    <p>Déposez les fichiers ici ...</p>
                ) : (
                    <p>Glissez-déposez des fichiers ici, ou cliquez pour les sélectionner</p>
                )}
                </div>
            </div>
            </CardContent>
        </Card>
      )}


      <Card>
        <CardHeader>
          <CardTitle>Fichiers stockés</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <HardDrive className="h-4 w-4"/>
            <span>Total: {files.length} fichier(s) - {formatFileSize(totalSize)}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {files.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Type</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Taille</TableHead>
                  <TableHead>Date d'ajout</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.sort((a,b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()).map((file) => (
                  <TableRow key={file.name}>
                    <TableCell>
                      <FileIcon className="h-6 w-6 text-muted-foreground" />
                    </TableCell>
                    <TableCell className="font-medium">{file.name}</TableCell>
                    <TableCell>{formatFileSize(file.size)}</TableCell>
                    <TableCell>
                      {new Date(file.dateAdded).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => handleDownload(file)}>
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Télécharger</span>
                      </Button>
                      {isAdmin && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(file.name)}
                        >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Supprimer</span>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <p>Aucun fichier stocké pour le moment.</p>
              {isAdmin && <p className="text-sm">Utilisez la zone de téléversement ci-dessus pour ajouter des fichiers.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
