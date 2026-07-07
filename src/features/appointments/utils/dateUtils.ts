export const formatDateKey = (date: Date): string => date.toISOString().slice(0, 10);

export const parseDateKey = (value: string): Date => new Date(`${value}T00:00:00`);

export const startOfWeek = (date: Date): Date => {
  const copy = new Date(date);
  const day = copy.getDay();
  copy.setDate(copy.getDate() - day);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

export const endOfWeek = (date: Date): Date => {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
};

export const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);

export const endOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth() + 1, 0);

export const addDays = (date: Date, days: number): Date => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

export const formatDisplayDate = (isoDate: string): string => {
  const parsed = parseDateKey(isoDate);
  return parsed.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
};

export const formatDisplayTime = (time: string): string => {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
};

export const todayKey = (): string => formatDateKey(new Date());
