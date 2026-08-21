import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { handleApiError } from '@/services/api';
import { useLogin } from '@/stores/auth/authStore';

export function SignInForm({ className, ...props }: React.ComponentProps<'div'>) {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const login = useLogin();
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const loginId = String(formData.get('loginId') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    if (!loginId || !password) {
      setError(t('missingCredentials'));
      return;
    }
    const encodePassword = encodeURIComponent(password);

    login.mutate(
      {
        login_id: loginId,
        password: encodePassword,
      },
      {
        onSuccess: () => {
          setError('');
          navigate('/', { replace: true });
        },
        onError: (loginError) => {
          setError(handleApiError(loginError).message);
        },
      },
    );
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{t('signInTitle')}</CardTitle>
          <CardDescription>{t('signInDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="loginId">{t('loginId')}</FieldLabel>
                <Input
                  id="loginId"
                  name="loginId"
                  type="text"
                  placeholder={t('loginId')}
                  required
                  disabled={login.isPending}
                  onChange={() => {
                    if (error) setError('');
                  }}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">{t('password')}</FieldLabel>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  disabled={login.isPending}
                  onChange={() => {
                    if (error) setError('');
                  }}
                />
                <FieldError errors={error ? [{ message: error }] : undefined} />
              </Field>
              <Field>
                <Button type="submit" disabled={login.isPending}>
                  {login.isPending ? t('loginPending') : t('login')}
                </Button>
                <FieldDescription className="text-center">
                  {t('noAccount')} <a href="/signup">{t('signUpLink')}</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
