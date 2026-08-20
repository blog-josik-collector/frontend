import { beforeEach, expect, it, vi } from 'vitest';

const { createRootMock, renderMock, startMock } = vi.hoisted(() => ({
  createRootMock: vi.fn(),
  renderMock: vi.fn(),
  startMock: vi.fn(),
}));

vi.mock('react-dom/client', () => ({
  createRoot: createRootMock,
}));

vi.mock('./App.tsx', () => ({
  default: () => null,
}));

vi.mock('@mocks/browser', () => ({
  worker: { start: startMock },
}));

beforeEach(() => {
  vi.resetModules();
  createRootMock.mockReset();
  renderMock.mockReset();
  startMock.mockReset();
  createRootMock.mockReturnValue({ render: renderMock });
  document.body.innerHTML = '<div id="root"></div>';
});

it('waits for the mock worker before rendering the app in development', async () => {
  let finishStartingWorker: (() => void) | undefined;
  startMock.mockReturnValue(
    new Promise<void>((resolve) => {
      finishStartingWorker = resolve;
    }),
  );

  await import('./main');
  await vi.waitFor(() => expect(startMock).toHaveBeenCalledOnce());

  expect(renderMock).not.toHaveBeenCalled();

  finishStartingWorker?.();

  await vi.waitFor(() => expect(renderMock).toHaveBeenCalledOnce());
});
