'use client';

import { useEffect, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import MessageInput from '@/components/chat/MessageInput';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { format } from 'date-fns';
import { Users } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function ActiveChat() {
  const { currentUser, activeChat } = useChat();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ( scrollAreaRef.current ) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight });
    }
  }, [ activeChat?.messages ]);


  const getAvatarUrl = (avatarId: string) => {
    return PlaceHolderImages.find((img) => img.id === avatarId)?.imageUrl || '';
  };
  
  if ( ! activeChat ) {
    return (
      <div className="flex-1 flex flex-col h-full">
        <header className="flex items-center gap-3 border-b p-4 bg-gray-200 md:hidden">
          <SidebarTrigger />
          <h2 className="text-lg font-semibold">Chats</h2>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center text-center bg-muted/20">
          <Users className="h-16 w-16 text-muted-foreground mb-4"/>
          <h2 className="text-2xl font-bold">Bienvenido a Chat app</h2>
          <p className="text-muted-foreground">Seleccione un usuario para empezar a chatear</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-hidden">
      <header className="flex items-center gap-3 border-b p-4 bg-gray-200">
        <SidebarTrigger className="md:hidden" />
        <Avatar>
          <AvatarImage src={getAvatarUrl(activeChat.user.username)} alt={activeChat.user.username} />
          <AvatarFallback>{activeChat.user.username.charAt(0)}</AvatarFallback>
        </Avatar>
        <h2 className="text-lg font-semibold">{activeChat.user.username}</h2>
      </header>
      <ScrollArea className="flex-1 max-h-full p-4" ref={scrollAreaRef}>
        <div className="flex flex-col gap-4">
          {activeChat.messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-end gap-2 max-w-[75%]',
                message.sender.key === currentUser?.key ? 'self-end flex-row-reverse' : 'self-start'
              )}
            >
              <Avatar className="h-8 w-8 rounded-circle bg-gray-100">
                <AvatarImage src={getAvatarUrl(message.sender.username)} alt={message.sender.username} />
                <AvatarFallback>{message.sender.username.charAt(0)}</AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  'rounded-lg px-3 py-2 text-sm break-words shadow-lg',
                  message.sender.key === currentUser?.key
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-gray-100 rounded-bl-none'
                )}
              >
                <p>{message.text}</p>
                <p className={cn(
                  'text-xs mt-1 text-right',
                   message.sender.key === currentUser?.key
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground'
                )}>
                  {format(new Date(message.sent_at), 'p')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <footer className="p-4 border-t bg-gray-200">
        <MessageInput />
      </footer>
    </div>
  );
}
