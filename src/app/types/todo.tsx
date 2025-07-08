export interface Todo {
  id: string;
  title: string;
  createdAt: number; // fetches Date.now() localtime
  durationMinutes: number | null;
  completed: boolean;
  expired?: boolean;
  notified?: boolean;
  tags?: string[];
}
