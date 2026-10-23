export function formatTimeString(time24: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr || '0', 10);
  if (isNaN(h)) return time24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  const formattedMinutes = m < 10 ? `0${m}` : `${m}`;
  return `${h}:${formattedMinutes} ${ampm}`;
}

export function getCurrentDateStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function getCurrentTimeStr(): string {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}
