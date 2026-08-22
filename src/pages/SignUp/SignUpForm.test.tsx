import { MemoryRouter } from 'react-router';

import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SignupForm } from './SignUpForm';

const { mutateMock } = vi.hoisted(() => ({ mutateMock: vi.fn() }));

vi.mock('@/stores/users', () => ({
  useSignUp: () => ({ isPending: false, mutate: mutateMock }),
}));

beforeEach(() => {
  mutateMock.mockReset();
});

afterEach(cleanup);

it('submits the current signup DTO without an introduction field', async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <SignupForm />
    </MemoryRouter>,
  );

  expect(screen.queryByLabelText('자기소개')).not.toBeInTheDocument();

  await user.type(screen.getByLabelText('닉네임'), 'tester');
  await user.type(screen.getByLabelText('아이디'), 'tester@example.com');
  await user.type(screen.getByLabelText('비밀번호', { exact: true }), 'password');
  await user.type(screen.getByLabelText('비밀번호 확인'), 'password');
  await user.click(screen.getByRole('button', { name: '회원가입' }));

  expect(mutateMock).toHaveBeenCalledWith(
    {
      login_id: 'tester@example.com',
      nickname: 'tester',
      password: 'password',
      password_confirm: 'password',
    },
    expect.any(Object),
  );
});
