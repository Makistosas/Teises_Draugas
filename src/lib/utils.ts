import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('lt-LT', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string, locale = 'lt-LT'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

export function formatShortDate(date: Date | string, locale = 'lt-LT'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

export function formatRelativeTime(date: Date | string, locale = 'lt-LT'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return locale === 'lt' ? 'Šiandien' : 'Today';
  } else if (diffDays === 1) {
    return locale === 'lt' ? 'Vakar' : 'Yesterday';
  } else if (diffDays < 7) {
    return locale === 'lt' ? `Prieš ${diffDays} d.` : `${diffDays} days ago`;
  } else {
    return formatShortDate(d, locale);
  }
}

export function calculateDeadline(startDate: Date, days: number): Date {
  const deadline = new Date(startDate);
  deadline.setDate(deadline.getDate() + days);
  return deadline;
}

export function daysUntil(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function generateCaseNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TD-${year}-${random}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function isValidLithuanianPersonalCode(code: string): boolean {
  // Lithuanian personal code format: GYYMMDDNNNNC
  // G = gender/century (3-6), YY = year, MM = month, DD = day
  // NNNN = sequence number, C = checksum
  if (!/^\d{11}$/.test(code)) return false;

  const g = parseInt(code[0]);
  if (g < 1 || g > 6) return false;

  const mm = parseInt(code.substring(3, 5));
  if (mm < 1 || mm > 12) return false;

  const dd = parseInt(code.substring(5, 7));
  if (dd < 1 || dd > 31) return false;

  // Checksum validation
  const weights1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1];
  const weights2 = [3, 4, 5, 6, 7, 8, 9, 1, 2, 3];

  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(code[i]) * weights1[i];
  }

  let checksum = sum % 11;
  if (checksum === 10) {
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(code[i]) * weights2[i];
    }
    checksum = sum % 11;
    if (checksum === 10) checksum = 0;
  }

  return checksum === parseInt(code[10]);
}

export function maskPersonalCode(code: string): string {
  if (code.length !== 11) return code;
  return code.substring(0, 3) + '*****' + code.substring(8);
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  all: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
