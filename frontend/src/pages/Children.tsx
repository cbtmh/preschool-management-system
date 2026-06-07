import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Edit, Trash2, Plus, ArrowRightLeft, UserMinus, FileSpreadsheet, Search, AlertCircle, X } from 'lucide-react';

import { userService } from '../services/user.service';
import { coreService } from '../services/core.service';
import { ChildResponse, ParentResponse } from '../types/user';
import { SchoolClassResponse } from '../types/core';

import { ImportExcelModal } from '../components/ImportExcelModal';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

// Zod schemas
const childSchema = z.object({
  fullName: z.string().min(1, "Họ và tên là bắt buộc"),
  dob: z.string().min(1, "Ngày sinh là bắt buộc"),
  gender: z.string().min(1, "Giới tính là bắt buộc"),
  status: z.string().min(1, "Trạng thái là bắt buộc"),
  healthNotes: z.string().optional(),
  parentId: z.coerce.number().min(1, "Phụ huynh là bắt buộc"),
  allergyDeclared: z.boolean().default(false),
  allergies: z.array(z.object({
    allergen: z.string().min(1, "Tác nhân là bắt buộc"),
    severity: z.string().min(1, "Mức độ là bắt buộc"),
    description: z.string().optional(),
  })).optional(),
});

const transferSchema = z.object({
  newClassId: z.coerce.number().min(1, "Vui lòng chọn lớp mới"),
  note: z.string().optional(),
});

const dropOutSchema = z.object({
  note: z.string().min(1, "Lý do là bắt buộc"),
});

