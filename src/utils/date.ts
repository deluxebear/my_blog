export function fmtMonthDay(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${m}-${day}`;
}

export function fmtFull(d: Date): string {
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

export function monthLabel(d: Date): string {
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月`;
}

export function yearLabel(d: Date): string {
  return String(d.getFullYear());
}
