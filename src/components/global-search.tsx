
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  File as FileIcon,
  Search,
  User,
  Wallet,
} from 'lucide-react';
import type { Report } from '@/lib/types';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  DialogTitle,
} from '@/components/ui/command';
import { useAuth } from '@/context/auth-context';


export function GlobalSearch() {
  const router = useRouter();
  const { members, projets, reports } = useAuth();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', down);
      return () => document.removeEventListener('keydown', down);
    }
    return;
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          'relative h-8 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64'
        )}
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 mr-2" />
        <span className="hidden lg:inline-flex">Rechercher...</span>
        <span className="inline-flex lg:hidden">Recherche...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Tapez une commande ou une recherche..." />
        <CommandList>
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
          <CommandGroup heading="Membres">
            {members?.map((member) => (
              <CommandItem
                key={`member-${member.id}`}
                value={`membre ${member.name} ${member.email}`}
                onSelect={() => {
                  runCommand(() => router.push('/dashboard/members'));
                }}
              >
                <User className="mr-2 h-4 w-4" />
                <span>{member.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Projets">
            {projets?.map((projet) => {
                const member = members?.find(m => m.id === projet.memberId);
                const value = `projet ${member?.name || ''} ${projet.amount} XOF ${projet.date}`;
                return (
                    <CommandItem
                        key={`projet-${projet.id}`}
                        value={value}
                        onSelect={() => {
                        runCommand(() => router.push('/dashboard/projets'));
                        }}
                    >
                        <Wallet className="mr-2 h-4 w-4" />
                        <span>{`Projet de ${member?.name || 'Inconnu'}`}</span>
                        <span className='ml-auto text-xs text-muted-foreground'>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF'}).format(projet.amount)}</span>
                    </CommandItem>
                )
            })}
          </CommandGroup>
          <CommandGroup heading="Rapports">
            {reports?.map((report) => (
              <CommandItem
                key={`report-${report.id}`}
                value={`rapport ${report.name} ${report.category} ${report.date}`}
                onSelect={() => {
                  runCommand(() => router.push('/dashboard/rapports-seances'));
                }}
              >
                <FileIcon className="mr-2 h-4 w-4" />
                <span>{report.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
