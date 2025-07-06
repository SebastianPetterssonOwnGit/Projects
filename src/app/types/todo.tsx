export interface Todo {
  id: string;
  title: string;
  createdAt: number; // fetches Date.now() localtime
  durationMinutes: number;
  completed: boolean;
  expired?: boolean;
  notified?: boolean;
}
