

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Landmark, Upload, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState<string>('');
    const [showPassword, setShowPassword] = useState(false);
    const { createMemberByAdmin } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            setAvatar(loadEvent.target?.result as string);
        };
        reader.readAsDataURL(file);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password || !avatar || !phoneNumber) {
            toast({
                variant: "destructive",
                title: "Champs requis",
                description: "Veuillez remplir tous les champs, y compris l'avatar et le numéro de téléphone."
            });
            return;
        }
        setIsLoading(true);
        
        try {
            await createMemberByAdmin({ name, email, password, phoneNumber, avatar });
            toast({
                title: "Inscription réussie !",
                description: "Votre compte est en attente d'approbation par un administrateur.",
            });
            router.push('/login');
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: "Erreur d'inscription",
                description: error.message || "Une erreur inattendue est survenue.",
            });
        } finally {
            setIsLoading(false);
        }
    };


  return (
     <div className="flex items-center justify-center min-h-screen bg-background p-4">
       <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
             <div className="flex justify-center items-center gap-2 mb-4">
                <Landmark className="w-8 h-8 text-primary" />
                <h1 className="text-2xl font-semibold font-headline text-primary">WAMBA</h1>
            </div>
          <CardTitle className="text-2xl">Inscription</CardTitle>
          <CardDescription>
            Créez votre compte pour rejoindre la tontine.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="full-name">Nom et Prénom</Label>
                <Input id="full-name" placeholder="John Doe" required value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <Input id="phone" type="tel" placeholder="+123456789" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} disabled={isLoading} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading}/>
                 <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? 'Masquer' : 'Afficher'} le mot de passe
                    </span>
                  </Button>
                </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="new-avatar">Photo de profil</Label>
                <div className="flex items-center gap-4">
                    {avatar && <Image src={avatar} alt="Aperçu de l'avatar" width={64} height={64} className="rounded-full w-16 h-16 object-cover" />}
                    <Button type="button" variant="outline" asChild>
                    <label htmlFor="avatar-upload-new" className="cursor-pointer flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        <span>Choisir</span>
                    </label>
                    </Button>
                    <Input id="avatar-upload-new" type="file" className="hidden" accept="image/*" onChange={handleAvatarChange}/>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Création du compte..." : "Créer un compte"}
              </Button>
              <div className="mt-4 text-center text-sm">
                Vous avez déjà un compte?{' '}
                <Link href="/login" className="underline">
                  Se connecter
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
