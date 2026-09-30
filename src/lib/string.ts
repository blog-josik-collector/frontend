export function capitalizeFirst(value?: string | null): string {
  const [first = '', ...rest] = value ?? '';

  return first.toUpperCase() + rest.join('').toLowerCase();
}
