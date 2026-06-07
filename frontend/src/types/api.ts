// Generic API Response
export interface ApiResponse<T> {
  status: number; // 200, 400, 401, 404, 500
  message: string;
  data: T | null;
}
