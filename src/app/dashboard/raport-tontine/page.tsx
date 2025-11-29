'use client';

import SpreadsheetPage from '@/components/dashboard/spreadsheet-page';

export default function RaportTontinePage() {
    return (
        <SpreadsheetPage
            title="Gérer le Rapport Tontine"
            description="Importez, exportez et modifiez les données du rapport tontine."
            exportFileName="raport-tontine.csv"
            storageKey="raport_tontine_data"
        />
    );
}
