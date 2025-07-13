export interface Todo {
  id: string;
  title: string;
  createdAt: number; // fetches Date.now() localtime
  durationMinutes: number | null;
  completed: boolean;
  expired?: boolean;
  notified?: boolean;
  tags: string[];

  scheduledFor?: string;
  repeat?: RepeatInfo;
}

export type RepeatInfo = {
  frequency: "daily" | "weekly" | "monthly";
  dayOfWeek?: number; // 0 = Sunday, 6 = Saturday (for weekly)
  dayOfMonth?: number; // 1–31 (for monthly)
  time?: string; // "HH:mm"
};
