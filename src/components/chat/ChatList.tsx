'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

import { useChat } from '@/hooks/useChat';

function ChatList() {
  
  const { currentUser, chats, activeChat } = useChat();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('chat-user');
    router.push('/');
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
              <Avatar className="h-12 w-12 bg-white">
                <AvatarImage src={getAvatarUrl(currentUser.username)} alt={currentUser.username}/>
                <AvatarFallback>
                  {currentUser.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-semibold">
                {currentUser.username}
              </h2>
            </div>
            {/* <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild> */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="h-8 w-8 hover:bg-gray-300 rounded-full cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="sr-only">Logout</span>
                  </Button>
                {/* </TooltipTrigger>
                <TooltipContent>
                  <p>Logout</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider> */}
          </div>
        )}
      </div>
      <p className="py-2 px-4 text-sm text-center border-black border-b-1">
        Usuarios en este chat
      </p>
      <ScrollArea className="flex-1 bg-white">
        <div
          className={cn(
            'flex flex-col',
            sortedChats.length === 0 ? 'items-center justify-center h-100 p-3' : ''
          )}
        >
          {sortedChats.length > 0 && sortedChats.map(({ user }) => {
            return (
              <div
                key={user.username}
                className="flex items-center p-2 text-left transition-colors hover:bg-muted hover:bg-gray-50 border-b-1 border-gray-200"
              >
                <Avatar className="h-10 w-10 rounded-circle bg-gray-200 mr-3">
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
                  <AvatarFallback>
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 truncate">
                  <p className="font-semibold">{user.username}</p>
                </div>
              </div>
            );
          }) || (
            <div className='text-sm text-center'>
              <p>No existen otros usuarios en este chat.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default ChatList;