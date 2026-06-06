import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { handleApiError } from '@/services/api';
import { useLogin } from '@/stores/auth/authStore';

export function SignInForm({ className, ...props }: React.ComponentProps<'div'>) {
  const navigate = useNavigate();
  const login = useLogin();
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const loginId = String(formData.get('loginId') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    if (!loginId || !password) {
      setError('아이디와 비밀번호를 입력해 주세요.');
      return;
    }

    login.mutate(
      {
        login_id: loginId,
        password,
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
          <CardTitle>로그인</CardTitle>
          <CardDescription>아이디와 비밀번호를 입력해 주세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="loginId">아이디</FieldLabel>
                <Input
                  id="loginId"
                  name="loginId"
                  type="text"
                  placeholder="아이디"
                  required
                  disabled={login.isPending}
                  onChange={() => {
                    if (error) setError('');
                  }}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">비밀번호</FieldLabel>
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
                  {login.isPending ? '로그인 중...' : '로그인'}
                </Button>
                <FieldDescription className="text-center">
                  계정이 없으신가요? <a href="/signup">회원가입</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
