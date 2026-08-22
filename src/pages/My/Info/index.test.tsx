import { MemoryRouter } from 'react-router';

import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MyInfo from './index';

const { updatePasswordMock } = vi.hoisted(() => ({ updatePasswordMock: vi.fn() }));

vi.mock('@/stores/users', () => ({
  useDeleteMe: () => ({ isPending: false, mutate: vi.fn() }),
  useMe: () => ({
    data: { nickname: 'tester', userId: 'user-1', userType: 'USER' },
    isLoading: false,
  }),
  useUpdateMe: () => ({ isPending: false, mutate: vi.fn() }),
  useUpdateMyPassword: () => ({ isPending: false, mutate: updatePasswordMock }),
}));

beforeEach(() => {
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
    { new_password: 'new-password', password: 'current-password' },
    expect.any(Object),
  );
});
