
'use client';

import { useState, useMemo, useRef } from 'react';
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
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2, Eye, Download } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Report } from '@/lib/types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function RapportsSeancesPage() {
  const { isAdmin, reports, setReports } = useAuth();
  
  const [newReport, setNewReport] = useState({ name: '', category: '', date: '', content: '' });
  const [viewedReport, setViewedReport] = useState<Report | null>(null);
  const { toast } = useToast();
  const reportContentRef = useRef<HTMLDivElement>(null);

  const handleAddReport = () => {
    if (!newReport.name || !newReport.category || !newReport.date) return;
    
    const newRep: Report = {
      id: `report-${Date.now()}`,
      ...newReport
    };
    setReports(prev => [...prev, newRep]);
    setNewReport({ name: '', category: '', date: '', content: '' });
     toast({
        title: "Rapport ajouté",
        description: "Le nouveau rapport a bien été enregistré.",
    });
  };
  
  const handleInputChange = (field: keyof typeof newReport, value: string) => {
    setNewReport(prev => ({ ...prev, [field]: value }));
  };

  const handleDeleteReport = (reportId: string) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
    toast({
        title: "Rapport supprimé",
        variant: "destructive",
    });
  };

  const handleExportReportToPdf = () => {
    if (!viewedReport || !reportContentRef.current) return;
  
    const content = reportContentRef.current;
    const reportTitle = viewedReport.name;
    const reportDate = new Date(viewedReport.date).toLocaleDateString('fr-FR');
  
    html2canvas(content, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgWidth / imgHeight;
      const margin = 15;
  
      const contentWidth = pdfWidth - margin * 2;
      
      pdf.setFontSize(22);
      pdf.text(reportTitle, pdfWidth / 2, margin, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text(`Date: ${reportDate}`, pdfWidth / 2, margin + 10, { align: 'center' });

      let position = margin + 20;
      pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentWidth / ratio);
      
      pdf.save(`${viewedReport.name}.pdf`);
    });
  };
  
  const groupedReports = useMemo(() => {
    if (!reports) return {};
    return reports.reduce((acc, report) => {
      const category = report.category || 'Non classé';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(report);
      return acc;
    }, {} as Record<string, Report[]>);
  }, [reports]);

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
          <h1 className="text-2xl font-bold tracking-tight">Gérer les Rapports de Séances</h1>
          <p className="text-muted-foreground">
            Organisez et consultez vos rapports de séances.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Ajouter un nouveau rapport</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] gap-4 mb-4">
                <Input 
                    placeholder="Nom du rapport"
                    value={newReport.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                />
                <Input 
                    placeholder="Catégorie (dossier)"
                    value={newReport.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                />
                <Input 
                    type="date"
                    value={newReport.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                />
            </div>
            <Textarea
                placeholder="Contenu du rapport..."
                value={newReport.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                className="mb-4 min-h-[100px]"
            />
            <Button onClick={handleAddReport} className="gap-1 w-full sm:w-auto">
                <PlusCircle className="h-4 w-4" />
                Ajouter
            </Button>
        </CardContent>
      </Card>
      
      
      {Object.keys(groupedReports).length > 0 ? (
        <Accordion type="multiple" className="w-full space-y-2">
            {Object.entries(groupedReports).sort(([a], [b]) => a.localeCompare(b)).map(([category, reportsInCategory]) => (
                <AccordionItem value={category} key={category} className="border rounded-lg bg-card">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                        <div className="flex items-center gap-2">
                           <h3 className="font-semibold text-lg">{category}</h3>
                           <span className="text-sm text-muted-foreground">({reportsInCategory.length} rapport{reportsInCategory.length > 1 ? 's' : ''})</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Nom du rapport</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reportsInCategory.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((report) => (
                                <TableRow key={report.id}>
                                    <TableCell className="font-medium">{report.name}</TableCell>
                                    <TableCell>{new Date(report.date).toLocaleDateString('fr-FR')}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => setViewedReport(report)}>
                                            <Eye className="h-4 w-4"/>
                                            <span className="sr-only">Consulter</span>
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteReport(report.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive"/>
                                            <span className="sr-only">Supprimer</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
        ) : (
        <Card>
            <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                    <p>Aucun rapport pour le moment.</p>
                    <p className="text-sm">Utilisez le formulaire ci-dessus pour ajouter un rapport.</p>
                </div>
            </CardContent>
        </Card>
        )}

      {/* View Report Modal */}
      <Dialog open={!!viewedReport} onOpenChange={(open) => !open && setViewedReport(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewedReport?.name}</DialogTitle>
            <DialogDescription>
                Rapport du {viewedReport ? new Date(viewedReport.date).toLocaleDateString('fr-FR') : ''}
            </DialogDescription>
          </DialogHeader>
          <div ref={reportContentRef} className="prose prose-sm dark:prose-invert max-w-none max-h-[60vh] overflow-y-auto py-4 px-6 bg-muted/50 rounded-md">
             <p className="whitespace-pre-wrap">{viewedReport?.content || "Ce rapport n'a pas de contenu."}</p>
          </div>
          <DialogFooter className='sm:justify-between'>
             <Button onClick={handleExportReportToPdf} variant="secondary" className="gap-2">
                <Download className="h-4 w-4"/>
                Exporter en PDF
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Fermer</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
