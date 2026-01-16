export type Message = {
  id: string;
  sender: User;
  receiver: User;
  text: string;
  sent_at: Date;
};