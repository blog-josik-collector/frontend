import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Bookmark,
  Calendar,
  ExternalLink,
  Eye,
  FileQuestion,
  Flag,
  Heart,
  MessageCircle,
  RefreshCw,
  Send,
  Siren,
  User,
} from 'lucide-react';

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
import { ButtonGroup } from '@/components/ui/button-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { type PostingComment } from '@/services/posting';
import { CommentReportReasonType, PostingReportReasonType } from '@/services/report';
import {
  usePostingBookmarkStore,
  usePostingCommentStore,
  usePostingDetailStore,
  usePostingLikeStore,
} from '@/stores/posting/postingStore';
import { useCreateCommentReport } from '@/stores/reports/commentReportsStore';
import { useCreatePostingReport } from '@/stores/reports/postingReportsStore';

const defaultPagination = 5;
const defaultReplyPagination = 5;
const pageBlockSize = 10;

type PendingReport =
  | { target: 'posting'; reasonType: PostingReportReasonType }
  | { target: 'comment'; commentId: string; reasonType: CommentReportReasonType };

const PostDetail = () => {
  const location = useLocation();
  const postId = new URLSearchParams(location.search).get('post-id') ?? '';

  const {
    postingDetailEntity,
    error: postingDetailError,
    fetchPostingDetail,
  } = usePostingDetailStore();
  const {
    postingComments,
    postingCommentReplies,
    replyLoading,
    fetchPostingComments,
    fetchPostingCommentReplies,
    createPostingComment,
    createPostingReply,
  } = usePostingCommentStore();
  const { loading: postingLikeLoading, likePosting, unlikePosting } = usePostingLikeStore();
  const {
    loading: postingBookmarkLoading,
    createBookmark,
    deleteBookmark,
  } = usePostingBookmarkStore();
  const createPostingReportMutation = useCreatePostingReport();
  const createCommentReportMutation = useCreateCommentReport();

  const [newComment, setNewComment] = useState('');
  const [commentPage, setCommentPage] = useState(1);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyPageByRootId, setReplyPageByRootId] = useState<Record<string, number>>({});

  const commentPageSize = defaultPagination;
  const replyPageSize = defaultReplyPagination;
  const post = postingDetailEntity[postId] ?? null;
  const rootComments = useMemo(
    () => postingComments[postId]?.items ?? [],
    [postId, postingComments],
  );
  const commentRepliesByRootId = useMemo(
    () => postingCommentReplies[postId] ?? {},
    [postId, postingCommentReplies],
  );

  const allLoadedComments = useMemo(() => {
    const replies = Object.values(commentRepliesByRootId).flatMap(({ items }) => items);

    return [...rootComments, ...replies];
  }, [commentRepliesByRootId, rootComments]);

  const commentById = useMemo(
    () =>
      allLoadedComments.reduce<Record<string, PostingComment>>((acc, comment) => {
        acc[comment.id] = comment;
        return acc;
      }, {}),
    [allLoadedComments],
  );

  const getThreadRootId = useCallback(
    (commentId: string) => {
      let current = commentById[commentId];

      if (!current) {
        return commentId;
      }

      for (const [rootId, replies] of Object.entries(commentRepliesByRootId)) {
        if (replies.items.some((reply) => reply.id === commentId)) {
          return rootId;
        }
      }

      return current.id;
    },
    [commentById, commentRepliesByRootId],
  );

  const selectedReplyComment = replyingToId ? commentById[replyingToId] : null;
  const commentTotalCount = postingComments[postId]?.totalCount ?? 0;
  const commentTotalPages = Math.max(1, Math.ceil(commentTotalCount / commentPageSize));
  const commentCurrentBlockStart =
    Math.floor((commentPage - 1) / pageBlockSize) * pageBlockSize + 1;
  const commentPageNumbers = Array.from(
    {
      length: Math.min(pageBlockSize, commentTotalPages - commentCurrentBlockStart + 1),
    },
    (_, index) => commentCurrentBlockStart + index,
  );
  const [isOtherReportOpen, setIsOtherReportOpen] = useState(false);
  const [otherReportContent, setOtherReportContent] = useState('');
  const [pendingReport, setPendingReport] = useState<PendingReport | null>(null);
  const isReportSubmitting =
    createPostingReportMutation.isPending || createCommentReportMutation.isPending;

  const handleLike = async () => {
    if (!post) return;

    if (post.social.isLiked) {
      await unlikePosting(post.id);
    } else {
      await likePosting(post.id);
    }

    fetchPostingDetail(post.id);
  };

  const handleBookmark = async () => {
    if (!post) return;

    if (post.social.isBookmarked) {
      await deleteBookmark(post.id);
    } else {
      await createBookmark(post.id);
    }

    fetchPostingDetail(post.id);
  };

  const createPostingReport = async (reasonType: PostingReportReasonType, content: string) => {
    if (!postId) return;

    await createPostingReportMutation.mutateAsync({
      postingId: postId,
      body: {
        report_type: reasonType,
        content,
      },
    });
  };

  const createCommentReport = async (
    commentId: string,
    reasonType: CommentReportReasonType,
    content: string,
  ) => {
    await createCommentReportMutation.mutateAsync({
      commentId,
      body: {
        report_type: reasonType,
        content,
      },
    });
  };

  const handleReport = async (reasonType: PostingReportReasonType) => {
    try {
      if (reasonType === PostingReportReasonType.InvalidContent) {
        await createPostingReport(reasonType, '포스트 오류');
        alert('포스트 오류 신고가 접수되었습니다.');
      } else if (reasonType === PostingReportReasonType.BrokenLink) {
        await createPostingReport(reasonType, '링크 오류');
        alert('링크 오류 신고가 접수되었습니다.');
      } else {
        setPendingReport({ target: 'posting', reasonType });
        setIsOtherReportOpen(true);
      }
    } catch {
      alert('신고 접수에 실패했습니다.');
    }
  };

  const handleOtherReportSubmit = async () => {
    const content = otherReportContent.trim();

    if (content && pendingReport) {
      try {
        if (pendingReport.target === 'posting') {
          await createPostingReport(pendingReport.reasonType, content);
        } else {
          await createCommentReport(pendingReport.commentId, pendingReport.reasonType, content);
        }

        alert('기타 신고가 접수되었습니다.');
        setOtherReportContent('');
        setPendingReport(null);
        setIsOtherReportOpen(false);
      } catch {
        alert('신고 접수에 실패했습니다.');
      }
    }
  };

  const handleCommentReport = async (commentId: string, reasonType: CommentReportReasonType) => {
    try {
      if (reasonType === CommentReportReasonType.Political) {
        await createCommentReport(commentId, reasonType, '정치');
        alert('정치 신고가 접수되었습니다.');
      } else if (reasonType === CommentReportReasonType.Adult) {
        await createCommentReport(commentId, reasonType, '성인');
        alert('성인 신고가 접수되었습니다.');
      } else {
        setPendingReport({ target: 'comment', commentId, reasonType });
        setIsOtherReportOpen(true);
      }
    } catch {
      alert('신고 접수에 실패했습니다.');
    }
  };

  const renderCommentActions = (commentId: string) => (
    <ButtonGroup>
      <ButtonGroup>
        <Button
          variant={replyingToId === commentId ? 'secondary' : 'ghost'}
          size="xs"
          onClick={() => setReplyingToId(replyingToId === commentId ? null : commentId)}
          className="flex items-center gap-1"
        >
          <MessageCircle className="size-3" />
          <span className="text-xs">답글</span>
        </Button>
      </ButtonGroup>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="댓글 신고"
            variant="ghost"
            size="xs"
            className="flex items-center gap-1"
          >
            <Siren className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" collisionPadding={8} className="w-36 min-w-36">
          <DropdownMenuItem
            disabled={isReportSubmitting}
            onSelect={() => void handleCommentReport(commentId, CommentReportReasonType.Political)}
          >
            정치
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isReportSubmitting}
            onSelect={() => void handleCommentReport(commentId, CommentReportReasonType.Adult)}
          >
            성인
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isReportSubmitting}
            onSelect={() => void handleCommentReport(commentId, CommentReportReasonType.Other)}
          >
            기타
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );

  const handleLoadMoreReplies = async (rootCommentId: string) => {
    const nextPage = (replyPageByRootId[rootCommentId] ?? 0) + 1;

    await fetchPostingCommentReplies(
      postId,
      rootCommentId,
      { page: nextPage, size: replyPageSize },
      true,
    );
    setReplyPageByRootId((prev) => ({ ...prev, [rootCommentId]: nextPage }));
  };

  const refreshThreadReplies = async (threadRootId: string) => {
    const loadedPageCount = (replyPageByRootId[threadRootId] ?? 0) + 1;

    await fetchPostingCommentReplies(postId, threadRootId, {
      page: 0,
      size: replyPageSize * loadedPageCount,
    });
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && postId) {
      try {
        const replyTargetId = replyingToId;

        if (replyTargetId) {
          await createPostingReply(getThreadRootId(replyTargetId), { content: newComment });
        } else {
          await createPostingComment(postId, { content: newComment });
        }
        setNewComment('');
        setReplyingToId(null);

        if (replyTargetId) {
          await refreshThreadReplies(getThreadRootId(replyTargetId));
          fetchPostingComments(postId, { page: commentPage - 1, size: commentPageSize });
          return;
        }

        if (commentPage !== 1) {
          setCommentPage(1);
        }
        fetchPostingComments(postId, { page: 0, size: commentPageSize });
      } catch {
        alert('댓글 작성 실패');
      }
    }
  };

  useEffect(() => {
    if (postId && !postingDetailEntity[postId]) {
      fetchPostingDetail(postId);
    }
  }, [fetchPostingDetail, postId, postingDetailEntity]);

  useEffect(() => {
    if (postId) {
      fetchPostingComments(postId, { page: commentPage - 1, size: commentPageSize });
    }
  }, [commentPage, commentPageSize, fetchPostingComments, postId]);

  useEffect(() => {
    if (!postId) return;

    rootComments.forEach((comment) => {
      if (comment.hasChildComment && commentRepliesByRootId[comment.id] === undefined) {
        fetchPostingCommentReplies(postId, comment.id, { page: 0, size: replyPageSize });
        setReplyPageByRootId((prev) => ({ ...prev, [comment.id]: 0 }));
      }
    });
  }, [commentRepliesByRootId, fetchPostingCommentReplies, postId, replyPageSize, rootComments]);

  const handleRetryPost = () => {
    if (!postId) return;

    fetchPostingDetail(postId);
  };

  if (postId === '') {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <FileQuestion className="text-muted-foreground size-10" />
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">포스트를 찾을 수 없습니다.</h2>
              <p className="text-muted-foreground text-sm">
                유효한 포스트 주소로 다시 접근해주세요.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!post && !postingDetailError) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <Card>
          <CardHeader className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-20 w-full" />
            <Separator />
            <div className="flex gap-3">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-20" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <FileQuestion className="text-muted-foreground size-10" />
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">포스트를 불러오지 못했습니다.</h2>
              <p className="text-muted-foreground text-sm">
                {postingDetailError ?? '요청한 포스트가 없거나 일시적으로 접근할 수 없습니다.'}
              </p>
            </div>
            <Button variant="outline" onClick={handleRetryPost} className="gap-2">
              <RefreshCw className="size-4" />
              다시 시도
            </Button>
          </CardContent>
        </Card>
      </div>
    );
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
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="size-4" />
                <span>{post.social.viewCount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 본문 */}
          <div className="prose prose-gray max-w-none whitespace-pre-wrap">{post.summary}</div>

          <Separator />

          <Button asChild>
            <a href={post.url} target="_blank" rel="noreferrer" className="gap-2">
              <ExternalLink className="size-4" href={post.url} />
              본문으로 이동하기
            </a>
          </Button>
          <Separator />

          {/* 액션 버튼 */}
          <div className="flex flex-wrap items-center gap-4">
            <Button
              variant={post.social.isLiked ? 'default' : 'outline'}
              size="sm"
              onClick={handleLike}
              disabled={postingLikeLoading}
              className="flex items-center gap-2"
            >
              <Heart className={`size-4 ${post.social.isLiked ? 'fill-current' : ''}`} />
              <span>{post.social.likeCount}</span>
            </Button>

            <Button
              variant={post.social.isBookmarked ? 'default' : 'outline'}
              size="sm"
              onClick={handleBookmark}
              disabled={postingBookmarkLoading}
              className="flex items-center gap-2"
            >
              <Bookmark className={`size-4 ${post.social.isBookmarked ? 'fill-current' : ''}`} />
              <span>즐겨찾기</span>
            </Button>

            {/* 신고 버튼 그룹 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Flag className="size-4" />
                  <span>신고</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" collisionPadding={8}>
                <DropdownMenuItem
                  disabled={isReportSubmitting}
                  onSelect={() => void handleReport(PostingReportReasonType.InvalidContent)}
                >
                  포스트 오류
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isReportSubmitting}
                  onSelect={() => void handleReport(PostingReportReasonType.BrokenLink)}
                >
                  링크 오류
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isReportSubmitting}
                  onSelect={() => void handleReport(PostingReportReasonType.Other)}
                >
                  기타 신고
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* 기타 신고 폼 다이얼로그 */}
      <AlertDialog
        open={isOtherReportOpen}
        onOpenChange={(open) => {
          setIsOtherReportOpen(open);
          if (!open) {
            setOtherReportContent('');
            setPendingReport(null);
          }
        }}
      >
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
            <AlertDialogCancel disabled={isReportSubmitting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleOtherReportSubmit}
              disabled={!otherReportContent.trim() || isReportSubmitting}
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
            댓글 ({commentTotalCount})
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 댓글 작성 */}
          <form onSubmit={handleCommentSubmit} className="space-y-4">
            {selectedReplyComment && (
              <div className="bg-muted flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm">
                <span className="min-w-0 truncate">
                  {selectedReplyComment.nickname}님에게 답글 작성 중
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => setReplyingToId(null)}
                >
                  취소
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder={selectedReplyComment ? '답글을 작성하세요...' : '댓글을 작성하세요...'}
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
            {rootComments.map((comment) => (
              <div key={comment.id} className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                    <User className="size-4" />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{comment.nickname}</span>
                      <span className="text-muted-foreground text-xs">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm">{comment.content}</p>
                    {renderCommentActions(comment.id)}
                  </div>
                </div>

                {(commentRepliesByRootId[comment.id]?.items ?? []).map((reply) => {
                  return (
                    <div key={reply.id} className="ml-11 flex items-start gap-3 rounded-md py-2">
                      <div className="bg-muted flex h-7 w-7 items-center justify-center rounded-full">
                        <User className="size-3.5" />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{reply.nickname}</span>
                          <span className="text-muted-foreground text-xs">
                            {new Date(reply.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-sm">{reply.content}</p>
                        {renderCommentActions(reply.id)}
                      </div>
                    </div>
                  );
                })}

                {(() => {
                  const replyState = commentRepliesByRootId[comment.id];
                  const loadedReplyCount = replyState?.items.length ?? 0;
                  const totalReplyCount = replyState?.totalCount ?? 0;
                  const hasMoreReplies = loadedReplyCount < totalReplyCount;
                  const isReplyLoading = replyLoading[`${postId}:${comment.id}`];

                  if (!hasMoreReplies) {
                    return null;
                  }

                  return (
                    <Button
                      variant="ghost"
                      size="xs"
                      className="text-muted-foreground ml-11"
                      onClick={() => handleLoadMoreReplies(comment.id)}
                      disabled={isReplyLoading}
                    >
                      {isReplyLoading
                        ? '불러오는 중...'
                        : `답글 더보기 (${loadedReplyCount}/${totalReplyCount})`}
                    </Button>
                  );
                })()}

                {comment.id !== rootComments[rootComments.length - 1].id && (
                  <Separator className="ml-11" />
                )}
              </div>
            ))}

            {rootComments.length === 0 && (
              <div className="text-muted-foreground py-8 text-center">
                아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
              </div>
            )}
          </div>

          {/* 댓글 pagination */}
          {commentTotalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              <ButtonGroup aria-label="Comment pagination">
                <Button
                  variant="secondary"
                  onClick={() => setCommentPage(Math.max(1, commentPage - 1))}
                  disabled={commentPage === 1}
                >
                  <ArrowLeftIcon />
                </Button>
                {commentPageNumbers.map((pageNumber) => (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === commentPage ? 'secondary' : 'outline'}
                    onClick={() => setCommentPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                ))}
                <Button
                  variant="secondary"
                  onClick={() => setCommentPage(Math.min(commentTotalPages, commentPage + 1))}
                  disabled={commentPage === commentTotalPages}
                >
                  <ArrowRightIcon />
                </Button>
              </ButtonGroup>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PostDetail;