const Children = () => {
  const [children, setChildren] = useState<ChildResponse[]>([]);
  const [parents, setParents] = useState<ParentResponse[]>([]);
  const [classes, setClasses] = useState<SchoolClassResponse[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  
  const [isMainDialogOpen, setIsMainDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isDropOutDialogOpen, setIsDropOutDialogOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  const [selectedChild, setSelectedChild] = useState<ChildResponse | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [enrollmentFilter, setEnrollmentFilter] = useState<"ALL" | "ENROLLED" | "UNENROLLED">("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredChildren = children.filter(child => {
    const matchesSearch = child.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          child.id.toString().includes(searchTerm);
    
    let matchesFilter = true;
    if (enrollmentFilter === "ENROLLED") {
      matchesFilter = child.hasCurrentEnrollment === true;
    } else if (enrollmentFilter === "UNENROLLED") {
      matchesFilter = child.hasCurrentEnrollment !== true && child.status !== 'ENTRANCE_PRIMARY' && child.status !== 'DROPPED_OUT'; 
    }

    let matchesStatus = true;
    if (statusFilter !== "ALL") {
      matchesStatus = child.status === statusFilter;
    }

    return matchesSearch && matchesFilter && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredChildren.length / itemsPerPage));
  const currentData = filteredChildren.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, enrollmentFilter, statusFilter]);

  const mainForm = useForm<z.infer<typeof childSchema>>({
    resolver: zodResolver(childSchema) as any,
    defaultValues: {
      fullName: "",
      dob: "",
      gender: "",
      status: "STUDYING",
      healthNotes: "",
      parentId: 0,
      allergyDeclared: false,
      allergies: [],
    },
  });

  const { fields: allergyFields, append: appendAllergy, remove: removeAllergy } = useFieldArray({
    control: mainForm.control,
    name: "allergies",
  });

  const transferForm = useForm<z.infer<typeof transferSchema>>({
    resolver: zodResolver(transferSchema) as any,
    defaultValues: {
      newClassId: 0,
      note: "",
    },
  });

  const dropOutForm = useForm<z.infer<typeof dropOutSchema>>({
    resolver: zodResolver(dropOutSchema) as any,
    defaultValues: {
      note: "",
    },
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [childrenRes, parentsRes, classesRes] = await Promise.all([
        userService.getAllChildren(),
        userService.getAllParents(),
        coreService.getAllClasses()
      ]);
      setChildren(childrenRes.data || []);
      setParents(parentsRes.data || []);
      setClasses(classesRes.data || []);
    } catch (error: any) {
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownloadTemplate = async () => {
    try {
      const blob = await userService.downloadBulkTemplate();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Template_Import_HocSinh_PhuHuynh.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error('Lỗi khi tải file mẫu');
    }
  };

  const handleImport = async (file: File) => {
    setIsImporting(true);
    try {
      await userService.importChildrenAndParents(file);
      toast.success('Nhập dữ liệu thành công');
      setIsImportModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi nhập dữ liệu');
    } finally {
      setIsImporting(false);
    }
  };

  const handleOpenMainDialog = (child?: ChildResponse) => {
    if (child) {
      setSelectedChild(child);
      mainForm.reset({
        fullName: child.fullName,
        dob: child.dob,
        gender: child.gender,
        status: child.status,
        healthNotes: child.healthNotes || "",
        parentId: child.parentId,
        allergyDeclared: child.allergyDeclared || false,
        allergies: child.allergies || [],
      });
    } else {
      setSelectedChild(null);
      mainForm.reset({
        fullName: "",
        dob: "",
        gender: "",
        status: "STUDYING",
        healthNotes: "",
        parentId: 0,
        allergyDeclared: false,
        allergies: [],
      });
    }
    setIsMainDialogOpen(true);
  };

  const handleOpenTransferDialog = (child: ChildResponse) => {
    setSelectedChild(child);
    transferForm.reset({
      newClassId: 0,
      note: "",
    });
    setIsTransferDialogOpen(true);
  };

  const handleOpenDropOutDialog = (child: ChildResponse) => {
    setSelectedChild(child);
    dropOutForm.reset({
      note: "",
    });
    setIsDropOutDialogOpen(true);
  };

  const onMainSubmit = async (values: z.infer<typeof childSchema>) => {
    try {
      if (selectedChild) {
        await userService.updateChild(selectedChild.id, values);
        toast.success('Cập nhật học sinh thành công');
      } else {
        await userService.createChild(values);
        toast.success('Thêm mới học sinh thành công');
      }
      setIsMainDialogOpen(false);
      const res = await userService.getAllChildren();
      setChildren(res.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const onTransferSubmit = async (values: z.infer<typeof transferSchema>) => {
    if (!selectedChild) return;
    try {
      await userService.transferClass(selectedChild.id, values);
      toast.success('Chuyển lớp thành công');
      setIsTransferDialogOpen(false);
      const res = await userService.getAllChildren();
      setChildren(res.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi chuyển lớp');
    }
  };

  const onDropOutSubmit = async (values: z.infer<typeof dropOutSchema>) => {
    if (!selectedChild) return;
    try {
      await userService.dropOut(selectedChild.id, values);
      toast.success('Đã cập nhật trạng thái thôi học');
      setIsDropOutDialogOpen(false);
      const res = await userService.getAllChildren();
      setChildren(res.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái thôi học');
    }
  };

  const handleDelete = async (child: ChildResponse) => {
    if (window.confirm(`Bạn có chắc muốn xóa dữ liệu học sinh ${child.fullName}?`)) {
      try {
        await userService.deleteChild(child.id);
        toast.success('Xóa học sinh thành công');
        const res = await userService.getAllChildren();
        setChildren(res.data || []);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa');
      }
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'STUDYING': return 'Đang học';
      case 'RESERVED': return 'Bảo lưu';
      case 'ENTRANCE_PRIMARY': return 'Lên lớp 1';
      case 'DROPPED_OUT': return 'Thôi học';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Học sinh</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsImportModalOpen(true)} className="bg-white">
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Nhập danh sách Học sinh & Phụ huynh
          </Button>
          <Button onClick={() => handleOpenMainDialog()}>
            <Plus className="mr-2 h-4 w-4" /> Thêm mới
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 w-full">
        <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded-md border shadow-sm w-full md:w-1/3">
          <Search className="h-5 w-5 text-gray-400" />
          <Input 
            placeholder="Tìm kiếm theo tên hoặc mã HS..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
          />
        </div>
        
        <div className="w-full md:w-auto">
          <Select value={enrollmentFilter} onValueChange={(val: any) => setEnrollmentFilter(val)}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Trạng thái xếp lớp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả xếp lớp</SelectItem>
              <SelectItem value="ENROLLED">Đã có lớp (Năm nay)</SelectItem>
              <SelectItem value="UNENROLLED">Chưa xếp lớp (Năm nay)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Trạng thái học sinh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="STUDYING">Đang học</SelectItem>
              <SelectItem value="RESERVED">Bảo lưu</SelectItem>
              <SelectItem value="ENTRANCE_PRIMARY">Lên lớp 1</SelectItem>
              <SelectItem value="DROPPED_OUT">Thôi học</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã HS</TableHead>
              <TableHead>Họ và tên</TableHead>
              <TableHead>Ngày sinh</TableHead>
              <TableHead>Giới tính</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">Đang tải...</TableCell>
              </TableRow>
            ) : filteredChildren.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  {searchTerm ? "Không tìm thấy kết quả phù hợp" : "Chưa có dữ liệu"}
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((child) => (
                <TableRow key={child.id}>
                  <TableCell className="font-medium">HS{child.id.toString().padStart(3, '0')}</TableCell>
                  <TableCell>{child.fullName}</TableCell>
                  <TableCell>{child.dob}</TableCell>
                  <TableCell>{child.gender === 'MALE' ? 'Nam' : child.gender === 'FEMALE' ? 'Nữ' : 'Khác'}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        child.status === 'STUDYING' ? 'bg-green-100 text-green-800' : 
                        child.status === 'DROPPED_OUT' ? 'bg-red-100 text-red-800' : 
                        child.status === 'ENTRANCE_PRIMARY' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusLabel(child.status)}
                      </span>
                      {child.hasCurrentEnrollment === true && (
                        <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                          Đã xếp lớp
                        </span>
                      )}
                      {child.hasCurrentEnrollment === false && child.status !== 'ENTRANCE_PRIMARY' && child.status !== 'DROPPED_OUT' && (
                        <span className="text-[10px] px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full border border-orange-200">
                          Chưa xếp lớp
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {child.status !== 'ENTRANCE_PRIMARY' && child.status !== 'DROPPED_OUT' && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenTransferDialog(child)} title="Chuyển lớp">
                            <ArrowRightLeft className="h-4 w-4 text-purple-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDropOutDialog(child)} title="Thôi học/Bảo lưu">
                            <UserMinus className="h-4 w-4 text-orange-600" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleOpenMainDialog(child)} title="Sửa">
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(child)} title="Xóa">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
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

      {/* Main Dialog (Create/Edit) */}
      <Dialog open={isMainDialogOpen} onOpenChange={setIsMainDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{selectedChild ? "Sửa thông tin học sinh" : "Thêm mới học sinh"}</DialogTitle>
          </DialogHeader>
          <Form {...mainForm}>
            <form onSubmit={mainForm.handleSubmit(onMainSubmit)} className="space-y-4">
              <FormField
                control={mainForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ và tên</FormLabel>
                    <FormControl><Input placeholder="VD: Lê Văn C" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={mainForm.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày sinh</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={mainForm.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giới tính</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Chọn giới tính" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="MALE">Nam</SelectItem>
                          <SelectItem value="FEMALE">Nữ</SelectItem>
                          <SelectItem value="OTHER">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={mainForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trạng thái</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="STUDYING">Đang học</SelectItem>
                          <SelectItem value="RESERVED">Bảo lưu</SelectItem>
                          <SelectItem value="ENTRANCE_PRIMARY">Lên lớp 1</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={mainForm.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phụ huynh</FormLabel>
                      <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value ? field.value.toString() : ""}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Chọn phụ huynh" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {parents.map((p) => (
                            <SelectItem key={p.id} value={p.id.toString()}>{p.fullName} - {p.username}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={mainForm.control}
                name="healthNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú sức khỏe</FormLabel>
                    <FormControl><Input placeholder="VD: Dị ứng hải sản" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="bg-orange-50 border border-orange-200 rounded-md p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-orange-800 font-semibold">
                    <AlertCircle className="h-5 w-5" />
                    <span>Thông tin dị ứng</span>
                  </div>
                  <FormField
                    control={mainForm.control}
                    name="allergyDeclared"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">Đã khai báo dị ứng?</label>
                        <input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-600" />
                      </div>
                    )}
                  />
                </div>
                
                {mainForm.watch("allergyDeclared") && (
                  <div className="space-y-4">
                    {allergyFields.map((field, index) => (
                      <div key={field.id} className="relative bg-white border border-gray-200 p-3 rounded-md grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                          onClick={() => removeAllergy(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <FormField
                          control={mainForm.control}
                          name={`allergies.${index}.allergen`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tác nhân</FormLabel>
                              <FormControl><Input placeholder="VD: Sữa bò, lạc..." {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={mainForm.control}
                          name={`allergies.${index}.severity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mức độ</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Chọn mức độ" /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="MILD">Nhẹ</SelectItem>
                                  <SelectItem value="MODERATE">Vừa</SelectItem>
                                  <SelectItem value="SEVERE">Nặng</SelectItem>
                                  <SelectItem value="CRITICAL">Nguy kịch</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="md:col-span-2">
                          <FormField
                            control={mainForm.control}
                            name={`allergies.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ghi chú / Sơ cứu</FormLabel>
                                <FormControl><Input placeholder="Biểu hiện và cách xử lý..." {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-orange-600 border-orange-200 hover:bg-orange-100"
                      onClick={() => appendAllergy({ allergen: "", severity: "MILD", description: "" })}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Thêm dị ứng
                    </Button>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsMainDialogOpen(false)}>Hủy</Button>
                <Button type="submit">Lưu</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Transfer Class Dialog */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chuyển lớp - {selectedChild?.fullName}</DialogTitle>
          </DialogHeader>
          <Form {...transferForm}>
            <form onSubmit={transferForm.handleSubmit(onTransferSubmit)} className="space-y-4">
              <FormField
                control={transferForm.control}
                name="newClassId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lớp mới</FormLabel>
                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value ? field.value.toString() : ""}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Chọn lớp mới" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {classes.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>{c.name} - {c.academicYearName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={transferForm.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lý do (Tùy chọn)</FormLabel>
                    <FormControl><Input placeholder="Nhập lý do chuyển lớp" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsTransferDialogOpen(false)}>Hủy</Button>
                <Button type="submit">Xác nhận chuyển</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Drop Out Dialog */}
      <Dialog open={isDropOutDialogOpen} onOpenChange={setIsDropOutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thôi học - {selectedChild?.fullName}</DialogTitle>
          </DialogHeader>
          <Form {...dropOutForm}>
            <form onSubmit={dropOutForm.handleSubmit(onDropOutSubmit)} className="space-y-4">
              <FormField
                control={dropOutForm.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lý do</FormLabel>
                    <FormControl><Input placeholder="Nhập lý do thôi học" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDropOutDialogOpen(false)}>Hủy</Button>
                <Button type="submit" variant="destructive">Xác nhận thôi học</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Import Excel Modal */}
      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        onDownloadTemplate={handleDownloadTemplate}
        title="Nhập danh sách Học sinh & Phụ huynh"
        isLoading={isImporting}
      />
    </div>
  );
};

export default Children;
