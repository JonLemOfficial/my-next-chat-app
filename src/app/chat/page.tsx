'use client';

import type { User } from '@/types/user';
import type { Message } from '@/types/message';
import type { Chat } from '@/types/chat';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { io, type Socket } from 'socket.io-client';
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
  const [ isLoadingUsers, setIsLoadingUsers ] = useState<boolean>(true);
  const [ allUsers, setAllUsers ] = useState<User[]>([]);
  const [ users, setUsers ] = useState<User[]>([]);
  const [ chats, setChats ] = useState<Map<string, Chat>>(new Map());
  const [ activeChatUser, setActiveChatUser ] = useState<User | null>(null);
  const [ groupMessages, setGroupMessages ] = useState<Message[]>([]);

  const fetchGlobalHistory = useCallback(async () => {
    try {
      const response = await apiClient.get('/api/allMessages', {
        params: {
          from: currentUser?.key
        }
      });

      if ( response.data && Array.isArray(response.data?.messages) ) {
        const sorted = response.data.messages.sort(
          (a: any, b: any) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
        );
        setGroupMessages(sorted);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiClient.get('/api/allUsers');
        if ( response.data && Array.isArray(response.data.users) ) {
          setAllUsers(response.data.users); 
        }
      } catch (err) {
        console.error("Error fetching users", err);
        setAllUsers([]);
      } finally {
        // Marcamos que ya terminó la carga, haya sido exitosa o no
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if ( isLoadingUsers ) return;

    const profileName = localStorage.getItem('chat-user');
    
    if ( ! profileName ) {
      router.push('/');
      return;
    }
    
    const userProfile = allUsers.find((p) => p.username === profileName);

    if ( ! userProfile ) {
      console.error("Usuario no encontrado en la base de datos");
      // Opcional: router.push('/') si quieres forzar relogin
      return;
    }

    if ( socketRef.current ) return;

    const socket = io({ path: '/api/socket' });
    socketRef.current = socket;

    socket.on('connect', () => {
      const user = { ...userProfile, key: userProfile?.id, id: socket.id! };
      setCurrentUser(user);
      socket.emit('join', user);

      fetchGlobalHistory();
    });

    socket.on('online-users', (onlineUsers: User[]) => {
      setUsers(onlineUsers);
      setChats(prev => {
        const newChats = new Map(prev);
        allUsers.forEach(user => {
          if ( user.username !== userProfile?.username && !newChats.has(user.username) ) {
            newChats.set(user.username, { user, messages: [], unreadCount: 0 });
          }
        });

        return newChats;
      });
    });

    socket.on('user-joined', (user: User) => {
      // if ( user.id === socketRef.current?.id ) return;
      if ( user.username === userProfile?.username ) return;

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
      // setChats(prev => {
      //   const newChats = new Map(prev);
      //   newChats.delete(user.id);
      //   return newChats;
      // });
      // setActiveChatUser(prev => (prev?.id === user.id ? null : prev));
      // toast({ title: 'User Left', description: `${user.username} has left the chat.` });
    });

    socket.on('receive-message', (message: Message) => {
      setGroupMessages(prev => {
        // Evitar duplicados por ID
        if ( prev.some(m => m.id === message.id) ) return prev;
        
        const updated = [...prev, message];
        return updated.sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime());
      });
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [ router, toast, isLoadingUsers, allUsers, fetchGlobalHistory ]);

  const sendMessage = async (text: string) => {
    if ( socketRef.current && currentUser ) {
      try {
        const response = await apiClient.post('/api/messages/add', {
          from: currentUser.key,
          to: null,
          message: text,
        });

        if ( response.data?.msg ) {
          // alert(response.data.msg);
          socketRef.current.emit('send-message', {
            sender: currentUser,
            receiver: { username: 'GlobalGroup' },
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
    activeChat: {
      user: { username: 'GlobalGroup', key: 'global' } as any,
      messages: groupMessages,
      unreadCount: 0
    },
    setActiveChatUser: async () => {},
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