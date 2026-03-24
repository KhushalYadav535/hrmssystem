/**
 * Display dates as DD/MM/YYYY (en-GB) across the app.
 * HTML <input type="date"> values must remain YYYY-MM-DD — use toIsoDateInputValue() for that.
 */

export function formatDateDDMMYYYY(
  value: string | Date | null | undefined,
  options?: { withTime?: boolean }
): string {
  if (value === null || value === undefined || value === '') return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const datePart = d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  if (options?.withTime) {
    const timePart = d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${datePart}, ${timePart}`;
  }
  return datePart;
}

/** Date + time (HH:MM) for lists */
export function formatDateTimeDDMMYYYY(value: string | Date | null | undefined): string {
  return formatDateDDMMYYYY(value, { withTime: true });
}

/** Date + time with seconds (audit / compliance) */
export function formatDateTimeFullDDMMYYYY(value: string | Date | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const datePart = d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timePart = d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  return `${datePart}, ${timePart}`;
}

/** For <input type="date" value={...} /> — always ISO yyyy-mm-dd in local calendar day */
export function toIsoDateInputValue(value: string | Date | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Today as yyyy-mm-dd for date input defaults */
export function todayIsoDateInput(): string {
  return toIsoDateInputValue(new Date());
}
