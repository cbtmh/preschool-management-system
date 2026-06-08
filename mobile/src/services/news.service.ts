
import axiosInstance from '../config/api.client';

export interface NewsDetailDto {
  id: number;
  title: string;
  summary: string;
  content: string;
  category: string;
  imageUrl: string;
  isPublished: boolean;
  publishedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const newsService = {
  getNewsById: async (id: number): Promise<NewsDetailDto> => {
    const response = await axiosInstance.get<{ status: number; message: string; data: NewsDetailDto }>(
      `/public/news/${id}`
    );
    return response.data.data;
  },
  
  getPublishedNews: async (page: number, size: number): Promise<PageResponse<NewsDetailDto>> => {
    const response = await axiosInstance.get<{ status: number; message: string; data: PageResponse<NewsDetailDto> }>(
      `/public/news?page=${page}&size=${size}`
    );
    return response.data.data;
  }
};
