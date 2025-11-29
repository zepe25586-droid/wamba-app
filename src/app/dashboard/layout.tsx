
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import { SidebarNav } from '@/components/layout/sidebar';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
       <div className="flex min-h-screen w-full bg-background">
        <div className="hidden md:block border-r p-2 w-[16rem]">
            <div className="flex flex-col gap-2 p-2">
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex flex-col gap-1 p-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
        </div>
        <div className="flex-1 p-4 md:p-6 lg:p-8">
            <Skeleton className="h-14 ml-auto w-48 mb-6" />
            <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null; // ou un autre écran de chargement, pour éviter un flash de contenu
  }


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav />
      </Sidebar>
      <div className="flex flex-col flex-1 min-h-screen">
        <Header />
        <SidebarInset>
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
