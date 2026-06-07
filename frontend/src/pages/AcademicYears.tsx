import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Edit, Trash2, Plus, CheckCircle } from 'lucide-react';

import { coreService } from '../services/core.service';
import { AcademicYearResponse } from '../types/core';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../components/ui/pagination';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';

const formSchema = z.object({
  name: z.string().regex(/^\d{4}-\d{4}$/, {
    message: "Tên năm học phải đúng định dạng YYYY-YYYY (VD: 2024-2025)",
  }),
  startDate: z.string().min(1, { message: "Ngày bắt đầu là bắt buộc" }),
  endDate: z.string().min(1, { message: "Ngày kết thúc là bắt buộc" }),
  isCurrent: z.boolean().default(false),
}).refine((data) => new Date(data.startDate) < new Date(data.endDate), {
  message: "Ngày bắt đầu phải trước ngày kết thúc",
  path: ["startDate"],
});

const AcademicYears = () => {
  const [years, setYears] = useState<AcademicYearResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(years.length / itemsPerPage);
  const currentData = years.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
    },
  });

  const fetchYears = async () => {
    setIsLoading(true);
    try {
      const response = await coreService.getAllAcademicYears();
      setYears(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi tải danh sách năm học');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  const handleOpenDialog = (year?: AcademicYearResponse) => {
    if (year) {
      setEditingId(year.id);
      form.reset({
        name: year.name,
        startDate: year.startDate,
        endDate: year.endDate,
        isCurrent: year.isCurrent || year.current,
      });
    } else {
      setEditingId(null);
      form.reset({
        name: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (editingId) {
        await coreService.updateAcademicYear(editingId, values);
        toast.success('Cập nhật năm học thành công');
      } else {
        await coreService.createAcademicYear(values);
        toast.success('Thêm mới năm học thành công');
      }
      setIsDialogOpen(false);
      fetchYears();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (year: AcademicYearResponse) => {
    if (year.isCurrent || year.current) {
      toast.error("Không thể xóa năm học đang được đặt làm năm học hiện tại");
      return;
    }
    if (window.confirm(`Bạn có chắc muốn xóa năm học ${year.name}?`)) {
      try {
        await coreService.deleteAcademicYear(year.id);
        toast.success('Xóa năm học thành công');
        fetchYears();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa');
      }
    }
  };

  const handleSetCurrent = async (year: AcademicYearResponse) => {
    if (window.confirm(`Bạn có chắc muốn đặt năm học ${year.name} làm năm học hiện tại?`)) {
      try {
        await coreService.updateAcademicYear(year.id, {
          name: year.name,
          startDate: year.startDate,
          endDate: year.endDate,
          isCurrent: true,
        });
        toast.success(`Đã đặt năm học ${year.name} làm năm hiện tại`);
        fetchYears();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Năm học</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Thêm mới
        </Button>
      </div>

      <div className="bg-white rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên năm học</TableHead>
              <TableHead>Ngày bắt đầu</TableHead>
              <TableHead>Ngày kết thúc</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">Đang tải...</TableCell>
              </TableRow>
            ) : years.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">Chưa có dữ liệu</TableCell>
              </TableRow>
            ) : (
              currentData.map((year) => (
                <TableRow key={year.id}>
                  <TableCell className="font-medium">{year.name}</TableCell>
                  <TableCell>{year.startDate}</TableCell>
                  <TableCell>{year.endDate}</TableCell>
                  <TableCell>
                    {(year.isCurrent || year.current) && (
                      <Badge className="bg-green-500 hover:bg-green-600">Năm hiện tại</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {!(year.isCurrent || year.current) && (
                      <Button variant="ghost" size="icon" onClick={() => handleSetCurrent(year)} title="Đặt làm năm học hiện tại">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(year)} title="Sửa năm học">
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(year)} disabled={year.isCurrent || year.current} title="Xóa năm học">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-4 justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink 
                  onClick={() => setCurrentPage(index + 1)}
                  isActive={currentPage === index + 1}
                  className="cursor-pointer"
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Sửa năm học" : "Thêm mới năm học"}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control as any}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên năm học</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: 2024-2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày bắt đầu</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày kết thúc</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="isCurrent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Đặt làm năm học hiện tại</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit">Lưu</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AcademicYears;
