

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  Wallet,
  FileSpreadsheet,
  PiggyBank,
  Briefcase,
  Shield,
  MessageSquare,
  ClipboardList,
  FolderKanban,
  Trophy,
  Archive,
  User as UserIcon,
  HandCoins,
  Box,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

export function SidebarNavLinks() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  
  const links = [
    {
      href: '/dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      adminOnly: false,
    },
     {
      href: '/dashboard/profile',
      label: 'Mon Profil',
      icon: UserIcon,
      adminOnly: false,
    },
    {
      href: '/dashboard/members',
      label: 'Membres',
      icon: Users,
      adminOnly: false,
    },
    {
      href: '/dashboard/projets',
      label: 'Projets',
      icon: Wallet,
      adminOnly: false,
    },
    {
      href: '/dashboard/beneficiaries',
      label: 'Bénéficiaires',
      icon: Trophy,
      adminOnly: true,
    },
    {
      href: '/dashboard/archives',
      label: 'Archives',
      icon: Archive,
      adminOnly: true,
    },
    {
      href: '/dashboard/tchat',
      label: 'Tchat',
      icon: MessageSquare,
      adminOnly: false,
    },
     {
        href: '/dashboard/stockage',
        label: 'Stockage',
        icon: Box,
        adminOnly: false,
    },
    {
      href: '/dashboard/tontine',
      label: 'Tontine',
      icon: FileSpreadsheet,
      adminOnly: true,
    },
    {
      href: '/dashboard/raport-tontine',
      label: 'Raport Tontine',
      icon: ClipboardList,
      adminOnly: true,
    },
    {
      href: '/dashboard/banque',
      label: 'Banque',
      icon: PiggyBank,
      adminOnly: true,
    },
     {
      href: '/dashboard/prets',
      label: 'Prêts',
      icon: HandCoins,
      adminOnly: true,
    },
    {
      href: '/dashboard/assurance',
      label: 'Assurance',
      icon: Shield,
      adminOnly: true,
    },
    {
      href: '/dashboard/rapports-seances',
      label: 'Rapports Séances',
      icon: FolderKanban,
      adminOnly: true,
    },
  ];

  const visibleLinks = links.filter(link => !link.adminOnly || isAdmin);

  return (
    <SidebarMenu>
      {visibleLinks.map((link) => (
        <SidebarMenuItem key={link.href}>
          <Link href={link.href} passHref>
            <SidebarMenuButton
              as="a"
              isActive={pathname === link.href}
              className={cn(
                'justify-start',
                pathname === link.href ? 'bg-primary/10 text-primary' : ''
              )}
            >
                <link.icon className="h-5 w-5 mr-2" />
                <span>{link.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

    

    
