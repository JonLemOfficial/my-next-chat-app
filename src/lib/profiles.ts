import type { User } from '@/types/user';

export const profiles: Omit<User, 'id'>[] = [
  {
    key: 1,
    username: 'jonathan',
    fullname: 'Jonathan Lemos',
  },
  {
    key: 2,
    username: 'mileidy',
    fullname: 'Mileidy Perez',
  },
  {
    key: 3,
    username: 'marc',
    fullname: 'Marc Hudson',
  },
];
