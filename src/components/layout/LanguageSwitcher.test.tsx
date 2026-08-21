import { afterEach, expect, it } from 'vitest';

import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import LanguageSwitcher from './LanguageSwitcher';

import i18n from '@/i18n';
import { renderWithI18n } from '@/test/i18n';

afterEach(async () => {
  cleanup();
  localStorage.clear();
  await i18n.changeLanguage('ko');
});

it('changes language via select and persists to localStorage', async () => {
  const user = userEvent.setup();
  renderWithI18n(<LanguageSwitcher />);

  const select = screen.getByRole('combobox', { name: '언어' });
  expect(select).toHaveValue('ko');

  await user.selectOptions(select, 'en');

  expect(i18n.language).toMatch(/^en/);
  expect(localStorage.getItem('i18nextLng')).toMatch(/^en/);
  expect(screen.getByRole('combobox', { name: 'Language' })).toHaveValue('en');
});
