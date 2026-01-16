import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { User } from '@/types/user';
import type { Message } from '@/types/message';

import { Server as IOServer } from 'socket.io';
import { profiles } from '@/lib/profiles';

interface SocketServer extends HTTPServer {
  io?: IOServer;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

const onlineUsers = new Map<string, User>();
const userSocketMap = new Map<string, string>();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if ( res.socket.server.io ) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    
    const io = new IOServer(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
    });

    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('A user connected:', socket.id);

      socket.on('join', (user: User) => {
        userSocketMap.set(user.username, user.id);
        console.log(`${user.username} joined with id: ${user.id}`);

        // const existingEntry = Array.from(onlineUsers.entries()).find(
        //   ([_, u]) => u.key === user.key
        // );

        // if ( existingEntry ) {
        //   const [ existingSocketId ] = existingEntry;
        //   console.log(`deleting id: ${socket.id}`);
        //   onlineUsers.delete(existingSocketId);

        //   // desconectar el socket anterior para forzar una sola sesión
        //   io.sockets.sockets.get(existingSocketId)?.disconnect(); 
        // }

        const newUser: User = { ...user, id: socket.id };
        // onlineUsers.set(socket.id, newUser);
        // console.log(userSocketMap.keys(), userSocketMap.values());
        socket.broadcast.emit('user-joined', newUser);
        // console.log(`onlineUsers map:`, onlineUsers.values());
        // socket.emit(
        io.emit(
          'online-users',
          // profiles.filter((user) => user.username !== newUser.username)
          profiles
        );
      });

      socket.on('send-message', (message: Omit<Message, 'id' | 'sent_at'>) => {
        const newMessage: Message = {
          ...message,
          id: `${Date.now()}-${Math.random()}`,
          sent_at: new Date(Date.now()),
        };

        // console.log('Sending message:', newMessage);
        const receiverSocketId = userSocketMap.get(newMessage.receiver.username);
        const senderSocketId = userSocketMap.get(newMessage.sender.username);

        if ( receiverSocketId ) {
            io.to(receiverSocketId).emit('receive-message', newMessage);
        }

        if ( senderSocketId && senderSocketId !== receiverSocketId ) {
            io.to(senderSocketId).emit('receive-message', newMessage);
        }
      });

      socket.on('disconnect', () => {
        const user = onlineUsers.get(socket.id);
        if ( user ) {
          console.log(`${user.username} disconnected`);
          onlineUsers.delete(socket.id);
          io.emit('user-left', user);
        }
      });
    });
  }

  res.end();
}
