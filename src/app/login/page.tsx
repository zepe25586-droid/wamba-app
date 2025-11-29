

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-context';
import { Landmark, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, resetPassword } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast({
        title: "Connexion réussie",
        description: "Redirection vers le tableau de bord...",
      });
      // Use Next.js router for client-side navigation without a full page reload.
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur de connexion',
        description: error.message || 'Une erreur inattendue est survenue.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast({
        variant: 'destructive',
        title: 'Adresse e-mail requise',
        description: 'Veuillez entrer votre adresse e-mail pour réinitialiser le mot de passe.',
      });
      return;
    }
    try {
      await resetPassword(resetEmail);
      toast({
        title: 'Demande de réinitialisation envoyée',
        description: "Dans une application de démonstration, aucune email n'est envoyée.",
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || "Impossible d'envoyer la demande.",
      });
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
          <CardTitle className="text-2xl">Connexion</CardTitle>
          <CardDescription>
            Entrez votre email ci-dessous pour vous connecter à votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
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
                 <div className="flex items-center">
                  <Label htmlFor="password">Mot de passe</Label>
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="link" className="ml-auto text-sm h-auto p-0">
                            Mot de passe oublié?
                         </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Réinitialiser le mot de passe</AlertDialogTitle>
                          <AlertDialogDescription>
                            Entrez votre adresse e-mail ci-dessous.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                         <div className="grid gap-2 py-4">
                            <Label htmlFor="reset-email">Email</Label>
                            <Input
                            id="reset-email"
                            type="email"
                            placeholder="m@example.com"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            />
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={handlePasswordReset}>Envoyer</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Connexion en cours...' : 'Connexion'}
              </Button>
            </div>
          </form>
        </CardContent>
         <CardFooter className="flex flex-col gap-4">
          <div className="text-center text-sm">
            Vous n'avez pas de compte?{' '}
            <Link href="/signup" className="underline">
              S'inscrire
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

    