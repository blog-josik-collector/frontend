import dayjs from 'dayjs';

import { api } from '../api';

// DTO Types (API 응답 형식)
export interface SocialStatsDto {
  like_count: number;
  view_count: number;
  is_liked: boolean;
  is_bookmarted: boolean;
}

export interface PostingItemDto {
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
  items: PostingItemDto[];
}

// Entity Types (도메인 모델)
export interface SocialStats {
  likeCount: number;
  viewCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

export interface PostingItem {
  id: string;
  providerId: string;
  title: string;
  publishedAt: number;
  thumbnailUrl: string;
  summary: string;
  status: number;
  social: SocialStats;
}

export interface GetPostingsResponse {
  total: number;
  items: PostingItem[];
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
  isBookmarked: dto.is_bookmarted,
});

const mapPostingItemDtoToEntity = (dto: PostingItemDto): PostingItem => ({
  id: dto.id,
  providerId: dto.provider_id,
  title: dto.title,
  publishedAt: dayjs(dto.published_at).valueOf(),
  thumbnailUrl: dto.thumbnail_url,
  summary: dto.summary,
  status: dto.status,
  social: mapSocialStatsDtoToEntity(dto.social),
});

const mapGetPostingsResponseDtoToEntity = (dto: GetPostingsResponseDto): GetPostingsResponse => ({
  total: dto.total,
  items: dto.items.map(mapPostingItemDtoToEntity),
});

// API 함수 - DTO로 받아서 Entity로 변환
export const getPostings = async (params?: GetPostingsParams): Promise<GetPostingsResponse> => {
  const response = await api.get<GetPostingsResponseDto>('/api/v1/postings', { params });
  return mapGetPostingsResponseDtoToEntity(response.data);
};
