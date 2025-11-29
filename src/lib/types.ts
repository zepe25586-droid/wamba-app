

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  avatar: string;
  password?: string; // Should be handled securely on a real backend
}

export type BadgeColor = 'gold' | 'silver' | 'bronze' | 'default';

export interface Badge {
  name: string;
  color: BadgeColor;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  joinDate: string;
  avatarUrl: string;
  badges?: Badge[];
  status: 'approved' | 'pending' | 'rejected';
}

export interface Projet {
  id: string;
  memberId: string;
  amount: number;
  date: string;
  status: 'Payé' | 'En attente';
}

export interface Pret {
  id: string;
  memberId: string;
  amount: number;
  date: string;
  status: 'En cours' | 'Remboursé';
}

export interface Beneficiary {
  id: string;
  memberId: string;
  date: string;
  amount: number;
}

export type CellData = {
  value: string;
  color: string;
};

export type RowData = {
  id: string;
  [key: string]: CellData | string;
};

export interface SpreadsheetData {
  id?: string;
  headers: string[];
  data: RowData[];
}

export type Report = {
  id: string;
  name: string;
  category: string;
  date: string;
  content?: string;
};

export type Message = {
  id: string;
  text?: string;
  file?: {
    name: string;
    url: string; // This will be a Base64 Data URI
    type: string;
  };
  senderId: string;
  timestamp: string; // ISO 8601 format
};

export type Archive = {
    id: string;
    name: string;
    description: string;
    dateCreated: string;
    projetIds: string[];
}
