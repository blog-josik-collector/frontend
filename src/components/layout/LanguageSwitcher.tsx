import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation('nav');
  const value = i18n.resolvedLanguage === 'en' ? 'en' : 'ko';

  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-muted-foreground">{t('language')}</span>
      <select
        aria-label={t('language')}
        value={value}
        onChange={(event) => {
          void i18n.changeLanguage(event.target.value);
        }}
        className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-xl border px-3 text-sm outline-none focus-visible:ring-2"
      >
        <option value="ko">한국어</option>
        <option value="en">English</option>
      </select>
    </label>
  );
};

export default LanguageSwitcher;
