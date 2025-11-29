
'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Paperclip, File as FileIcon, X, Award } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import type { BadgeColor, Message, Member } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const badgeColorClasses: Record<BadgeColor, string> = {
  gold: 'bg-yellow-200 text-yellow-800 border-yellow-300',
  silver: 'bg-slate-200 text-slate-800 border-slate-300',
  bronze: 'bg-orange-200 text-orange-800 border-orange-300',
  default: 'bg-blue-100 text-blue-800 border-blue-200',
};

const badgeIconColorClasses: Record<BadgeColor, string> = {
  gold: 'text-yellow-500',
  silver: 'text-slate-500',
  bronze: 'text-orange-500',
  default: 'text-blue-500',
};

const badgeTextColorClasses: Record<BadgeColor, string> = {
  gold: 'text-yellow-600 dark:text-yellow-400',
  silver: 'text-slate-600 dark:text-slate-400',
  bronze: 'text-orange-600 dark:text-orange-400',
  default: 'text-blue-600 dark:text-blue-400',
};

const getPrimaryBadgeColor = (member: Member): BadgeColor | null => {
    if (!member.badges || member.badges.length === 0) return null;
    if (member.badges.some(b => b.color === 'gold')) return 'gold';
    if (member.badges.some(b => b.color === 'silver')) return 'silver';
    if (member.badges.some(b => b.color === 'bronze')) return 'bronze';
    return 'default';
};


export default function TchatPage() {
    const { user, members, messages, setMessages } = useAuth();

    const [newMessage, setNewMessage] = useState('');
    const [fileToSend, setFileToSend] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollViewportRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const prevMessagesRef = useRef<Message[] | null>(null);
    const isInitialLoad = useRef(true);


    // Auto-scroll and notifications
    useEffect(() => {
        if (scrollViewportRef.current) {
            scrollViewportRef.current.scrollTo({
                top: scrollViewportRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
        
        if (messages && user) {
             if (isInitialLoad.current) {
                isInitialLoad.current = false;
            } else if (prevMessagesRef.current && messages.length > prevMessagesRef.current.length) {
                const lastMessage = messages[messages.length - 1];
                if (lastMessage.senderId !== user.id) {
                    const sender = getMemberInfo(lastMessage.senderId);
                    toast({
                        title: `Nouveau message de ${sender?.name || 'Inconnu'}`,
                        description: lastMessage.text || 'A envoyé un fichier',
                    });
                }
            }
            prevMessagesRef.current = messages;
        }

    }, [messages, user, toast]);


    const getMemberInfo = (memberId: string) => {
        return members?.find((m) => m.id === memberId);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
             const file = event.target.files[0];
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast({
                    variant: 'destructive',
                    title: 'Fichier trop volumineux',
                    description: 'La taille du fichier ne doit pas dépasser 5 Mo.',
                });
                return;
            }
            setFileToSend(event.target.files[0]);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((newMessage.trim() === '' && !fileToSend) || !user) return;
        
        const senderId = user.id;

        const messageData: Partial<Omit<Message, 'id'>> = {
            senderId,
            timestamp: new Date().toISOString(),
        };

        if (newMessage.trim() !== '') {
            messageData.text = newMessage.trim();
        }

        const processMessage = (finalMessageData: Partial<Omit<Message, 'id'>>) => {
            const finalMessage: Message = {
                id: `msg-${Date.now()}`,
                ...finalMessageData
            } as Message;

            setMessages(prev => [...prev, finalMessage]);
            setNewMessage('');
            setFileToSend(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
        
        if (fileToSend) {
             const reader = new FileReader();
             reader.readAsDataURL(fileToSend);
             reader.onload = () => {
                messageData.file = {
                    name: fileToSend.name,
                    url: reader.result as string, // Base64 Data URI
                    type: fileToSend.type,
                }
                processMessage(messageData);
             };
             reader.onerror = (error) => {
                 toast({ variant: 'destructive', title: 'Erreur de lecture du fichier', description: error.toString()});
             }
        } else {
             processMessage(messageData);
        }
    };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
        <h1 className="text-2xl font-bold tracking-tight mb-4">Tchat de groupe</h1>
      <Card className="flex-1 flex flex-col">
        <CardHeader>
            <CardTitle>Discussion</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full" viewportRef={scrollViewportRef}>
                <div className="space-y-4 pr-4">
                {messages?.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map((message) => {
                    const member = getMemberInfo(message.senderId);
                    const isCurrentUser = member?.id === user?.id;
                    const primaryBadgeColor = member ? getPrimaryBadgeColor(member) : null;
                    return (
                    <div key={message.id} className={cn("flex items-end gap-2", isCurrentUser ? "justify-end" : "")}>
                        {!isCurrentUser && member && (
                            <Avatar className="h-8 w-8 self-start">
                                <AvatarImage src={member?.avatarUrl} />
                                <AvatarFallback>{member?.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        )}
                        <div className={cn(
                            "rounded-lg px-3 py-2 max-w-sm",
                            isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}>
                        {!isCurrentUser && member && (
                            <div className="flex items-center gap-2 mb-1">
                            <p className={cn("text-xs font-semibold", primaryBadgeColor && badgeTextColorClasses[primaryBadgeColor])}>{member?.name}</p>
                            {member?.badges && member.badges.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                {member.badges.map(badge => (
                                    <Badge key={badge.name} variant="secondary" className={cn("border text-xs h-4 px-1", badgeColorClasses[badge.color])}>
                                    <Award className={cn("h-3 w-3 mr-0.5", badgeIconColorClasses[badge.color])}/>
                                    {badge.name}
                                    </Badge>
                                ))}
                                </div>
                            )}
                            </div>
                        )}
                        {message.file && (
                            <div className="mb-2">
                                {message.file.type.startsWith('image/') ? (
                                <Image src={message.file.url} alt={message.file.name} width={200} height={200} className="rounded-md object-cover cursor-pointer" onClick={() => { if (typeof window !== 'undefined') window.open(message.file.url, '_blank'); }} />
                            ) : (
                                <a href={message.file.url} download={message.file.name} className="flex items-center gap-2 p-2 rounded-md bg-background/20 hover:bg-background/40">
                                <FileIcon className="h-6 w-6" />
                                <span className="text-sm font-medium truncate">{message.file.name}</span>
                                </a>
                            )}
                            </div>
                        )}
                        {message.text && <p className="text-sm">{message.text}</p>}
                        <p className="text-xs text-right mt-1 opacity-70">{new Date(message.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        {isCurrentUser && member && (
                            <Avatar className="h-8 w-8 self-start">
                                <AvatarImage src={member?.avatarUrl} />
                                <AvatarFallback>{member?.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                    );
                })}
                </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="pt-6 border-t">
            <div className="flex flex-col w-full gap-2">
                {fileToSend && (
                    <div className="flex items-center justify-between p-2 rounded-md bg-muted text-sm">
                        <div className="flex items-center gap-2 truncate">
                           <FileIcon className="h-5 w-5 shrink-0" />
                           <span className="truncate">{fileToSend.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setFileToSend(null)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
                    <Input
                    id="message"
                    placeholder="Écrivez votre message..."
                    className="flex-1"
                    autoComplete="off"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <Button type="button" size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()}>
                        <Paperclip className="h-5 w-5" />
                        <span className="sr-only">Joindre un fichier</span>
                    </Button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <Button type="submit" size="icon">
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Envoyer</span>
                    </Button>
                </form>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
