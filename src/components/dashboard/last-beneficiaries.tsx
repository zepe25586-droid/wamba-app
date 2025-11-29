
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Beneficiary, Member } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface LastBeneficiariesProps {
    beneficiaries: Beneficiary[];
    members: Member[];
}

export function LastBeneficiaries({ beneficiaries, members }: LastBeneficiariesProps) {
  const getMemberById = (id: string) => members.find((m) => m.id === id);

  if (!beneficiaries || beneficiaries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Aucun bénéficiaire pour le moment.</p>
      </div>
    );
  }

  return (
     <Carousel
      opts={{
        align: "start",
      }}
      className="w-full"
    >
      <CarouselContent>
        {beneficiaries.map((beneficiary, index) => {
          const member = getMemberById(beneficiary.memberId);
          if (!member) return null;
          return (
          <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6 gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 border-2 border-primary">
                        <AvatarImage src={member.avatarUrl} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <p className="text-lg font-semibold">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{new Date(beneficiary.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}</p>
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-green-600">
                    {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'XOF',
                    }).format(beneficiary.amount)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        )})}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex" />
      <CarouselNext className="hidden sm:flex" />
    </Carousel>
  );
}

    
