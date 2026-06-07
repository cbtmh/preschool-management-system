import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Edit, UserX, Plus, Search, KeyRound } from 'lucide-react';

import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';
import { ParentResponse } from '../types/user';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
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

// Zod schemas
const createSchema = z.object({
  phone: z.string().min(10, "Số điện thoại không hợp lệ"),
  fullName: z.string().min(1, "Họ và tên là bắt buộc"),
  address: z.string().optional(),
});

const updateSchema = z.object({
  fullName: z.string().min(1, "Họ và tên là bắt buộc"),
  address: z.string().optional(),
});

const Parents = () => {
  const [parents, setParents] = useState<ParentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // null means create mode, otherwise it's the ID of the parent being edited
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedParent, setSelectedParent] = useState<ParentResponse | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredParents = parents.filter(parent => {
    const searchLower = searchTerm.toLowerCase();
    return parent.fullName.toLowerCase().includes(searchLower) ||
           (parent.username && parent.username.includes(searchTerm)) ||
           parent.id.toString().includes(searchTerm);
  });

  const totalPages = Math.max(1, Math.ceil(filteredParents.length / itemsPerPage));
  const currentData = filteredParents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const form = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(editingId ? updateSchema : createSchema) as any,
    defaultValues: {
      phone: "",
      fullName: "",
      address: "",
    },
  });

  const fetchParents = async () => {
    setIsLoading(true);
    try {
      const response = await userService.getAllParents();
      setParents(response.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi tải danh sách phụ huynh');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  const handleOpenDialog = (parent?: ParentResponse) => {
    if (parent) {
      setEditingId(parent.id);
      setSelectedParent(parent);
      form.reset({
        phone: "", // Ignored in update schema
        fullName: parent.fullName,
        address: parent.address || "",
      });
    } else {
      setEditingId(null);
      setSelectedParent(null);
      form.reset({
        phone: "",
        fullName: "",
        address: "",
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: any) => {
    try {
      if (editingId) {
        await userService.updateParent(editingId, {
          fullName: values.fullName,
          address: values.address,
        });
        toast.success('Cập nhật phụ huynh thành công');
      } else {
        await userService.createParent(values);
        toast.success('Thêm mới phụ huynh thành công');
      }
      setIsDialogOpen(false);
      fetchParents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (parent: ParentResponse) => {
    if (window.confirm(`Bạn có chắc muốn vô hiệu hóa phụ huynh ${parent.fullName}?`)) {
      try {
        await userService.deleteParent(parent.id);
        toast.success('Vô hiệu hóa thành công');
        fetchParents();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi vô hiệu hóa');
      }
    }
  };

  const handleResendPassword = async (parent: ParentResponse) => {
    if (window.confirm(`Bạn có chắc muốn gửi lại mật khẩu cho phụ huynh ${parent.fullName}? Mật khẩu mới sẽ được tạo và gửi qua SMS.`)) {
      try {
        await authService.resendPassword(parent.userId);
        toast.success('Đã gửi lại mật khẩu thành công');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi lại mật khẩu');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 shrink-0">Phụ huynh</h1>
        
        <div className="flex flex-col sm:flex-row flex-1 items-start sm:items-center justify-end gap-4 w-full">
          <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded-md border shadow-sm w-full sm:w-80">
            <Search className="h-5 w-5 text-gray-400" />
            <Input 
              placeholder="Tìm theo tên, SĐT hoặc mã PH..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none px-2"
            />
          </div>

          <Button onClick={() => handleOpenDialog()} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" /> Thêm mới
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã PH</TableHead>
              <TableHead>Họ và tên</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Phụ huynh của bé</TableHead>
              <TableHead>Địa chỉ</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">Đang tải...</TableCell>
              </TableRow>
            ) : parents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">Chưa có dữ liệu</TableCell>
              </TableRow>
            ) : (
              currentData.map((parent) => (
                <TableRow key={parent.id}>
                  <TableCell className="font-medium">PH{parent.id.toString().padStart(3, '0')}</TableCell>
                  <TableCell>{parent.fullName}</TableCell>
                  <TableCell>{parent.username}</TableCell>
                  <TableCell>
                    {parent.childrenNames && parent.childrenNames.length > 0 
                      ? <span className="font-medium text-blue-600">{parent.childrenNames.join(', ')}</span>
                      : <span className="text-gray-400 italic">Chưa có dữ liệu</span>}
                  </TableCell>
                  <TableCell>{parent.address}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(parent)} title="Sửa">
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleResendPassword(parent)} title="Gửi lại mật khẩu">
                      <KeyRound className="h-4 w-4 text-orange-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(parent)} title="Vô hiệu hóa">
                      <UserX className="h-4 w-4 text-red-600" />
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Sửa thông tin phụ huynh" : "Thêm mới phụ huynh"}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              {!editingId && (
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại (Tài khoản)</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: 0912345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ và tên</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Trần Văn B" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {editingId && selectedParent && (
                <div className="space-y-2 pb-1">
                  <FormLabel>Phụ huynh của bé</FormLabel>
                  <div className="p-3 bg-gray-50 border rounded-md text-sm text-gray-700">
                    {selectedParent.childrenNames && selectedParent.childrenNames.length > 0
                      ? <span className="font-medium text-blue-600">{selectedParent.childrenNames.join(', ')}</span>
                      : <span className="text-gray-400 italic">Chưa có học sinh liên kết</span>}
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa chỉ (Tùy chọn)</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Quận 1, TP.HCM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-4">
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

export default Parents;
