export interface News {
  id: number;
  title: string;
  summary: string;
  content: string;
  category: string;
  imageUrl: string | null;
  isPublished: boolean;
  publishedDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewsRequest {
  title: string;
  summary: string;
  content: string;
  category: string;
  isPublished: boolean;
  image?: File | null;
}
