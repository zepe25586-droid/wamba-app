
'use client';
import type { User, Member, Projet, Beneficiary, Pret, Archive, Message } from '@/lib/types';
import { createContext, useState, useContext, useMemo, type ReactNode, useEffect } from 'react';
import { ADMIN_EMAIL } from '@/lib/auth';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { members as initialMembers, projets as initialProjets, beneficiaries as initialBeneficiaries, prets as initialPrets, initialArchives } from '@/lib/data';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  members: Member[];
  projets: Projet[];
  beneficiaries: Beneficiary[];
  prets: Pret[];
  archives: Archive[];
  messages: Message[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  setProjets: React.Dispatch<React.SetStateAction<Projet[]>>;
  setBeneficiaries: React.Dispatch<React.SetStateAction<Beneficiary[]>>;
  setPrets: React.Dispatch<React.SetStateAction<Pret[]>>;
  setArchives: React.Dispatch<React.SetStateAction<Archive[]>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  updateCurrentUser: (data: Partial<Omit<User, 'id'>>) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  createMemberByAdmin: (data: Omit<User, 'id'> & { password?: string }) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  deleteCurrentUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_MEMBER: Member = {
  id: '1',
  name: 'Admin Wamba',
  email: ADMIN_EMAIL,
  phoneNumber: '000000000',
  joinDate: new Date().toISOString(),
  avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxwZXJzb24lMjBhdmF0YXJ8ZW58MHx8fHwxNzYyODQ2MTgwfDA&ixlib=rb-4.1.0&q=80&w=1080',
  badges: [{ name: 'Admin', color: 'gold' }],
  status: 'approved',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [members, setMembers] = useLocalStorage<Member[]>('members_data', [ADMIN_MEMBER, ...initialMembers]);
  const [projets, setProjets] = useLocalStorage<Projet[]>('projets_data', initialProjets);
  const [beneficiaries, setBeneficiaries] = useLocalStorage<Beneficiary[]>('beneficiaries_data', initialBeneficiaries);
  const [prets, setPrets] = useLocalStorage<Pret[]>('prets_data', initialPrets);
  const [archives, setArchives] = useLocalStorage<Archive[]>('archives_data', initialArchives);
  const [messages, setMessages] = useLocalStorage<Message[]>('messages_data', []);
  
  useEffect(() => {
    // Mock user loading from a session
    const sessionUser = sessionStorage.getItem('user');
    if(sessionUser) {
        setUser(JSON.parse(sessionUser));
    }
    setLoading(false);
  }, []);


  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    // This is a mock login. In a real app, you'd verify the password against a hash.
    const member = members.find(m => m.email.toLowerCase() === email.toLowerCase());

    if (member) {
      if (member.status !== 'approved') {
        setLoading(false);
        throw new Error("Votre compte est en attente d'approbation.");
      }
        
      const loggedInUser: User = {
        id: member.id,
        name: member.name,
        email: member.email,
        avatar: member.avatarUrl,
        phoneNumber: member.phoneNumber
      };
      setUser(loggedInUser);
      sessionStorage.setItem('user', JSON.stringify(loggedInUser));

    } else {
      setLoading(false);
      throw new Error("Email ou mot de passe incorrect.");
    }
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
  };
  
  const resetPassword = async (email: string): Promise<void> => {
    console.log(`Password reset requested for ${email}. In a real app, an email would be sent.`);
    // No actual email is sent in this mock implementation.
    return Promise.resolve();
  };
  
  const createMemberByAdmin = async (data: Omit<User, 'id'> & { password?: string }) => {
     if (members.some(m => m.email.toLowerCase() === data.email.toLowerCase())) {
        throw new Error("Un membre avec cette adresse e-mail existe déjà.");
    }
    const isAdminUser = data.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    const newMember: Member = {
        id: `member-${Date.now()}`,
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        joinDate: new Date().toISOString(),
        avatarUrl: data.avatar,
        status: isAdminUser ? 'approved' : 'pending',
    };
    setMembers(prev => [...prev, newMember]);
  };
  
  const updateCurrentUser = async (data: Partial<Omit<User, 'id'>>) => {
      if (!user) throw new Error("Utilisateur non connecté.");
      
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      sessionStorage.setItem('user', JSON.stringify(updatedUser));

      setMembers(prevMembers => prevMembers.map(m => {
          if (m.id === user.id) {
              return {
                  ...m,
                  name: data.name ?? m.name,
                  avatarUrl: data.avatar ?? m.avatarUrl
              }
          }
          return m;
      }));
  }

  const deleteCurrentUser = async () => {
    if (!user) throw new Error("Aucun utilisateur à supprimer.");
    setMembers(prev => prev.filter(m => m.id !== user.id));
    logout();
  }

  const isAdmin = useMemo(() => !!user && user.email === ADMIN_EMAIL, [user]);

  const value = {
      user,
      loading,
      isAdmin,
      members,
      projets,
      beneficiaries,
      prets,
      archives,
      messages,
      setMembers,
      setProjets,
      setBeneficiaries,
      setPrets,
      setArchives,
      setMessages,
      login,
      logout,
      createMemberByAdmin,
      updateCurrentUser,
      resetPassword,
      deleteCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
