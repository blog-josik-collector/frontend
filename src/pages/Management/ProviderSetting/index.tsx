import { type Dispatch, useState } from 'react';

import { TrashIcon } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  type CreateProviderRequestDto,
  type Provider,
  useCreateProvider,
  useDeleteProvider,
  useProviders,
  useUpdateProvider,
} from '@/stores/collect/providersStore';

const Switch = ({
  checked,
  onCheckedChange,
  disabled = false,
}: {
  checked: boolean;
  onCheckedChange: Dispatch<boolean>;
  disabled?: boolean;
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={`focus-visible:ring-ring relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${checked ? 'bg-primary' : 'bg-input'} `}
      onClick={() => onCheckedChange(!checked)}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'} `}
      />
    </button>
  );
};

const statusColors: Record<'active' | 'inactive', string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
};

const statusText: Record<'active' | 'inactive', string> = {
  active: '활성',
  inactive: '비활성',
};

const initialProvider: CreateProviderRequestDto = {
  name: '',
  description: '',
  base_url: '',
  is_used: true,
};

const formatDate = (timestamp: number) =>
  new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp);

const ProviderSetting = () => {
  const { data, isError, isLoading } = useProviders();
  const createProvider = useCreateProvider();
  const updateProvider = useUpdateProvider();
  const deleteProvider = useDeleteProvider();

  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editUrl, setEditUrl] = useState('');
  const [editIsUsed, setEditIsUsed] = useState(true);
  const [editDescription, setEditDescription] = useState('');
  const [newProvider, setNewProvider] = useState<CreateProviderRequestDto>(initialProvider);

  const providers = data?.items ?? [];
  const isMutating =
    createProvider.isPending || updateProvider.isPending || deleteProvider.isPending;

  const handleCardClick = (provider: Provider) => {
    updateProvider.reset();
    setSelectedProvider(provider);
    setEditDescription(provider.description);
    setEditUrl(provider.baseUrl);
    setEditIsUsed(provider.isUsed);
    setIsDialogOpen(true);
  };

  const handleApply = () => {
    if (!selectedProvider || !editUrl.trim()) return;

    updateProvider.mutate(
      {
        providerId: selectedProvider.providerId,
        body: {
          base_url: editUrl.trim(),
          description: editDescription.trim(),
          is_used: editIsUsed,
        },
      },
      { onSuccess: handleCancel },
    );
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setSelectedProvider(null);
    setEditDescription('');
    setEditUrl('');
    setEditIsUsed(true);
  };

  const handleAddProvider = () => {
    if (!newProvider.name.trim() || !newProvider.base_url.trim()) return;

    createProvider.mutate(
      {
        ...newProvider,
        name: newProvider.name.trim(),
        description: newProvider.description.trim(),
        base_url: newProvider.base_url.trim(),
      },
      {
        onSuccess: () => {
          setNewProvider(initialProvider);
          setIsAddDialogOpen(false);
        },
      },
    );
  };

  const handleAddCancel = () => {
    setNewProvider(initialProvider);
    setIsAddDialogOpen(false);
  };

  const handleDelete = () => {
    if (!selectedProvider) return;

    deleteProvider.mutate(
      { providerId: selectedProvider.providerId },
      {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          handleCancel();
        },
      },
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">제공자 설정</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>제공자 추가</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && (
          <p className="text-muted-foreground col-span-full py-12 text-center">
            제공자 목록을 불러오는 중입니다.
          </p>
        )}
        {isError && (
          <p className="text-destructive col-span-full py-12 text-center">
            제공자 목록을 불러오지 못했습니다.
          </p>
        )}
        {!isLoading && !isError && providers.length === 0 && (
          <p className="text-muted-foreground col-span-full py-12 text-center">
            등록된 제공자가 없습니다.
          </p>
        )}
        {providers.map((provider) => (
          <Card
            key={provider.providerId}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => handleCardClick(provider)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{provider.name}</CardTitle>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[provider.isUsed ? 'active' : 'inactive']}`}
                >
                  {statusText[provider.isUsed ? 'active' : 'inactive']}
                </span>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-muted-foreground text-sm">URL</p>
                  <p className="truncate font-mono text-sm">{provider.baseUrl}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">업데이트 시기</p>
                  <p className="text-sm">{formatDate(provider.updatedAt)}</p>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick(provider);
                }}
              >
                설정 변경
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          if (open) {
            createProvider.reset();
            setIsAddDialogOpen(true);
          } else {
            handleAddCancel();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>제공자 추가</AlertDialogTitle>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">이름</label>
              <Input
                value={newProvider.name}
                onChange={(e) => setNewProvider((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="제공자 이름을 입력하세요"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">설명</label>
              <Textarea
                value={newProvider.description}
                onChange={(e) =>
                  setNewProvider((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="제공자 설명을 입력하세요"
                rows={3}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">URL</label>
              <Input
                value={newProvider.base_url}
                onChange={(e) => setNewProvider((prev) => ({ ...prev, base_url: e.target.value }))}
                placeholder="제공자 URL을 입력하세요"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">상태</label>
              <div className="flex items-center space-x-3">
                <span className="text-muted-foreground text-sm">비활성</span>
                <Switch
                  checked={newProvider.is_used}
                  onCheckedChange={(checked) =>
                    setNewProvider((prev) => ({ ...prev, is_used: checked }))
                  }
                  disabled={createProvider.isPending}
                />
                <span className="text-muted-foreground text-sm">활성</span>
              </div>
            </div>
          </div>

          {createProvider.isError && (
            <p className="text-destructive text-sm">제공자를 등록하지 못했습니다.</p>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleAddCancel} disabled={createProvider.isPending}>
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleAddProvider();
              }}
              disabled={
                createProvider.isPending || !newProvider.name.trim() || !newProvider.base_url.trim()
              }
            >
              {createProvider.isPending ? '등록 중...' : '등록'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDialogOpen} onOpenChange={(open) => !open && handleCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex w-full items-center justify-between gap-2">
              {selectedProvider && (
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[selectedProvider.isUsed ? 'active' : 'inactive']}`}
                >
                  {statusText[selectedProvider.isUsed ? 'active' : 'inactive']}
                </span>
              )}
              <AlertDialogTitle className="text-lg">{selectedProvider?.name}</AlertDialogTitle>
              <Button
                variant="destructive"
                size="icon"
                disabled={isMutating || selectedProvider?.hasUsingCollectSource}
                onClick={() => {
                  deleteProvider.reset();
                  setIsDeleteDialogOpen(true);
                }}
              >
                <TrashIcon className="h-4 w-4" />
                <span className="sr-only">제공자 삭제</span>
              </Button>
            </div>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">이름</label>
              <Input value={selectedProvider?.name ?? ''} disabled />
              <p className="text-muted-foreground mt-1 text-xs">
                제공자 이름은 변경할 수 없습니다.
              </p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">설명</label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="제공자 설명을 입력하세요"
                rows={3}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">URL</label>
              <Input
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="제공자 URL을 입력하세요"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">상태</label>
              <div className="flex items-center space-x-3">
                <span className="text-muted-foreground text-sm">비활성</span>
                <Switch
                  checked={editIsUsed}
                  onCheckedChange={setEditIsUsed}
                  disabled={updateProvider.isPending}
                />
                <span className="text-muted-foreground text-sm">활성</span>
              </div>
            </div>
          </div>

          {selectedProvider?.hasUsingCollectSource && (
            <p className="text-muted-foreground text-sm">
              사용 중인 수집 소스가 있어 이 제공자는 삭제할 수 없습니다.
            </p>
          )}
          {updateProvider.isError && (
            <p className="text-destructive text-sm">제공자 설정을 변경하지 못했습니다.</p>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel} disabled={updateProvider.isPending}>
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleApply();
              }}
              disabled={updateProvider.isPending || !editUrl.trim()}
            >
              {updateProvider.isPending ? '적용 중...' : '적용'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>제공자 삭제</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-muted-foreground text-sm">
            {selectedProvider?.name} 제공자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </p>
          {deleteProvider.isError && (
            <p className="text-destructive text-sm">제공자를 삭제하지 못했습니다.</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteProvider.isPending}>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={(event) => {
                event.preventDefault();
                handleDelete();
              }}
              disabled={deleteProvider.isPending}
            >
              {deleteProvider.isPending ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProviderSetting;
