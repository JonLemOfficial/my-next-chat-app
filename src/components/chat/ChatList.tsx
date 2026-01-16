'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useSidebar } from '@/components/ui/sidebar';
import { User } from '@/types/user';

function ChatList() {
  
  const { currentUser, chats, activeChat, setActiveChatUser } = useChat();
    const { isMobile, setOpenMobile } = useSidebar();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('chat-user');
    router.push('/');
  };

  const handleSelectChat = (user: User) => {
    setActiveChatUser(user);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const getAvatarUrl = (avatarId: string) => {
    return PlaceHolderImages.find((img) => img.id === avatarId)?.imageUrl || '';
  };

  const sortedChats = Array.from(chats.values())
    .filter((chat) => chat.user.username !== currentUser?.username)
    .sort((a, b) => {
      const lastMessageA = a.messages[a.messages.length - 1];
      const lastMessageB = b.messages[b.messages.length - 1];
      
      if ( lastMessageA && lastMessageB ) {
        return lastMessageB.timestamp - lastMessageA.timestamp;
      }

      if ( lastMessageA ) return -1;
      if ( lastMessageB ) return 1;
      
      return a.user.username.localeCompare(b.user.username);
    });

  return (
    <div className="flex flex-col h-full bg-gray-200">
      <div className="p-4 border-b">
        {currentUser && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={getAvatarUrl(currentUser.username)} alt={currentUser.username}/>
                <AvatarFallback>
                    {currentUser.username.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-semibold">
                {currentUser.username}
              </h2>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="h-8 w-8 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="sr-only">Logout</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Logout</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
      <ScrollArea className="flex-1 bg-white">
        <div className="flex flex-col gap-1 p-2">
          {sortedChats.map(({ user, messages, unreadCount }) => {
            const lastMessage = messages[messages.length - 1];
            return (
              <button
                key={user.key}
                onClick={() => handleSelectChat(user)}
                className={cn(
                  'flex items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-muted cursor-pointer hover:bg-gray-50',
                  activeChat?.user.username === user.username && 'bg-gray-100'
                )}
              >
                <Avatar>
                  <AvatarImage
                    className={
                        cn(
                            'rounded-circle',
                            activeChat?.user.username === user.username && 'bg-white'
                        )
                    }
                    src={getAvatarUrl(user.username)}
                    alt={user.username}
                  />
                  <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 truncate">
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {lastMessage
                      ? `${lastMessage.sender.username === currentUser?.username ? 'Tú: ' : ''}${lastMessage.text}`
                      : 'No hay mensajes aún'}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <Badge className="bg-red-100 text-accent-foreground hover:bg-red-200">
                    {unreadCount}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

export default ChatList;