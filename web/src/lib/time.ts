export function isPast(date: Date | string) {
  return Date.now() >= new Date(date).getTime();
}
