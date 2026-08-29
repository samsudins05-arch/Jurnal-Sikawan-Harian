export const indonesianDays = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu'
];

export const indonesianMonths = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

/**
 * Format a Date or date string to Indonesian full format:
 * e.g., "Jumat, 28 Agustus 2026"
 */
export function formatIndonesianDate(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';
  
  const dayName = indonesianDays[date.getDay()];
  const day = date.getDate();
  const monthName = indonesianMonths[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName}, ${day} ${monthName} ${year}`;
}

/**
 * Format a Date or date string to "DD/MM/YYYY" format
 */
export function formatSlashDate(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Convert YYYY-MM-DD to Indonesian format
 */
export function parseDateStrToIndonesian(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const date = new Date(year, month, day);
  return formatIndonesianDate(date);
}

/**
 * Format a Date or date string to Indonesian format without day name (for titimangsa tanda tangan):
 * e.g., "28 Agustus 2026"
 */
export function formatIndonesianDateNoDay(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';
  
  const day = date.getDate();
  const monthName = indonesianMonths[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${monthName} ${year}`;
}

/**
 * Convert YYYY-MM-DD to Indonesian format without day name (for titimangsa tanda tangan):
 * e.g., "28 Agustus 2026"
 */
export function parseDateStrToIndonesianNoDay(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const date = new Date(year, month, day);
  return formatIndonesianDateNoDay(date);
}

/**
 * Convert Date to YYYY-MM-DD (standard HTML input format)
 */
export function toIsoDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Helper to generate time hours (00-23) and minutes (00, 05, 10, ... or every minute)
 */
export const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
export const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
export const MINUTES_STEP_5 = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));
