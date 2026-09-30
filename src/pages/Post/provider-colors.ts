const providerBadgeColors = [
  'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200',
  'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200',
  'bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200',
  'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
  'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200',
  'bg-cyan-100 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-200',
  'bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200',
  'bg-fuchsia-100 text-fuchsia-900 dark:bg-fuchsia-950 dark:text-fuchsia-200',
];

export function getProviderBadgeColor(provider: string) {
  let hash = 0;

  for (const character of provider.normalize('NFC')) {
    hash = (Math.imul(hash, 31) + character.codePointAt(0)!) >>> 0;
  }

  return providerBadgeColors[hash % providerBadgeColors.length];
}
