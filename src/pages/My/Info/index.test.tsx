import { MemoryRouter } from 'react-router';

import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MyInfo from './index';

const { updateMeMock, updatePasswordMock } = vi.hoisted(() => ({
  updateMeMock: vi.fn(),
  updatePasswordMock: vi.fn(),
}));

vi.mock('@/stores/users', () => ({
  useDeleteMe: () => ({ isPending: false, mutate: vi.fn() }),
  useMe: () => ({
    data: { nickname: 'tester', userId: 'user-1', userType: 'USER' },
    isLoading: false,
  }),
  useUpdateMe: () => ({ isPending: false, mutate: updateMeMock }),
  useUpdateMyPassword: () => ({ isPending: false, mutate: updatePasswordMock }),
}));

beforeEach(() => {
  updateMeMock.mockReset();
  updatePasswordMock.mockReset();
});

afterEach(cleanup);

it('keeps password confirmation local and omits removed profile fields', async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <MyInfo />
    </MemoryRouter>,
  );

  expect(screen.queryByText('자기소개')).not.toBeInTheDocument();
  expect(screen.queryByText('Google 연동')).not.toBeInTheDocument();

  await user.type(screen.getByLabelText('현재 비밀번호'), 'current-password');
  await user.type(screen.getByLabelText('새 비밀번호', { exact: true }), 'new-password');
  await user.type(screen.getByLabelText('새 비밀번호 다시 입력'), 'different-password');
  await user.click(screen.getByRole('button', { name: '비밀번호 변경' }));

  expect(updatePasswordMock).not.toHaveBeenCalled();
  expect(screen.getByText('새 비밀번호가 일치하지 않습니다.')).toBeInTheDocument();

  await user.clear(screen.getByLabelText('새 비밀번호 다시 입력'));
  await user.type(screen.getByLabelText('새 비밀번호 다시 입력'), 'new-password');
  await user.click(screen.getByRole('button', { name: '비밀번호 변경' }));

  expect(updatePasswordMock).toHaveBeenCalledWith(
    {
      new_password: 'bmV3LXBhc3N3b3Jk',
      password: 'Y3VycmVudC1wYXNzd29yZA==',
    },
    expect.any(Object),
  );
});

it('shows a prominent success state after saving the profile', async () => {
  const user = userEvent.setup();
  updateMeMock.mockImplementation((_body, options) => options.onSuccess());

  render(
    <MemoryRouter>
      <MyInfo />
    </MemoryRouter>,
  );

  await user.clear(screen.getByLabelText(/닉네임/));
  await user.type(screen.getByLabelText(/닉네임/), 'changed-tester');
  await user.click(screen.getByRole('button', { name: '프로필 저장' }));

  expect(screen.getByRole('status')).toHaveTextContent('프로필이 저장되었습니다.');
  expect(screen.getByRole('button', { name: '저장됨' })).toHaveClass(
    'bg-emerald-600',
    'disabled:opacity-100',
  );
});

it('shows a prominent success state after changing the password', async () => {
  const user = userEvent.setup();
  updatePasswordMock.mockImplementation((_body, options) => options.onSuccess());

  render(
    <MemoryRouter>
      <MyInfo />
    </MemoryRouter>,
  );

  await user.type(screen.getByLabelText('현재 비밀번호'), 'current-password');
  await user.type(screen.getByLabelText('새 비밀번호', { exact: true }), 'new-password');
  await user.type(screen.getByLabelText('새 비밀번호 다시 입력'), 'new-password');
  await user.click(screen.getByRole('button', { name: '비밀번호 변경' }));

  expect(screen.getByRole('status')).toHaveTextContent('비밀번호가 변경되었습니다.');
  expect(screen.getByRole('button', { name: '변경됨' })).toHaveClass('bg-emerald-600');
});
