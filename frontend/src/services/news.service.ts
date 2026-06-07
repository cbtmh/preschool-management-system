import axiosInstance from '../config/axios.instance';
import { ApiResponse } from '../types/api';
import { News, NewsRequest } from '../types/portal';

interface PageableResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  last: boolean;
}

export const NewsService = {
  // Admin endpoints
  getAllNews: async (page = 0, size = 10): Promise<ApiResponse<PageableResponse<News>>> => {
    const response = await axiosInstance.get(`/api/admin/news`, {
      params: { page, size, sort: 'createdAt,desc' }
    });
    return response.data;
  },

  getNewsById: async (id: number): Promise<ApiResponse<News>> => {
    const response = await axiosInstance.get(`/api/admin/news/${id}`);
    return response.data;
  },

  createNews: async (data: NewsRequest): Promise<ApiResponse<News>> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('summary', data.summary || '');
    formData.append('content', data.content);
    formData.append('category', data.category || '');
    formData.append('isPublished', String(data.isPublished));
    
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await axiosInstance.post('/api/admin/news', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateNews: async (id: number, data: NewsRequest): Promise<ApiResponse<News>> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('summary', data.summary || '');
    formData.append('content', data.content);
    formData.append('category', data.category || '');
    formData.append('isPublished', String(data.isPublished));
    
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await axiosInstance.put(`/api/admin/news/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteNews: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete(`/api/admin/news/${id}`);
    return response.data;
  },

  // Public endpoints
  getPublishedNews: async (page = 0, size = 10): Promise<ApiResponse<PageableResponse<News>>> => {
    const response = await axiosInstance.get(`/api/public/news`, {
      params: { page, size }
    });
    return response.data;
  },
  
  getPublicNewsById: async (id: number): Promise<ApiResponse<News>> => {
    const response = await axiosInstance.get(`/api/public/news/${id}`);
    return response.data;
  }
};
