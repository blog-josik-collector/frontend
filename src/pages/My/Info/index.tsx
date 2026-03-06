import { useState } from 'react';
import { CheckCircle2, TriangleAlert, XCircle } from 'lucide-react';

import ProtectedRoute from '@/components/ProtectedRoute';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel, FieldTitle } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const MOCK_USER = {
  id: 'josik_user',
  googleLinked: true,
  googleEmail: 'josik@gmail.com',
  nickname: '조식',
  bio: '안녕하세요, 조식입니다.',
};

interface PasswordForm {
  current: string;
  next: string;
  confirm: string;
}

interface ProfileForm {
  nickname: string;
  bio: string;
}

interface PasswordErrors {
  current?: string;
  next?: string;
  confirm?: string;
}

const MyInfo = () => {
  const [profile, setProfile] = useState<ProfileForm>({
    nickname: MOCK_USER.nickname,
    bio: MOCK_USER.bio,
  });

  const [passwords, setPasswords] = useState<PasswordForm>({
    current: '',
    next: '',
    confirm: '',
  });

  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletePasswordError, setDeletePasswordError] = useState('');

  const validatePasswords = (): boolean => {
    const errors: PasswordErrors = {};
    if (!passwords.current) errors.current = '현재 비밀번호를 입력해 주세요.';
    if (!passwords.next) {
      errors.next = '새 비밀번호를 입력해 주세요.';
    } else if (passwords.next.length < 8) {
      errors.next = '비밀번호는 8자 이상이어야 합니다.';
    }
    if (!passwords.confirm) {
      errors.confirm = '새 비밀번호를 다시 입력해 주세요.';
    } else if (passwords.next !== passwords.confirm) {
      errors.confirm = '새 비밀번호가 일치하지 않습니다.';
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswords()) return;
    setPasswords({ current: '', next: '', confirm: '' });
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 2000);
  };

  const handleDeleteAccount = () => {
    if (!deletePassword) {
      setDeletePasswordError('비밀번호를 입력해 주세요.');
      return;
    }
    // TODO: API 비밀번호 검증 후 계정 삭제 처리
    setDeleteDialogOpen(false);
  };

  const handleDeleteDialogOpenChange = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) {
      setDeletePassword('');
      setDeletePasswordError('');
    }
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
        <div>
          <h1 className="text-xl font-semibold">회원 정보</h1>
          <p className="text-muted-foreground mt-1 text-sm">계정 정보를 확인하고 수정할 수 있습니다.</p>
        </div>

        {/* 계정 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>계정 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field orientation="horizontal">
                <FieldTitle className="w-28 shrink-0">아이디</FieldTitle>
                <span className="text-foreground text-sm font-medium">{MOCK_USER.id}</span>
              </Field>
              <Field orientation="horizontal">
                <FieldTitle className="w-28 shrink-0">Google 연동</FieldTitle>
                <div className="flex items-center gap-2">
                  {MOCK_USER.googleLinked ? (
                    <>
                      <CheckCircle2 className="text-primary h-4 w-4 shrink-0" />
                      <span className="text-sm font-medium">연동됨</span>
                      <span className="text-muted-foreground text-sm">({MOCK_USER.googleEmail})</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="text-muted-foreground h-4 w-4 shrink-0" />
                      <span className="text-muted-foreground text-sm">연동되지 않음</span>
                    </>
                  )}
                </div>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* 프로필 수정 */}
        <Card>
          <CardHeader>
            <CardTitle>프로필</CardTitle>
            <CardDescription>닉네임과 자기소개를 수정할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="nickname">닉네임</FieldLabel>
                  <Input
                    id="nickname"
                    type="text"
                    placeholder="닉네임을 입력하세요"
                    value={profile.nickname}
                    onChange={(e) => setProfile((prev) => ({ ...prev, nickname: e.target.value }))}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="bio">자기소개</FieldLabel>
                  <textarea
                    id="bio"
                    placeholder="자기소개를 입력하세요"
                    rows={4}
                    value={profile.bio}
                    onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                    className={cn(
                      'bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 placeholder:text-muted-foreground w-full min-w-0 resize-none rounded-2xl border px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-[3px]',
                    )}
                  />
                </Field>
                <Field>
                  <Button type="submit" className="self-end">
                    {profileSaved ? '저장됨 ✓' : '프로필 저장'}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        {/* 비밀번호 변경 */}
        <Card>
          <CardHeader>
            <CardTitle>비밀번호 변경</CardTitle>
            <CardDescription>현재 비밀번호를 확인 후 새 비밀번호로 변경합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="current-password">현재 비밀번호</FieldLabel>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="현재 비밀번호"
                    value={passwords.current}
                    aria-invalid={!!passwordErrors.current}
                    onChange={(e) => {
                      setPasswords((prev) => ({ ...prev, current: e.target.value }));
                      if (passwordErrors.current) setPasswordErrors((prev) => ({ ...prev, current: undefined }));
                    }}
                  />
                  <FieldError errors={passwordErrors.current ? [{ message: passwordErrors.current }] : undefined} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="new-password">새 비밀번호</FieldLabel>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="새 비밀번호 (8자 이상)"
                    value={passwords.next}
                    aria-invalid={!!passwordErrors.next}
                    onChange={(e) => {
                      setPasswords((prev) => ({ ...prev, next: e.target.value }));
                      if (passwordErrors.next) setPasswordErrors((prev) => ({ ...prev, next: undefined }));
                    }}
                  />
                  <FieldError errors={passwordErrors.next ? [{ message: passwordErrors.next }] : undefined} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirm-password">새 비밀번호 다시 입력</FieldLabel>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="새 비밀번호 확인"
                    value={passwords.confirm}
                    aria-invalid={!!passwordErrors.confirm}
                    onChange={(e) => {
                      setPasswords((prev) => ({ ...prev, confirm: e.target.value }));
                      if (passwordErrors.confirm) setPasswordErrors((prev) => ({ ...prev, confirm: undefined }));
                    }}
                  />
                  <FieldError errors={passwordErrors.confirm ? [{ message: passwordErrors.confirm }] : undefined} />
                </Field>
                <Field>
                  <Button type="submit" className="self-end">
                    {passwordSaved ? '변경됨 ✓' : '비밀번호 변경'}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
        {/* 회원 탈퇴 */}
        <div className="border-t pt-2">
          <AlertDialog open={deleteDialogOpen} onOpenChange={handleDeleteDialogOpenChange}>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full">
                탈퇴하기
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>정말 탈퇴하시겠습니까?</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="flex flex-col gap-3">
                    <div className="bg-destructive/10 border-destructive/20 flex items-start gap-2 rounded-xl border px-4 py-3">
                      <TriangleAlert className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
                      <p className="text-destructive text-sm leading-relaxed">
                        탈퇴 시 작성한 게시글, 댓글, 즐겨찾기 등 모든 데이터가 <strong>영구적으로 삭제</strong>되며
                        복구할 수 없습니다.
                      </p>
                    </div>
                    <p className="text-muted-foreground text-sm">계속하려면 현재 비밀번호를 입력해 주세요.</p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Field>
                <FieldLabel htmlFor="delete-password">비밀번호</FieldLabel>
                <Input
                  id="delete-password"
                  type="password"
                  placeholder="현재 비밀번호 입력"
                  value={deletePassword}
                  aria-invalid={!!deletePasswordError}
                  onChange={(e) => {
                    setDeletePassword(e.target.value);
                    if (deletePasswordError) setDeletePasswordError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleDeleteAccount();
                  }}
                />
                <FieldError errors={deletePasswordError ? [{ message: deletePasswordError }] : undefined} />
              </Field>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  탈퇴하기
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default MyInfo;
