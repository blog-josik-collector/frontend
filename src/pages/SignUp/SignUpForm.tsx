import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { handleApiError } from '@/services/api';
import { useSignUp } from '@/stores/users';

export function SignupForm({ className, ...props }: React.ComponentProps<'div'>) {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const signUp = useSignUp();
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const nickname = String(formData.get('nickname') ?? '').trim();
    const loginId = String(formData.get('loginId') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const passwordConfirm = String(formData.get('passwordConfirm') ?? '');

    if (!nickname || !loginId || !password || !passwordConfirm) {
      setError(t('requiredFields'));
      return;
    }

    if (password.length < 8) {
      setError(t('passwordMinLength'));
      return;
    }

    if (password !== passwordConfirm) {
      setError(t('passwordMismatch'));
      return;
    }

    const encodePassword = btoa(password);
    const encodePasswordConfirm = btoa(passwordConfirm);

    signUp.mutate(
      {
        login_id: loginId,
        password: encodePassword,
        password_confirm: encodePasswordConfirm,
        nickname,
      },
      {
        onSuccess: () => {
          setError('');
          navigate('/signin', { replace: true });
        },
        onError: (signUpError) => {
          setError(handleApiError(signUpError).message);
        },
      },
    );
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t('signUpTitle')}</CardTitle>
          <CardDescription>{t('signUpDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="nickname">{t('nickname')}</FieldLabel>
                <Input
                  id="nickname"
                  name="nickname"
                  type="text"
                  placeholder={t('nickname')}
                  required
                  disabled={signUp.isPending}
                  onChange={() => {
                    if (error) setError('');
                  }}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="loginId">{t('loginId')}</FieldLabel>
                <Input
                  id="loginId"
                  name="loginId"
                  type="text"
                  placeholder={t('loginId')}
                  required
                  disabled={signUp.isPending}
                  onChange={() => {
                    if (error) setError('');
                  }}
                />
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">{t('password')}</FieldLabel>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      disabled={signUp.isPending}
                      onChange={() => {
                        if (error) setError('');
                      }}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="passwordConfirm">{t('passwordConfirm')}</FieldLabel>
                    <Input
                      id="passwordConfirm"
                      name="passwordConfirm"
                      type="password"
                      required
                      disabled={signUp.isPending}
                      onChange={() => {
                        if (error) setError('');
                      }}
                    />
                  </Field>
                </Field>
                <FieldDescription>{t('passwordMinLengthHint')}</FieldDescription>
                <FieldError errors={error ? [{ message: error }] : undefined} />
              </Field>
              <Field>
                <Button type="submit" disabled={signUp.isPending}>
                  {signUp.isPending ? t('signUpPending') : t('signUpSubmit')}
                </Button>
                <FieldDescription className="text-center">
                  {t('hasAccount')} <a href="/signin">{t('signInLink')}</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
