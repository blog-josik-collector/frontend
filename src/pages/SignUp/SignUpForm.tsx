import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { handleApiError } from '@/services/api';
import { useSignUp } from '@/stores/users';

export function SignupForm({ className, ...props }: React.ComponentProps<'div'>) {
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
    const introduction = String(formData.get('introduction') ?? '').trim();

    if (!nickname || !loginId || !password || !passwordConfirm) {
      setError('필수 항목을 모두 입력해 주세요.');
      return;
    }

    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    signUp.mutate(
      {
        login_id: loginId,
        password,
        password_confirm: passwordConfirm,
        nickname,
        introduction,
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
          <CardTitle className="text-xl">회원가입</CardTitle>
          <CardDescription>계정 정보를 입력해 주세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="nickname">닉네임</FieldLabel>
                <Input
                  id="nickname"
                  name="nickname"
                  type="text"
                  placeholder="닉네임"
                  required
                  disabled={signUp.isPending}
                  onChange={() => {
                    if (error) setError('');
                  }}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="loginId">아이디</FieldLabel>
                <Input
                  id="loginId"
                  name="loginId"
                  type="text"
                  placeholder="아이디"
                  required
                  disabled={signUp.isPending}
                  onChange={() => {
                    if (error) setError('');
                  }}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="introduction">자기소개</FieldLabel>
                <Textarea
                  id="introduction"
                  name="introduction"
                  placeholder="자기소개"
                  disabled={signUp.isPending}
                />
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">비밀번호</FieldLabel>
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
                    <FieldLabel htmlFor="passwordConfirm">비밀번호 확인</FieldLabel>
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
                <FieldDescription>비밀번호는 8자 이상이어야 합니다.</FieldDescription>
                <FieldError errors={error ? [{ message: error }] : undefined} />
              </Field>
              <Field>
                <Button type="submit" disabled={signUp.isPending}>
                  {signUp.isPending ? '가입 중...' : '회원가입'}
                </Button>
                <FieldDescription className="text-center">
                  이미 계정이 있으신가요? <a href="/signin">로그인</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
