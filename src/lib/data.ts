
import type { Member, Projet, Beneficiary, Pret, Archive } from './types';

// This data is now only used for initial seeding if needed,
// or for local development with the local Firestore adapter.
// The primary source of truth is the local storage adapter (localFirestore).
export const members: Member[] = [
  {
    id: '2',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phoneNumber: '123456789',
    joinDate: '2023-02-20',
    avatarUrl: 'https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxwZXJzb24lMjBhdmF0YXJ8ZW58MHx8fHwxNzYyODQ2MTgwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    badges: [{name: 'Trésorier', color: 'silver'}],
    status: 'approved',
  },
  {
    id: '3',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phoneNumber: '123456789',
    joinDate: '2023-03-10',
    avatarUrl: 'https://images.unsplash.com/photo-1630910561339-4e22c7150093?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxwZXJzb24lMjBhdmF0YXJ8ZW58MHx8fHwxNzYyODQ2MTgwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'approved',
  },
  {
    id: '4',
    name: 'Emily White',
    email: 'emily.white@example.com',
    phoneNumber: '123456789',
    joinDate: '2023-04-05',
    avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxwZXJzb24lMjBhdmF0YXJ8ZW58MHx8fHwxNzYyODQ2MTgwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    badges: [],
    status: 'approved',
  },
  {
    id: '5',
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    phoneNumber: '123456789',
    joinDate: '2023-05-12',
    avatarUrl: 'https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxwZXJzb24lMjBhdmF0YXJ8ZW58MHx8fHwxNzYyODQ2MTgwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'pending',
  },
];

export const projets: Projet[] = [
  { id: 'p1', memberId: '1', amount: 100, date: '2024-05-01', status: 'Payé' },
  { id: 'p2', memberId: '2', amount: 100, date: '2024-05-01', status: 'Payé' },
  { id: 'p3', memberId: '3', amount: 100, date: '2024-05-01', status: 'Payé' },
  { id: 'p4', memberId: '4', amount: 100, date: '2024-05-01', status: 'En attente' },
  { id: 'p5', memberId: '5', amount: 100, date: '2024-05-01', status: 'Payé' },
  { id: 'p6', memberId: '1', amount: 100, date: '2024-06-01', status: 'Payé' },
  { id: 'p7', memberId: '2', amount: 100, date: '2024-06-01', status: 'Payé' },
  { id: 'p8', memberId: '3', amount: 100, date: '2024-06-01', status: 'En attente' },
  { id: 'p9', memberId: '4', amount: 100, date: '2024-06-01', status: 'Payé' },
  { id: 'p10', memberId: '5', amount: 100, date: '2024-06-01', status: 'Payé' },
  { id: 'p11', memberId: '1', amount: 100, date: '2024-07-01', status: 'En attente' },
  { id: 'p12', memberId: '2', amount: 100, date: '2024-07-01', status: 'Payé' },
  { id: 'p13', memberId: '3', amount: 100, date: '2024-07-01', status: 'Payé' },
  { id: 'p14', memberId: '4', amount: 100, date: '2024-07-01', status: 'Payé' },
  { id: 'p15', memberId: '5', amount: 100, date: '2024-07-01', status: 'En attente' },
];

export const prets: Pret[] = [
  { id: 'l1', memberId: '2', amount: 1000, date: '2024-04-10', status: 'En cours' },
  { id: 'l2', memberId: '4', amount: 500, date: '2024-05-22', status: 'Remboursé' },
  { id: 'l3', memberId: '1', amount: 2000, date: '2024-07-05', status: 'En cours' },
];

export const beneficiaries: Beneficiary[] = [
  { id: 'b1', memberId: '3', date: '2024-07-15', amount: 500 },
  { id: 'b2', memberId: '5', date: '2024-06-15', amount: 500 },
  { id: 'b3', memberId: '1', date: '2024-05-15', amount: 500 },
];

export const initialArchives: Archive[] = [];
