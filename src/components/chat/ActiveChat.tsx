'use client';

import { useEffect, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import MessageInput from '@/components/chat/MessageInput';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { format } from 'date-fns';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function ActiveChat() {
  const { currentUser, activeChat } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [ activeChat?.messages ]);


  const getAvatarUrl = (avatarId: string) => {
    return PlaceHolderImages.find((img) => img.id === avatarId)?.imageUrl || '';
  };
  
  return (
    <div className="flex-1 flex flex-col h-full overflow-y-hidden relative">
      <header className="flex items-center gap-3 border-b p-4 bg-gray-200 shrink-0 z-10 sticky top-0">
        <SidebarTrigger className="md:hidden" />
        <h2 className="text-lg font-semibold">
          Chat público
        </h2>
      </header>
      <ScrollArea className="flex-1 max-h-full p-4">
        <div className="flex flex-col gap-4">
          {activeChat?.messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-end gap-2 max-w-[75%]',
                message.sender.key === currentUser?.key ? 'self-end flex-row-reverse' : 'self-start'
              )}
            >
              <Avatar className="h-8 w-8 rounded-circle bg-gray-100 border-1 border-gray-200">
                <AvatarImage src={getAvatarUrl(message.sender.username)} alt={message.sender.username} />
                <AvatarFallback>
                  {message.sender.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  'rounded-lg px-3 py-2 text-sm break-words shadow-lg',
                  message.sender.key === currentUser?.key
                    ? 'bg-blue-100 text-primary-foreground rounded-br-none'
                    : 'bg-gray-100 rounded-bl-none'
                )}
              >
                <p className="text-xs text-gray-700 mb-1">
                  {message.sender.key === currentUser?.key ? 'Yo' : message.sender.username}
                </p>
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
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <footer className="p-4 border-t bg-gray-200">
        <MessageInput />
      </footer>
    </div>
  );
}
