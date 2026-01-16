import type { User } from '@/types/user';

export const profiles: Omit<User, 'id'>[] = [
  {
    key: 1,
    username: 'jonathan',
    fullname: 'Jonathan Lemos',
    email: 'jonathan@example.com',
  },
  {
    key: 2,
    username: 'mileidy',
    fullname: 'Mileidy Perez',
    email: 'kira@example.com',
  },
  {
    key: 3,
    username: 'marc',
    fullname: 'Marc Hudson',
    email: 'marc@example.com'
  },
];
