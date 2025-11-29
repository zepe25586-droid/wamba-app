import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Projet, Member } from '@/lib/types';

interface RecentProjetsProps {
    projets: Projet[];
    members: Member[];
}

export function RecentProjets({ projets, members }: RecentProjetsProps) {
  const getMemberById = (id: string) => members.find((m) => m.id === id);

  return (
    <div className="space-y-4">
      {projets.map((projet) => {
        const member = getMemberById(projet.memberId);
        if (!member) return null;
        return (
          <div key={projet.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src={member.avatarUrl} alt="Avatar" />
              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{member.name}</p>
              <p className="text-sm text-muted-foreground">{member.email}</p>
            </div>
            <div className="ml-auto font-medium">
                {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "XOF",
                }).format(projet.amount)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
