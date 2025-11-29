'use client';

import Link from 'next/link';
import {
  SidebarContent,
  SidebarHeader,
} from '@/components/ui/sidebar';
import {
  Landmark,
} from 'lucide-react';
import { SidebarNavLinks } from '@/components/layout/sidebar-nav';


export function SidebarNav() {
  return (
    <>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 p-2">
          <Landmark className="w-6 h-6 text-primary" />
          <h1 className="text-lg font-semibold font-headline text-primary">WAMBA</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarNavLinks />
      </SidebarContent>
    </>
  );
}
