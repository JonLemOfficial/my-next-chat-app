'use client';

// ** Dependencies
import { useState, ReactElement as JSX, ReactEventHandler, SyntheticEvent } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquareText } from 'lucide-react';

// ** Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// ** Hooks
import { useApi } from '@/hooks/useApi';

function HomePage(): JSX {

  const [ username, setUsername ] = useState<string>('');
  const [ isValidUsername, setIsValidUsername ] = useState<boolean>(false);

  const apiClient = useApi();
  const router = useRouter();

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    if ( username ) {
      const response = await apiClient.post('/api/user', { username });

      if ( response.data ) {
        localStorage.setItem('chat-user', username);
        router.push('/chat');
      } else {
        alert('Ocurrio un error inesperado al ingresar.');
      }
    }
  };

  const handleUsernameChange = (user: string) => {
    setUsername(() => user.toLowerCase().trim());

    if ( ! /^[a-zA-Z0-9_-]*$/.test(user) ) {
      alert('El nombre de usuario es invalido: ' + user, );
      setIsValidUsername(() => false);
      return;
    }

    if ( user === '' ) {
      setIsValidUsername(() => false);
      return;
    }

    setIsValidUsername(() => true);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-200 p-4">
      <Card className="w-full max-w-md shadow-lg bg-white">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
            <MessageSquareText className="h-8 w-8 text-primary" />
          </div>
          <p>{process.env.NODE_ENV}</p>
          <CardTitle className="text-3xl font-bold">Chat app</CardTitle>
          <CardDescription>Escoja un nombre de perfil para empezar a chatear.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2">
              <Input
                value={username}
                onChange={(e: any) => handleUsernameChange(e.target.value)}
                placeholder="Escribe un usuario..."
                autoComplete="off"
                className="text-base bg-white"
              />
              <Button type="submit" disabled={!isValidUsername} className="w-full bg-gray-200 hover:bg-gray-300 cursor-pointer border-gray-500 rounded-sm">
                Ingresar al Chat
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default HomePage;