import { useState } from 'react';

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

interface Provider {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'error';
  url: string;
  lastUpdated: string;
}

const Switch = ({
  checked,
  onCheckedChange,
  disabled = false,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
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

const mockProviders: Provider[] = [
  {
    id: '1',
    name: 'OpenAI',
    status: 'active',
    url: 'https://api.openai.com/v1',
    lastUpdated: '2024-03-09 15:30:00',
  },
  {
    id: '2',
    name: 'Google AI',
    status: 'inactive',
    url: 'https://generativelanguage.googleapis.com/v1',
    lastUpdated: '2024-03-08 10:15:00',
  },
  {
    id: '3',
    name: 'Anthropic',
    status: 'error',
    url: 'https://api.anthropic.com/v1',
    lastUpdated: '2024-03-07 08:45:00',
  },
];

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  error: 'bg-red-100 text-red-800',
};

const statusText = {
  active: '활성',
  inactive: '비활성',
  error: '오류',
};

const ProviderSetting = () => {
  const [providers, setProviders] = useState<Provider[]>(mockProviders);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editUrl, setEditUrl] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'inactive'>('active');
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [newProvider, setNewProvider] = useState({
    name: '',
    description: '',
    url: '',
    status: 'active' as 'active' | 'inactive',
  });

  const handleCardClick = (provider: Provider) => {
    setSelectedProvider(provider);
    setEditName(provider.name);
    setEditDescription(provider.description || '');
    setEditUrl(provider.url);
    setEditStatus(provider.status === 'error' ? 'inactive' : provider.status);
    setIsDialogOpen(true);
  };

  const handleManualUpdate = (providerId: string) => {
    setProviders((prev) =>
      prev.map((p) =>
        p.id === providerId ? { ...p, lastUpdated: new Date().toLocaleString('ko-KR') } : p,
      ),
    );
  };

  const handleApply = () => {
    if (selectedProvider) {
      setProviders((prev) =>
        prev.map((p) =>
          p.id === selectedProvider.id
            ? {
                ...p,
                name: editName,
                description: editDescription,
                url: editUrl,
                status: editStatus,
                lastUpdated: new Date().toLocaleString('ko-KR'),
              }
            : p,
        ),
      );
      setIsDialogOpen(false);
      setSelectedProvider(null);
      setEditName('');
      setEditDescription('');
      setEditUrl('');
      setEditStatus('active');
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setSelectedProvider(null);
    setEditName('');
    setEditDescription('');
    setEditUrl('');
    setEditStatus('active');
  };

  const handleAddProvider = () => {
    if (newProvider.name && newProvider.url) {
      const provider: Provider = {
        id: Date.now().toString(),
        name: newProvider.name,
        description: newProvider.description,
        url: newProvider.url,
        status: newProvider.status,
        lastUpdated: new Date().toLocaleString('ko-KR'),
      };
      setProviders((prev) => [...prev, provider]);
      setNewProvider({
        name: '',
        description: '',
        url: '',
        status: 'active',
      });
      setIsAddDialogOpen(false);
    }
  };

  const handleAddCancel = () => {
    setNewProvider({
      name: '',
      description: '',
      url: '',
      status: 'active',
    });
    setIsAddDialogOpen(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">제공자 설정</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>제공자 추가</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {providers.map((provider) => (
          <Card
            key={provider.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => handleCardClick(provider)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{provider.name}</CardTitle>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[provider.status]}`}
                >
                  {statusText[provider.status]}
                </span>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-muted-foreground text-sm">URL</p>
                  <p className="truncate font-mono text-sm">{provider.url}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">업데이트 시기</p>
                  <p className="text-sm">{provider.lastUpdated}</p>
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
                  handleManualUpdate(provider.id);
                }}
              >
                수동 업데이트
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                value={newProvider.url}
                onChange={(e) => setNewProvider((prev) => ({ ...prev, url: e.target.value }))}
                placeholder="제공자 URL을 입력하세요"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">상태</label>
              <div className="flex items-center space-x-3">
                <span className="text-muted-foreground text-sm">비활성</span>
                <Switch
                  checked={newProvider.status === 'active'}
                  onCheckedChange={(checked) =>
                    setNewProvider((prev) => ({ ...prev, status: checked ? 'active' : 'inactive' }))
                  }
                />
                <span className="text-muted-foreground text-sm">활성</span>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleAddCancel}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleAddProvider}>등록</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex w-full items-center justify-between gap-2">
              {selectedProvider && (
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[selectedProvider.status]}`}
                >
                  {statusText[selectedProvider.status]}
                </span>
              )}
              <AlertDialogTitle className="text-lg">{selectedProvider?.name}</AlertDialogTitle>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => console.log('remove provider')}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">이름</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="제공자 이름을 입력하세요"
              />
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
                  checked={editStatus === 'active'}
                  onCheckedChange={(checked) => setEditStatus(checked ? 'active' : 'inactive')}
                />
                <span className="text-muted-foreground text-sm">활성</span>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleApply}>적용</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProviderSetting;
