export function toImagePath(path: string) {
  return `${import.meta.env.VITE_BASE_URL}/${path.replace(/\\/g, '/')}`;
}
