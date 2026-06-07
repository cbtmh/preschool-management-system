import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Bell } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../components/ui/pagination';
import { Checkbox } from '../../components/ui/checkbox';

import { notificationService, Notification, SendNotificationRequest } from '../../services/notification.service';
import { coreService } from '../../services/core.service';
import { SchoolClassResponse } from '../../types/core';

const formSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề thông báo'),
  content: z.string().min(1, 'Vui lòng nhập nội dung thông báo'),
  type: z.enum(['SCHOOL', 'SYSTEM', 'CLASS', 'INDIVIDUAL', 'INTERACTION']),
  targetRoles: z.array(z.string()).min(1, 'Vui lòng chọn ít nhất 1 đối tượng nhận'),
  targetClassIds: z.array(z.number()).optional(),
}).refine(data => {
  if (data.type === 'CLASS') {
    return data.targetClassIds && data.targetClassIds.length > 0;
  }
  return true;
}, {
  message: 'Vui lòng chọn ít nhất 1 lớp học',
  path: ['targetClassIds'],
});

type FormValues = z.infer<typeof formSchema>;

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [classes, setClasses] = useState<SchoolClassResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const size = 6;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      type: 'SCHOOL',
      targetRoles: ['TEACHER'],
      targetClassIds: [],
    }
  });

  const watchType = form.watch('type');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getSentNotifications(page, size);
      if (res.data) {
        const contentArr = (res.data as any).content || [];
        setNotifications(contentArr);
        
        let elements = (res.data as any).totalElements;
        if (elements === undefined || elements === null || (elements === 0 && contentArr.length > 0)) {
            elements = (res.data as any).page?.totalElements || contentArr.length;
        }
        setTotalElements(elements);
        
        let pages = (res.data as any).totalPages;
        if (pages === undefined || pages === null || (pages === 0 && contentArr.length > 0)) {
            pages = (res.data as any).page?.totalPages || Math.ceil(elements / size) || 1;
        }
        setTotalPages(pages);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách thông báo');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await coreService.getAllClasses();
      if (res.data) {
        setClasses(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch classes', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleOpenModal = () => {
    form.reset({
      title: '',
      content: '',
      type: 'SCHOOL',
      targetRoles: ['TEACHER'],
      targetClassIds: [],
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const requestData: SendNotificationRequest = {
        title: values.title,
        content: values.content,
        type: values.type,
        targetRoles: values.targetRoles,
        targetClassIds: values.type === 'CLASS' ? values.targetClassIds : undefined,
      };

      await notificationService.sendNotification(requestData);
      toast.success('Gửi thông báo thành công');
      
      setIsModalOpen(false);
      fetchNotifications();
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  const toggleClassSelection = (classId: number) => {
    const currentIds = form.getValues('targetClassIds') || [];
    if (currentIds.includes(classId)) {
      form.setValue('targetClassIds', currentIds.filter(id => id !== classId), { shouldValidate: true });
    } else {
      form.setValue('targetClassIds', [...currentIds, classId], { shouldValidate: true });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý Thông báo</h1>
        <Button onClick={handleOpenModal} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Tạo Thông báo mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử Thông báo đã gửi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Ngày gửi</TableHead>
                  <TableHead>Người gửi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">Đang tải dữ liệu...</TableCell>
                  </TableRow>
                ) : notifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">Chưa có thông báo nào</TableCell>
                  </TableRow>
                ) : (
                  notifications.map((notif) => (
                    <TableRow key={notif.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-50 flex items-center justify-center rounded text-blue-500">
                            <Bell size={16} />
                          </div>
                          <span className="truncate max-w-[300px]">{notif.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={notif.type === 'SCHOOL' || notif.type === 'SYSTEM' ? 'default' : notif.type === 'CLASS' ? 'secondary' : 'outline'} 
                          className={
                            notif.type === 'SCHOOL' ? 'bg-indigo-600' : 
                            notif.type === 'SYSTEM' ? 'bg-rose-600' : 
                            notif.type === 'CLASS' ? 'bg-emerald-100 text-emerald-800' : 
                            'text-slate-600'
                          }
                        >
                          {notif.type === 'SCHOOL' ? 'Toàn trường' : 
                           notif.type === 'SYSTEM' ? 'Hệ thống' : 
                           notif.type === 'CLASS' ? 'Lớp học' : 
                           notif.type === 'INTERACTION' ? 'Tương tác' : 'Cá nhân'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(notif.createdAt).toLocaleString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        {notif.senderName || 'Hệ thống'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {notifications.length > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between px-2">
              <div className="text-sm text-slate-500 mb-4 sm:mb-0">
                Hiển thị {page * size + 1} đến {Math.min((page + 1) * size, totalElements)} trong tổng số {totalElements} thông báo
              </div>
              <Pagination className="w-auto mx-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      className={page === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {[...Array(totalPages)].map((_, i) => {
                    if (totalPages <= 5 || i === 0 || i === totalPages - 1 || Math.abs(page - i) <= 1) {
                      return (
                        <PaginationItem key={i}>
                          <PaginationLink 
                            onClick={() => setPage(i)}
                            isActive={page === i}
                            className="cursor-pointer"
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    if (Math.abs(page - i) === 2) {
                      return (
                        <PaginationItem key={i}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

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
        <DialogContent className="sm:max-w-[600px] md:max-w-[700px] w-[95vw]">
          <DialogHeader>
            <DialogTitle>Gửi Thông Báo Mới</DialogTitle>
            <DialogDescription>
              Tạo và gửi thông báo cho giáo viên hoặc phụ huynh trên hệ thống.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề thông báo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tiêu đề..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nội dung chi tiết *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Nội dung thông báo..." {...field} className="min-h-[150px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại thông báo *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại thông báo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SCHOOL">Thông báo toàn trường</SelectItem>
                          <SelectItem value="SYSTEM">Thông báo hệ thống</SelectItem>
                          <SelectItem value="CLASS">Thông báo theo lớp</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetRoles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block mb-3">Đối tượng nhận *</FormLabel>
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="role-teacher" 
                            checked={field.value.includes('TEACHER')}
                            onCheckedChange={(checked) => {
                              const newValue = checked 
                                ? [...field.value, 'TEACHER']
                                : field.value.filter(val => val !== 'TEACHER');
                              field.onChange(newValue);
                            }}
                          />
                          <label htmlFor="role-teacher" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Giáo viên
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="role-parent" 
                            checked={field.value.includes('PARENT')}
                            onCheckedChange={(checked) => {
                              const newValue = checked 
                                ? [...field.value, 'PARENT']
                                : field.value.filter(val => val !== 'PARENT');
                              field.onChange(newValue);
                            }}
                          />
                          <label htmlFor="role-parent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Phụ huynh
                          </label>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {watchType === 'CLASS' && (
                <FormField
                  control={form.control}
                  name="targetClassIds"
                  render={({ field }) => (
                    <FormItem className="mt-4 p-4 border rounded-md bg-slate-50">
                      <FormLabel className="block mb-3">Chọn Lớp học *</FormLabel>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[150px] overflow-y-auto">
                        {classes.map(cls => (
                          <div key={cls.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`class-${cls.id}`} 
                              checked={(field.value || []).includes(cls.id)}
                              onCheckedChange={() => toggleClassSelection(cls.id)}
                            />
                            <label htmlFor={`class-${cls.id}`} className="text-sm cursor-pointer truncate" title={cls.name}>
                              {cls.name}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  Gửi Thông báo
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationManagement;
