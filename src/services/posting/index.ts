import dayjs from 'dayjs';

import { api } from '../api';

// DTO Types (API 응답 형식)
export interface SocialStatsDto {
  like_count: number;
  view_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  comment_count: number;
}

export interface PostingListItemDto {
  id: string;
  provider_id: string;
  title: string;
  published_at: string;
  thumbnail_url: string;
  summary: string;
  status: number;
  social: SocialStatsDto;
}

export interface GetPostingsResponseDto {
  total: number;
  items: PostingListItemDto[];
}

export interface MyBookmarkDto {
  post_id: string;
  created_at: number;
}

export interface PostingCommentDto {
  id: string;
  user_id: string;
  post_id: string;
  parent_comment_id: string;
  has_child_comment: boolean;
  content: string;
  total_report_count: number;
  status?: string;
  created_at: number;
  updated_at: number;
}

export interface GetMyBookmarksResponseDto {
  items: MyBookmarkDto[];
}

export interface GetPostingCommentsResponseDto {
  total_count: string;
  items: PostingCommentDto[];
}

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
  providerId: string;
  title: string;
  publishedAt: number;
  thumbnailUrl: string;
  summary: string;
  status: number;
  social: SocialStats;
}

export interface MyBookmark {
  postId: string;
  createdAt: number;
}

export interface PostingComment {
  id: string;
  userId: string;
  postId: string;
  parentCommentId: string;
  hasChildComment: boolean;
  content: string;
  totalReportCount: number;
  status?: string;
  createdAt: number;
  updatedAt: number;
}

export interface GetMyBookmarksResponse {
  items: MyBookmark[];
}

export interface GetPostingCommentsResponse {
  totalCount: string;
  items: PostingComment[];
}

export interface GetPostingsResponse {
  total: number;
  items: PostingListItem[];
}

// Request DTO
export interface GetPostingsParams {
  page?: number;
  size?: number;
  provider_id?: string;
  title?: string;
}

// Mappers
const mapSocialStatsDtoToEntity = (dto: SocialStatsDto): SocialStats => ({
  likeCount: dto.like_count,
  viewCount: dto.view_count,
  isLiked: dto.is_liked,
  isBookmarked: dto.is_bookmarked,
  commentCount: dto.comment_count,
});

const mapPostingListItemDtoToEntity = (dto: PostingListItemDto): PostingListItem => ({
  id: dto.id,
  providerId: dto.provider_id,
  title: dto.title,
  publishedAt: dayjs(dto.published_at).valueOf(),
  thumbnailUrl: dto.thumbnail_url,
  summary: dto.summary,
  status: dto.status,
  social: mapSocialStatsDtoToEntity(dto.social),
});

const mapGetPostingListResponseDtoToEntity = (
  dto: GetPostingsResponseDto,
): GetPostingsResponse => ({
  total: dto.total,
  items: dto.items.map(mapPostingListItemDtoToEntity),
});

const mapMyBookmarkDtoToEntity = (dto: MyBookmarkDto): MyBookmark => ({
  postId: dto.post_id,
  createdAt: dto.created_at,
});

const mapGetMyBookmarksResponseDtoToEntity = (
  dto: GetMyBookmarksResponseDto,
): GetMyBookmarksResponse => ({
  items: dto.items.map(mapMyBookmarkDtoToEntity),
});

const mapPostingCommentDtoToEntity = (dto: PostingCommentDto): PostingComment => ({
  id: dto.id,
  userId: dto.user_id,
  postId: dto.post_id,
  parentCommentId: dto.parent_comment_id,
  hasChildComment: dto.has_child_comment,
  content: dto.content,
  totalReportCount: dto.total_report_count,
  status: dto.status,
  createdAt: dto.created_at,
  updatedAt: dto.updated_at,
});

const mapGetPostingCommentsResponseDtoToEntity = (
  dto: GetPostingCommentsResponseDto,
): GetPostingCommentsResponse => ({
  totalCount: dto.total_count,
  items: dto.items.map(mapPostingCommentDtoToEntity),
});

// API 함수 - DTO로 받아서 Entity로 변환
export const getPostings = async (
  params: GetPostingsParams = {
    page: 0,
    size: 10,
    provider_id: undefined,
    title: undefined,
  },
): Promise<GetPostingsResponse> => {
  const response = await api.get<GetPostingsResponseDto>('/api/v1/postings', { params });
  return mapGetPostingListResponseDtoToEntity(response.data);
};

export const createPostingLike = async (postingId: string): Promise<void> => {
  await api.post<void>(`/api/v1/postings/${postingId}/likes`);
};

export const deletePostingLike = async (postingId: string): Promise<void> => {
  await api.delete<void>(`/api/v1/postings/${postingId}/likes`);
};

export const createPostingBookmark = async (postingId: string): Promise<void> => {
  await api.post<void>(`/api/v1/postings/${postingId}/bookmarks`);
};

export const deletePostingBookmark = async (postingId: string): Promise<void> => {
  await api.delete<void>(`/api/v1/postings/${postingId}/bookmarks`);
};

export const getMyBookmarks = async (
  params: { page?: number; size?: number } = { page: 0, size: 20 },
): Promise<GetMyBookmarksResponse> => {
  const response = await api.get<GetMyBookmarksResponseDto>('/api/v1/me/bookmarks', { params });
  return mapGetMyBookmarksResponseDtoToEntity(response.data);
};

export interface CreatePostingCommentRequestDto {
  content: string;
  parent_comment_id?: string;
}

export interface CreatePostingCommentResponseDto {
  id: string;
  created_at: number;
}

export interface CreatePostingCommentResponse {
  id: string;
  createdAt: number;
}

const mapCreatePostingCommentResponseDtoToEntity = (
  dto: CreatePostingCommentResponseDto,
): CreatePostingCommentResponse => ({
  id: dto.id,
  createdAt: dto.created_at,
});

export const createPostingComment = async (
  postingId: string,
  body: CreatePostingCommentRequestDto,
): Promise<CreatePostingCommentResponse> => {
  const response = await api.post<CreatePostingCommentResponseDto>(
    `/api/v1/postings/${postingId}/comments`,
    body,
  );
  return mapCreatePostingCommentResponseDtoToEntity(response.data);
};

export interface GetPostingCommentsParams {
  page?: number;
  size?: number;
  parent_comment_id?: string;
}

export const getPostingComments = async (
  postingId: string,
  params: GetPostingCommentsParams = { page: 0, size: 20 },
): Promise<GetPostingCommentsResponse> => {
  const response = await api.get<GetPostingCommentsResponseDto>(
    `/api/v1/postings/${postingId}/comments`,
    { params },
  );
  return mapGetPostingCommentsResponseDtoToEntity(response.data);
};

export interface PostingDetailDto extends PostingListItemDto {
  url: string;
  created_at: string;
  updated_at: string;
}

export interface PostingDetailEntity extends PostingListItem {
  url: string;
  createdAt: number;
  updatedAt: number;
}

const mapGetPostingDetailResponseDtoToEntity = (dto: PostingDetailDto): PostingDetailEntity => ({
  ...mapPostingListItemDtoToEntity(dto),
  url: dto.url,
  createdAt: dayjs(dto.created_at).valueOf(),
  updatedAt: dayjs(dto.updated_at).valueOf(),
});

export const getPostingDetail = async (id: string): Promise<PostingDetailEntity> => {
  const response = await api.get<PostingDetailDto>(`/api/v1/postings/${id}`);
  return mapGetPostingDetailResponseDtoToEntity(response.data);
};
