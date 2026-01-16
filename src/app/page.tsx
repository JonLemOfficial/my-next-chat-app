'use client';

import { useState, ReactElement as JSX } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquareText } from 'lucide-react';
import { profiles } from '@/lib/profiles';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';

function HomePage(): JSX {

  const [ selectedProfile, setSelectedProfile ] = useState<string>('');
  const router = useRouter();

  const handleEnterChat = () => {
    if ( selectedProfile ) {
      localStorage.setItem('chat-user', selectedProfile);
      router.push('/chat');
    }
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
          <CardDescription>Seleccione un perfil para empezar a chatear.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-select">Escoja un perfil</Label>
              <Select onValueChange={setSelectedProfile} value={selectedProfile}>
                <SelectTrigger id="profile-select" className="w-full bg-gray-100 hover:bg-gray-200 cursor-pointer">
                  <SelectValue placeholder="Seleccionar un perfil..." />
                </SelectTrigger>
                <SelectContent className="z-index-200 bg-gray-100">
                  {profiles.map((profile) => (
                    <SelectItem key={profile.username} value={profile.username} className="cursor-pointer hover:bg-gray-200">
                      {profile.username} - {profile.fullname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleEnterChat} disabled={!selectedProfile} className="w-full bg-gray-200 hover:bg-gray-300 cursor-pointer border-gray-500 rounded-sm">
              Ingresar al Chat
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default HomePage;