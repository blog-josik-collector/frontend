import type { ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';

import { render, type RenderOptions } from '@testing-library/react';

import i18n from '@/i18n';

export const renderWithI18n = (ui: ReactElement, options?: RenderOptions) => {
  void i18n.changeLanguage('ko');
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>, options);
};
