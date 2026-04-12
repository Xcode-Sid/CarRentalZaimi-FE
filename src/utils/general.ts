export function toImagePath(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http')) return path; // already full URL
  return `${import.meta.env.VITE_BASE_URL}/${path.replace(/\\/g, '/').replace(/^\//, '')}`;
}