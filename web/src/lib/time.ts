export function isPast(date: Date | string) {
  return Date.now() >= new Date(date).getTime();
}

export function isWithinDays(date: Date | string | number, days: number) {
  return new Date(date).getTime() - Date.now() <= days * 24 * 60 * 60 * 1000;
}
