import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { Switch } from '../../components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../components/ui/pagination';

import { NewsService } from '../../services/news.service';
import { News, NewsRequest } from '../../types/portal';
import { BACKEND_URL } from '../../config/constants';

const getImageUrl = (url: string | null | undefined) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

const formSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề bài viết'),
  category: z.string().min(1, 'Vui lòng nhập danh mục'),
  summary: z.string().optional(),
  content: z.string().min(1, 'Vui lòng nhập nội dung bài viết'),
  isPublished: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

const NewsManagement = () => {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const size = 10;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      category: '',
      summary: '',
      content: '',
      isPublished: true,
    }
  });

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await NewsService.getAllNews(page, size);
      if (res.data) {
        setNewsList(res.data.content);
        setTotalPages(res.data.totalPages);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách tin tức');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [page]);

  const handleOpenModal = (news?: News) => {
    if (news) {
      setEditingId(news.id);
      form.reset({
        title: news.title,
        category: news.category,
        summary: news.summary || '',
        content: news.content,
        isPublished: news.isPublished,
      });
      setImagePreview(getImageUrl(news.imageUrl));
    } else {
      setEditingId(null);
      form.reset({
        title: '',
        category: '',
        summary: '',
        content: '',
        isPublished: true,
      });
      setImagePreview(null);
    }
    setSelectedImage(null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const requestData: NewsRequest = {
        ...values,
        image: selectedImage,
      };

      if (editingId) {
        await NewsService.updateNews(editingId, requestData);
        toast.success('Cập nhật bài viết thành công');
      } else {
        await NewsService.createNews(requestData);
        toast.success('Tạo bài viết thành công');
      }
      setIsModalOpen(false);
      fetchNews();
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      try {
        await NewsService.deleteNews(id);
        toast.success('Xóa bài viết thành công');
        fetchNews();
      } catch (error) {
        toast.error('Lỗi khi xóa bài viết');
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý Tin tức</h1>
        <Button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Thêm Bài Viết
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Bài viết</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Ngày đăng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">Đang tải dữ liệu...</TableCell>
                  </TableRow>
                ) : newsList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">Chưa có bài viết nào</TableCell>
                  </TableRow>
                ) : (
                  newsList.map((news) => (
                    <TableRow key={news.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          {news.imageUrl ? (
                            <img src={getImageUrl(news.imageUrl) as string} alt={news.title} className="w-10 h-10 object-cover rounded" />
                          ) : (
                            <div className="w-10 h-10 bg-slate-100 flex items-center justify-center rounded text-slate-400">
                              <ImageIcon size={20} />
                            </div>
                          )}
                          <span className="truncate max-w-[200px]">{news.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{news.category}</Badge>
                      </TableCell>
                      <TableCell>
                        {news.publishedDate ? new Date(news.publishedDate).toLocaleDateString('vi-VN') : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={news.isPublished ? 'default' : 'destructive'} className={news.isPublished ? 'bg-green-500' : ''}>
                          {news.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(news)} className="text-blue-600">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(news.id)} className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      className={page === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        onClick={() => setPage(i)}
                        isActive={page === i}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      className={page === totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Cập nhật Bài Viết' : 'Thêm Bài Viết Mới'}</DialogTitle>
            <DialogDescription className="sr-only">
              Form nhập thông tin để tạo hoặc chỉnh sửa bài viết trên hệ thống.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Tiêu đề *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tiêu đề bài viết..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục *</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: Thông báo, Sự kiện..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Xuất bản
                        </FormLabel>
                        <div className="text-[13px] text-muted-foreground">
                          Bài viết sẽ hiển thị trên trang chủ
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2">
                  <FormLabel className="mb-2 block">Hình ảnh đại diện</FormLabel>
                  <div className="flex items-start space-x-4">
                    {imagePreview ? (
                      <div className="relative w-32 h-32 rounded-md overflow-hidden border">
                        <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setSelectedImage(null);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-md border-2 border-dashed flex items-center justify-center text-slate-400 bg-slate-50">
                        <ImageIcon size={32} />
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-slate-500 mt-2">Định dạng JPG, PNG. Tối đa 5MB.</p>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control as any}
                  name="summary"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Tóm tắt</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Đoạn tóm tắt ngắn gọn..." {...field} className="h-20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Nội dung chi tiết *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Nội dung bài viết..." {...field} className="min-h-[200px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingId ? 'Cập nhật' : 'Thêm mới'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewsManagement;
