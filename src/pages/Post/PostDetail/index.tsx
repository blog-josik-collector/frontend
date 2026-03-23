import { useState } from 'react';

import {
  Bookmark,
  Calendar,
  ChevronDown,
  ChevronRight,
  Flag,
  Heart,
  MessageCircle,
  Send,
  Siren,
  User,
} from 'lucide-react';

import { useLocation } from 'react-router';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ButtonGroup, ButtonGroupSeparator } from '@/components/ui/button-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  likes: number;
  replies?: Comment[];
}

interface PostData {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  isBookmarked: boolean;
  comments: Comment[];
}

const PostDetail = () => {
  const location = useLocation();
  const postId = new URLSearchParams(location.search).get('post-id') ?? '';

  // Mock data - 실제로는 API를 통해 데이터를 가져와야 합니다
  const [post, setPost] = useState<PostData>({
    id: postId,
    title: '블로그 포스트 제목',
    content: `여기는 블로그 포스트의 본문 내용입니다. 
      
이곳에 상세한 내용이 표시됩니다. 마크다운 형식이나 HTML 형식의 내용을 렌더링할 수 있습니다.

여러 줄에 걸쳐서 내용이 표시되며, 사용자가 작성한 전체 내용을 보여줍니다.

이미지나 다른 미디어도 포함될 수 있습니다.`,
    createdAt: '2024-03-01',
    likes: 42,
    isLiked: false,
    isBookmarked: false,
    comments: [
      {
        id: '1',
        author: '댓글 작성자1',
        content: '첫 번째 댓글입니다.',
        createdAt: '2024-03-01',
        likes: 5,
        replies: [
          {
            id: '1-1',
            author: '대댓글 작성자1',
            content: '@댓글 작성자1 첫 번째 댓글에 대한 대댓글입니다.',
            createdAt: '2024-03-02',
            likes: 2,
          },
          {
            id: '1-2',
            author: '대댓글 작성자2',
            content: '@댓글 작성자1 다른 대댓글입니다.',
            createdAt: '2024-03-03',
            likes: 1,
          },
        ],
      },
      {
        id: '2',
        author: '댓글 작성자2',
        content: '두 번째 댓글입니다. 좋은 글이네요!',
        createdAt: '2024-03-02',
        likes: 3,
        replies: [],
      },
    ],
  });

  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(post.comments);
  const [isReportMenuOpen, setIsReportMenuOpen] = useState(false);
  const [isOtherReportOpen, setIsOtherReportOpen] = useState(false);
  const [otherReportContent, setOtherReportContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleLike = () => {
    setPost((prev) => ({
      ...prev,
      isLiked: !prev.isLiked,
      likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
    }));
  };

  const handleBookmark = () => {
    setPost((prev) => ({
      ...prev,
      isBookmarked: !prev.isBookmarked,
    }));
  };

  const handleReport = (type: string) => {
    if (type === 'post-error' || type === 'link-error') {
      alert(`${type === 'post-error' ? '포스트 오류' : '링크 오류'} 신고가 접수되었습니다.`);
      setIsReportMenuOpen(false);
    } else if (type === 'other') {
      setIsOtherReportOpen(true);
      setIsReportMenuOpen(false);
    }
  };

  const handleOtherReportSubmit = () => {
    if (otherReportContent.trim()) {
      alert('기타 신고가 접수되었습니다.');
      setOtherReportContent('');
      setIsOtherReportOpen(false);
    }
  };

  const [openCommentReportMenuIds, setOpenCommentReportMenuIds] = useState<string[]>([]);

  const handleCommentReport = (type: 'gov' | 'sex' | 'other') => {
    if (type === 'gov' || type === 'sex') {
      alert(`${type === 'gov' ? '정치' : '성인'} 신고가 접수되었습니다.`);
    } else if (type === 'other') {
      setIsOtherReportOpen(true);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        author: '현재 사용자',
        content: newComment,
        createdAt: new Date().toISOString().split('T')[0],
        likes: 0,
        replies: [],
      };
      setComments((prev) => [comment, ...prev]);
      setNewComment('');
    }
  };

  const handleReplySubmit = (e: React.FormEvent, parentId: string, parentAuthor: string) => {
    e.preventDefault();
    if (replyContent.trim()) {
      const reply: Comment = {
        id: `${parentId}-${Date.now()}`,
        author: '현재 사용자',
        content: `@${parentAuthor} ${replyContent}`,
        createdAt: new Date().toISOString().split('T')[0],
        likes: 0,
        replies: [],
      };

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === parentId
            ? { ...comment, replies: [...(comment.replies || []), reply] }
            : comment,
        ),
      );

      setReplyContent('');
      setReplyingTo(null);
    }
  };

  const handleCommentLike = (commentId: string) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId ? { ...comment, likes: comment.likes + 1 } : comment,
      ),
    );
  };

  if (postId === '') {
    return <div>포스트를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* 포스트 헤더 */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <CardTitle className="text-2xl font-bold">{post.title}</CardTitle>

            <div className="text-muted-foreground flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="size-4" />
                <span>{post.createdAt}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 본문 */}
          <div className="prose prose-gray max-w-none whitespace-pre-wrap">{post.content}</div>

          <Separator />

          <Button>본문으로 이동하기</Button>
          <Separator />

          {/* 액션 버튼 */}
          <div className="flex items-center gap-4">
            <Button
              variant={post.isLiked ? 'default' : 'outline'}
              size="sm"
              onClick={handleLike}
              className="flex items-center gap-2"
            >
              <Heart className={`size-4 ${post.isLiked ? 'fill-current' : ''}`} />
              <span>{post.likes}</span>
            </Button>

            <Button
              variant={post.isBookmarked ? 'default' : 'outline'}
              size="sm"
              onClick={handleBookmark}
              className="flex items-center gap-2"
            >
              <Bookmark className={`size-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
              <span>즐겨찾기</span>
            </Button>

            {/* 신고 버튼 그룹 */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReportMenuOpen(!isReportMenuOpen)}
                className="flex items-center gap-2"
              >
                <Flag className="size-4" />
                <span>신고</span>
                <ChevronRight
                  className={`size-3 transition-transform ${isReportMenuOpen ? 'rotate-180' : ''}`}
                />
              </Button>

              {isReportMenuOpen && (
                <ButtonGroup>
                  <Button variant="outline" size="sm" onClick={() => handleReport('post-error')}>
                    포스트 오류
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleReport('link-error')}>
                    링크 오류
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleReport('other')}>
                    기타 신고
                  </Button>
                </ButtonGroup>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 기타 신고 폼 다이얼로그 */}
      <AlertDialog open={isOtherReportOpen} onOpenChange={setIsOtherReportOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>기타 신고</AlertDialogTitle>
            <AlertDialogDescription>
              신고하려는 내용을 구체적으로 작성해주세요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <textarea
              value={otherReportContent}
              onChange={(e) => setOtherReportContent(e.target.value)}
              placeholder="신고 내용을 입력하세요..."
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-25 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleOtherReportSubmit}
              disabled={!otherReportContent.trim()}
            >
              신고하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 댓글 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="size-5" />
            댓글 ({comments.length})
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 댓글 작성 */}
          <form onSubmit={handleCommentSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="댓글을 작성하세요..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!newComment.trim()}>
                <Send className="size-4" />
              </Button>
            </div>
          </form>

          <Separator />

          {/* 댓글 목록 */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                    <User className="size-4" />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{comment.author}</span>
                      <span className="text-muted-foreground text-xs">{comment.createdAt}</span>
                    </div>

                    <p className="text-sm">{comment.content}</p>
                    <ButtonGroup>
                      <ButtonGroup>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() =>
                            setReplyingTo(replyingTo === comment.id ? null : comment.id)
                          }
                          className="flex items-center gap-1"
                        >
                          <MessageCircle className="size-3" />
                          <span className="text-xs">답글</span>
                        </Button>
                      </ButtonGroup>
                      <ButtonGroup>
                        <Button
                          variant={
                            openCommentReportMenuIds.includes(comment.id) ? 'default' : 'ghost'
                          }
                          size="xs"
                          onClick={() => {
                            if (openCommentReportMenuIds.includes(comment.id)) {
                              setOpenCommentReportMenuIds(
                                openCommentReportMenuIds.filter((id) => id !== comment.id),
                              );
                            } else {
                              setOpenCommentReportMenuIds([
                                ...openCommentReportMenuIds,
                                comment.id,
                              ]);
                            }
                          }}
                          className="flex items-center gap-1"
                        >
                          <Siren className="size-3" />
                        </Button>
                      </ButtonGroup>
                      {openCommentReportMenuIds.includes(comment.id) && (
                        <ButtonGroup>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleCommentReport('gov')}
                            className="flex items-center gap-1"
                          >
                            정치
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleCommentReport('sex')}
                            className="flex items-center gap-1"
                          >
                            성인
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleCommentReport('other')}
                            className="flex items-center gap-1"
                          >
                            기타
                          </Button>
                        </ButtonGroup>
                      )}
                    </ButtonGroup>
                  </div>
                </div>

                {/* 대댓글 작성 폼 */}
                {replyingTo === comment.id && (
                  <div className="ml-11 space-y-2">
                    <form
                      onSubmit={(e) => handleReplySubmit(e, comment.id, comment.author)}
                      className="flex gap-2"
                    >
                      <Input
                        placeholder="대댓글을 작성하세요..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" disabled={!replyContent.trim()} size="sm">
                        <Send className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent('');
                        }}
                      >
                        취소
                      </Button>
                    </form>
                  </div>
                )}

                {/* 대댓글 목록 */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-11 space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="bg-muted flex h-6 w-6 items-center justify-center rounded-full">
                            <User className="size-3" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">{reply.author}</span>
                              <span className="text-muted-foreground text-xs">
                                {reply.createdAt}
                              </span>
                            </div>
                            <p className="text-xs">{reply.content}</p>
                            <ButtonGroup>
                              <ButtonGroup>
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() =>
                                    setReplyingTo(replyingTo === reply.id ? null : reply.id)
                                  }
                                  className="flex items-center gap-1"
                                >
                                  <MessageCircle className="size-2" />
                                  <span className="text-xs">답글</span>
                                </Button>
                              </ButtonGroup>
                              <ButtonGroup>
                                <Button
                                  variant={
                                    openCommentReportMenuIds.includes(reply.id)
                                      ? 'default'
                                      : 'ghost'
                                  }
                                  size="xs"
                                  onClick={() => {
                                    if (openCommentReportMenuIds.includes(reply.id)) {
                                      setOpenCommentReportMenuIds(
                                        openCommentReportMenuIds.filter((id) => id !== reply.id),
                                      );
                                    } else {
                                      setOpenCommentReportMenuIds([
                                        ...openCommentReportMenuIds,
                                        reply.id,
                                      ]);
                                    }
                                  }}
                                  className="flex items-center gap-1"
                                >
                                  <Siren className="size-2" />
                                </Button>
                              </ButtonGroup>
                              {openCommentReportMenuIds.includes(reply.id) && (
                                <ButtonGroup>
                                  <Button
                                    variant="outline"
                                    size="xs"
                                    onClick={() => handleCommentReport('gov')}
                                    className="flex items-center gap-1"
                                  >
                                    정치
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="xs"
                                    onClick={() => handleCommentReport('sex')}
                                    className="flex items-center gap-1"
                                  >
                                    성인
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="xs"
                                    onClick={() => handleCommentReport('other')}
                                    className="flex items-center gap-1"
                                  >
                                    기타
                                  </Button>
                                </ButtonGroup>
                              )}
                            </ButtonGroup>
                          </div>
                        </div>

                        {/* 대댓글의 대댓글 작성 폼 */}
                        {replyingTo === reply.id && (
                          <div className="ml-9 space-y-2">
                            <form
                              onSubmit={(e) => handleReplySubmit(e, comment.id, reply.author)}
                              className="flex gap-2"
                            >
                              <Input
                                placeholder="대댓글을 작성하세요..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                className="flex-1"
                              />
                              <Button type="submit" disabled={!replyContent.trim()} size="sm">
                                <Send className="size-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyContent('');
                                }}
                              >
                                취소
                              </Button>
                            </form>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {comment.id !== comments[comments.length - 1].id && <Separator className="ml-11" />}
              </div>
            ))}

            {comments.length === 0 && (
              <div className="text-muted-foreground py-8 text-center">
                아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostDetail;
