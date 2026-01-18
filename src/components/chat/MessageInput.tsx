'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function MessageInput() {
  const [ message, setMessage ] = useState('');
  const { sendMessage } = useChat();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        autoComplete="off"
        className="text-base bg-white"
      />
      <Button className="hover:bg-gray-300 rounded-full cursor-pointer" type="submit" size="icon" aria-label="Send Message">
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
}
