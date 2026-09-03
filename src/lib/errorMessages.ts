export function getFriendlyErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (!(error instanceof Error)) return fallback;

  const message = error.message.toLowerCase();

  if (message.includes('network') || message.includes('fetch failed')) {
    return 'Network issue — please check your internet connection and try again.';
  }
  if (message.includes('duplicate key') || message.includes('already exists')) {
    return 'This already exists. Please use a different value.';
  }
  if (message.includes('jwt') || message.includes('session') || message.includes('unauthorized')) {
    return 'Your session has expired. Please log in again.';
  }
  if (message.includes('permission denied') || message.includes('row-level security')) {
    return "You don't have permission to do this.";
  }
  if (message.includes('timeout')) {
    return 'The request took too long. Please try again.';
  }

  return error.message || fallback;
}
