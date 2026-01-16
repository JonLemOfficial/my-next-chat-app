'use client';

import type { User } from '@/types/user';
import type { Message } from '@/types/message';
import type { Chat } from '@/types/chat';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io, type Socket } from 'socket.io-client';
import { profiles } from '@/lib/profiles';
import { ChatContext, type ChatContextType } from '@/hooks/useChat';
import ChatList from '@/components/chat/ChatList';
import ActiveChat from '@/components/chat/ActiveChat';
import { Toaster } from '@/components/ui/toaster';
import { Skeleton } from '@/components/ui/skeleton';
import { Sidebar, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/useToast';
import { useApi } from '@/hooks/useApi';

function ChatPage() {
  const router = useRouter();
  const { toast } = useToast();
  const apiClient = useApi();
  const socketRef = useRef<Socket | null>(null);

  const [ currentUser, setCurrentUser ] = useState<User | null>(null);
  const [ users, setUsers ] = useState<User[]>([]);
  const [ chats, setChats ] = useState<Map<string, Chat>>(new Map());
  const [ activeChatUser, setActiveChatUser ] = useState<User | null>(null);
  // const [ activeChatMessages, setActiveChatMessages ] = useState<Message[] | null>(null);

  useEffect(() => {
    const profileName = localStorage.getItem('chat-user');
    const userProfile = profiles.find((p) => p.username === profileName);

    if ( ! userProfile ) {
      router.push('/');
      return;
    }

    const socket = io({ path: '/api/socket' });
    socketRef.current = socket;

    socket.on('connect', () => {
      const user = { ...userProfile, id: socket.id! };
      setCurrentUser(user);
      socket.emit('join', user);
    });

    socket.on('online-users', (onlineUsers: User[]) => {
      setUsers(onlineUsers);
      setChats(prev => {
        const newChats = new Map(prev);
        onlineUsers.forEach(user => {
          if ( user.username !== userProfile.username && !newChats.has(user.username) ) {
            newChats.set(user.username, { user, messages: [], unreadCount: 0 });
          }
        });

        return newChats;
      });
    });

    socket.on('user-joined', (user: User) => {
      // if ( user.id === socketRef.current?.id ) return;
      // console.log('User joined:', user);
      if ( user.username === userProfile.username ) return;
      setUsers(prev => {
        if ( prev.find(u => u.username === user.username) ) return prev;
        return [ ...prev, user ];
      });
      setChats(prev => {
        const newChats = new Map(prev);
        // if ( user.id !== socket.id && !newChats.has(user.id) ) {
        if ( ! newChats.has(user.username) ) {
          newChats.set(user.username, { user, messages: [], unreadCount: 0 });
        }
        return newChats;
      });

      // if ( user.username === currentUser?.username ) {
      //   toast({
      //     title: 'Welcome to the chat app!',
      //     description: `session for ${currentUser?.username} successfully started.`
      //   });
      // }
    });

    socket.on('user-left', (user: User) => {
      setUsers(prev => prev.filter(u => u.id !== user.id));
      setChats(prev => {
        const newChats = new Map(prev);
        newChats.delete(user.id);
        return newChats;
      });
      setActiveChatUser(prev => (prev?.id === user.id ? null : prev));
      // toast({ title: 'User Left', description: `${user.username} has left the chat.` });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [ router, toast ]);

  useEffect(() => {
    const socket = socketRef.current;
    if ( ! socket || ! currentUser ) return;

    const handleReceiveMessage = (message: Message) => {
      setChats(prev => {
        const newChats = new Map(prev);
        const partner = message.sender.username === currentUser.username ? message.receiver : message.sender;
        const chat = newChats.get(partner.username) ?? { user: partner, messages: [], unreadCount: 0 };
        
        const updatedMessages = [ ...chat.messages, message].sort((a, b) => a.sent_at - b.sent_at );
        let newUnreadCount = chat.unreadCount;
        if ( activeChatUser?.username !== partner.username ) {
          newUnreadCount++;
        }

        newChats.set(partner.username, { ...chat, messages: updatedMessages, unreadCount: newUnreadCount });
        return newChats;
      });
    };

    // const getMessages = async (chatUser: User) => {
    //   try {
    //     const response = await apiClient.post('/api/messages', {
    //       from: currentUser?.key,
    //       to: chatUser.key,
    //     });

    //     return response.data?.messages || [];
    //   } catch (error) {
    //     console.error('Error fetching messages from API:', error);
    //     return [];
    //   }
    // };

    // getMessages(activeChatUser!);

    socket.on('receive-message', handleReceiveMessage);

    return () => {
      socket.off('receive-message', handleReceiveMessage);
    };
  }, [ currentUser, activeChatUser ]);

  const fetchMessages = async (targetUser: User) => {
    if ( ! currentUser ) return;

    try {
      const response = await apiClient.get('/api/messages', {
        params: {
          from: currentUser.key,
          to: targetUser.key,
        }
      });

      if ( response.data && Array.isArray(response.data?.messages) ) {
        const dbMessages: Message[] = response.data?.messages;
        // console.log("Fetched messages:", dbMessages);

        setChats(prev => {
          const newChats = new Map(prev);
          const chat = newChats.get(targetUser.username);
          if ( chat ) {
            newChats.set(targetUser.username, {
              ...chat,
              messages: dbMessages.sort((a: any, b: any) => a.sent_at - b.sent_at),
              unreadCount: 0
            });
          }
          return newChats;
        });
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({ 
        title: "Error", 
        description: "No se pudo cargar el historial de mensajes.", 
        variant: "destructive" 
      });
    }
  };

  const setActiveChatUserAndFetch = async (user: User | null) => {
    // 1. Cambio visual inmediato (UX Rápida)
    setActiveChatUser(user);
    
    if ( user ) {
      // 2. Reseteo inmediato del contador de no leídos
      setChats(prev => {
        const newChats = new Map(prev);
        const chat = newChats.get(user.username);
        if ( chat ) {
          newChats.set(user.username, { ...chat, unreadCount: 0 });
        }
        return newChats;
      });

      // 3. Llamada asíncrona a la base de datos
      await fetchMessages(user);
    }
  };

  // const setActiveChatMessagesAndClearPreviousMessages = (sender: number, receiver: number) => {

  //   // setActiveChatUser(user);
  //   // if ( user ) {
  //   //   setChats(prev => {
  //   //     const newChats = new Map(prev);
  //   //     const chat = newChats.get(user.username);
  //   //     if ( chat ) {
  //   //       newChats.set(user.username, { ...chat, unreadCount: 0 });
  //   //     }
  //   //     return newChats;
  //   //   });
  //   // }
  // };

  const sendMessage = async (text: string) => {
    if ( socketRef.current && currentUser && activeChatUser ) {
      try {
        const response = await apiClient.post('/api/messages/add', {
          from: currentUser.key,
          to: activeChatUser.key,
          message: text,
        });

        if ( response.data?.msg ) {
          // alert(response.data.msg);
          socketRef.current.emit('send-message', {
            sender: currentUser,
            receiver: activeChatUser,
            text,
          });
        } else {
          alert('Ocurrio un error al enviar el mensaje.');
        }
      } catch (error) {
        console.error('Error un la conneccion con la API:', error);
      }
    }
  };

  const filteredChats = new Map(chats);

  if ( currentUser ) {
    filteredChats.delete(currentUser.username);
  }

  const chatContextValue: ChatContextType = {
    currentUser,
    users: users.filter(u => u.username !== currentUser?.username),
    chats: filteredChats,
    activeChat: activeChatUser ? chats.get(activeChatUser.username) || null : null,
    setActiveChatUser: setActiveChatUserAndFetch,
    // setActiveChatMessages: setActiveChatMessagesAndClearPreviousMessages,
    // messages: activeChatMessages || [],
    sendMessage,
  };

  if ( ! currentUser ) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-8 w-48" />
            <p className="text-muted-foreground">Connecting to Chat App...</p>
        </div>
      </div>
    );
  }

  return (
    <ChatContext.Provider value={chatContextValue}>
      {/* <div className="flex h-screen w-full bg-background text-foreground overflow-hidden"> */}
      <SidebarProvider>
        <Sidebar>
          <ChatList/>
        </Sidebar>
        <SidebarInset>
          <ActiveChat/>
        </SidebarInset>
      </SidebarProvider>
      {/* </div> */}
      <Toaster />
    </ChatContext.Provider>
  );
}

export default ChatPage;