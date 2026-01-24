// src/utils/user-formatters.ts

export function getInitials(name: string): string {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase());
}

export function formatMemberSince(dateString: string): string {
  const date = new Date(dateString);
  const month = date.toLocaleDateString('es-CO', { month: 'short' });
  const year = date.getFullYear();
  return `Miembro desde ${month} ${year}`;
}