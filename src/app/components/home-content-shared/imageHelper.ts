const apiUrl = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

export function resolveImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  if (
    imageUrl.startsWith('http://') ||
    imageUrl.startsWith('https://') ||
    imageUrl.startsWith('data:') ||
    imageUrl.startsWith('blob:')
  ) {
    return imageUrl;
  }
  const clean = imageUrl.replace(/^\/+/, '');
  if (clean.startsWith('uploads/')) {
    return `${apiUrl}/public/${clean.replace(/^uploads\//, '')}`;
  }
  return `${apiUrl}/${clean}`;
}
