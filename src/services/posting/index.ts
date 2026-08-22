import dayjs from 'dayjs';

import { api } from '../api';

// DTO Types (API 응답 형식)
export type PostingStatus = 'active' | 'blocked' | 'deleted';

export interface PostingListItemDto {
  id: string;
  provider: string;
  title: string;
  published_at: string;
  thumbnail_url: string;
  summary: string;
  status: PostingStatus;
  likes_of_me: boolean;
  bookmarks_of_me: boolean;
  like_count: number;
  view_count: number;
  comment_count: number;
  total_report_count: number;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface OffsetPageDto<T> {
  total_count: number;
  page: number;
  size: number;
  items: T[];
}

export interface GetPostingsResponseDto extends OffsetPageDto<PostingListItemDto> {
  items: PostingListItemDto[];
}

export interface BookmarkedPostingDto {
  id: string;
  provider: string;
  title: string;
  published_at: string;
  thumbnail_url: string;
  summary: string;
  status: PostingStatus;
  like_count: number;
  view_count: number;
  comment_count: number;
  total_report_count: number;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface PostingCommentDto {
  id: string;
  nickname: string;
  has_child_comment: boolean;
  content: string;
  status: PostingStatus;
  created_at: string;
  updated_at: string;
}

export type GetMyBookmarksResponseDto = OffsetPageDto<BookmarkedPostingDto>;

export type GetPostingCommentsResponseDto = OffsetPageDto<PostingCommentDto>;

// Entity Types (도메인 모델)
export interface SocialStats {
  likeCount: number;
  viewCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  commentCount: number;
}

export interface PostingListItem {
  id: string;
  provider: string;
  title: string;
  publishedAt: number;
  thumbnailUrl: string;
  summary: string;
  status: PostingStatus;
  social: SocialStats;
  totalReportCount: number;
  url: string;
  createdAt: number;
  updatedAt: number;
}

export interface BookmarkedPosting {
  id: string;
  provider: string;
  title: string;
  publishedAt: number;
  thumbnailUrl: string;
  summary: string;
  status: PostingStatus;
  likeCount: number;
  viewCount: number;
  commentCount: number;
  totalReportCount: number;
  url: string;
  createdAt: number;
  updatedAt: number;
}

export interface PostingComment {
  id: string;
  nickname: string;
  hasChildComment: boolean;
  content: string;
  status: PostingStatus;
  createdAt: number;
  updatedAt: number;
}

export interface GetMyBookmarksResponse {
  totalCount: number;
  page: number;
  size: number;
  items: BookmarkedPosting[];
}

export interface GetPostingCommentsResponse {
  totalCount: number;
  page: number;
  size: number;
  items: PostingComment[];
}

export interface GetPostingsResponse {
  totalCount: number;
  page: number;
  size: number;
  items: PostingListItem[];
}

// Request DTO
export interface GetPostingsParams {
  page?: number;
  size?: number;
  provider?: string;
  title?: string;
}

// Mappers
const mapPostingListItemDtoToEntity = (dto: PostingListItemDto): PostingListItem => ({
  id: dto.id,
  provider: dto.provider,
  title: dto.title,
  publishedAt: dayjs(dto.published_at).valueOf(),
  thumbnailUrl: dto.thumbnail_url,
  summary: dto.summary,
  status: dto.status,
  social: {
    likeCount: dto.like_count,
    viewCount: dto.view_count,
    isLiked: dto.likes_of_me,
    isBookmarked: dto.bookmarks_of_me,
    commentCount: dto.comment_count,
  },
  totalReportCount: dto.total_report_count,
  url: dto.url,
  createdAt: dayjs(dto.created_at).valueOf(),
  updatedAt: dayjs(dto.updated_at).valueOf(),
});

const mapGetPostingListResponseDtoToEntity = (
  dto: GetPostingsResponseDto,
): GetPostingsResponse => ({
  totalCount: dto.total_count,
  page: dto.page,
  size: dto.size,
  items: dto.items.map(mapPostingListItemDtoToEntity),
});

const mapBookmarkedPostingDtoToEntity = (dto: BookmarkedPostingDto): BookmarkedPosting => ({
  id: dto.id,
  provider: dto.provider,
  title: dto.title,
  publishedAt: dayjs(dto.published_at).valueOf(),
  thumbnailUrl: dto.thumbnail_url,
  summary: dto.summary,
  status: dto.status,
  likeCount: dto.like_count,
  viewCount: dto.view_count,
  commentCount: dto.comment_count,
  totalReportCount: dto.total_report_count,
  url: dto.url,
  createdAt: dayjs(dto.created_at).valueOf(),
  updatedAt: dayjs(dto.updated_at).valueOf(),
});

const mapGetMyBookmarksResponseDtoToEntity = (
  dto: GetMyBookmarksResponseDto,
): GetMyBookmarksResponse => ({
  totalCount: dto.total_count,
  page: dto.page,
  size: dto.size,
  items: dto.items.map(mapBookmarkedPostingDtoToEntity),
});

const mapPostingCommentDtoToEntity = (dto: PostingCommentDto): PostingComment => ({
  id: dto.id,
  nickname: dto.nickname,
  hasChildComment: dto.has_child_comment,
  content: dto.content,
  status: dto.status,
  createdAt: dayjs(dto.created_at).valueOf(),
  updatedAt: dayjs(dto.updated_at).valueOf(),
});

const mapGetPostingCommentsResponseDtoToEntity = (
  dto: GetPostingCommentsResponseDto,
): GetPostingCommentsResponse => ({
  totalCount: dto.total_count,
  page: dto.page,
  size: dto.size,
  items: dto.items.map(mapPostingCommentDtoToEntity),
});

// API 함수 - DTO로 받아서 Entity로 변환
/**
 * GET /interaction/v1/postings - 포스팅 목록 조회
 */
export const getPostings = async (
  params: GetPostingsParams = {
    page: 0,
    size: 10,
    provider: undefined,
    title: undefined,
  },
): Promise<GetPostingsResponse> => {
  const response = await api.get<GetPostingsResponseDto>('/interaction/v1/postings', { params });
  return mapGetPostingListResponseDtoToEntity(response.data);
};

/**
 * POST /interaction/v1/postings/{posting_id}/likes - 포스팅 좋아요 생성
 */
export const createPostingLike = async (postingId: string): Promise<void> => {
  await api.post<void>(`/interaction/v1/postings/${postingId}/likes`);
};

/**
 * DELETE /interaction/v1/postings/{posting_id}/likes - 포스팅 좋아요 삭제
 */
export const deletePostingLike = async (postingId: string): Promise<void> => {
  await api.delete<void>(`/interaction/v1/postings/${postingId}/likes`);
};

/**
 * POST /interaction/v1/postings/{posting_id}/bookmarks - 포스팅 북마크 생성
 */
export const createPostingBookmark = async (postingId: string): Promise<void> => {
  await api.post<void>(`/interaction/v1/postings/${postingId}/bookmarks`);
};

/**
 * DELETE /interaction/v1/postings/{posting_id}/bookmarks - 포스팅 북마크 삭제
 */
export const deletePostingBookmark = async (postingId: string): Promise<void> => {
  await api.delete<void>(`/interaction/v1/postings/${postingId}/bookmarks`);
};

/**
 * GET /interaction/v1/me/bookmarks - 내 북마크 목록 조회
 */
export const getMyBookmarks = async (
  params: { page?: number; size?: number } = { page: 0, size: 20 },
): Promise<GetMyBookmarksResponse> => {
  const response = await api.get<GetMyBookmarksResponseDto>('/interaction/v1/me/bookmarks', {
    params,
  });
  return mapGetMyBookmarksResponseDtoToEntity(response.data);
};

export interface CreatePostingCommentRequestDto {
  content: string;
}

export interface CreatePostingCommentResponseDto {
  id: string;
  created_at: string;
}

export interface CreatePostingCommentResponse {
  id: string;
  createdAt: number;
}

const mapCreatePostingCommentResponseDtoToEntity = (
  dto: CreatePostingCommentResponseDto,
): CreatePostingCommentResponse => ({
  id: dto.id,
  createdAt: dayjs(dto.created_at).valueOf(),
});

/**
 * POST /interaction/v1/postings/{posting_id}/comments - 포스팅 댓글 생성
 */
export const createPostingComment = async (
  postingId: string,
  body: CreatePostingCommentRequestDto,
): Promise<CreatePostingCommentResponse> => {
  const response = await api.post<CreatePostingCommentResponseDto>(
    `/interaction/v1/postings/${postingId}/comments`,
    body,
  );
  return mapCreatePostingCommentResponseDtoToEntity(response.data);
};

export interface GetPostingCommentsParams {
  page?: number;
  size?: number;
}

/**
 * GET /interaction/v1/postings/{posting_id}/comments - 포스팅 댓글 목록 조회
 */
export const getPostingComments = async (
  postingId: string,
  params: GetPostingCommentsParams = { page: 0, size: 20 },
): Promise<GetPostingCommentsResponse> => {
  const response = await api.get<GetPostingCommentsResponseDto>(
    `/interaction/v1/postings/${postingId}/comments`,
    { params },
  );
  return mapGetPostingCommentsResponseDtoToEntity(response.data);
};

export type PostingDetailDto = PostingListItemDto;

export interface PostingDetailEntity extends PostingListItem {
  url: string;
  createdAt: number;
  updatedAt: number;
}

const mapGetPostingDetailResponseDtoToEntity = (dto: PostingDetailDto): PostingDetailEntity => ({
  ...mapPostingListItemDtoToEntity(dto),
});

/**
 * GET /interaction/v1/postings/{posting_id} - 포스팅 상세 조회
 */
export const getPostingDetail = async (id: string): Promise<PostingDetailEntity> => {
  const response = await api.get<PostingDetailDto>(`/interaction/v1/postings/${id}`);
  return mapGetPostingDetailResponseDtoToEntity(response.data);
};
