import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Edit, Trash2, Plus, Users, Zap, GraduationCap, UserCheck, MoreVertical, Calendar } from 'lucide-react';

import { coreService } from '../services/core.service';
import { userService } from '../services/user.service';
import { SchoolClassResponse, AcademicYearResponse, EnrollmentResponse } from '../types/core';
import { TeacherResponse } from '../types/user';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
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
import { Checkbox } from '../components/ui/checkbox';

const formSchema = z.object({
  name: z.string().min(1, "Tên lớp là bắt buộc").max(100, "Tên lớp tối đa 100 ký tự"),
  ageGroup: z.string().min(1, "Nhóm tuổi là bắt buộc").max(50, "Nhóm tuổi tối đa 50 ký tự"),
  academicYearId: z.coerce.number().min(1, "Vui lòng chọn năm học"),
});

const AGE_GROUPS = [
  "Nhà trẻ (18-24 tháng)",
  "Nhà trẻ (24-36 tháng)",
  "Mầm (3-4 tuổi)",
  "Chồi (4-5 tuổi)",
  "Lá (5-6 tuổi)"
];

const SchoolClasses = () => {
  const [classes, setClasses] = useState<SchoolClassResponse[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearResponse[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Assign Teacher State
  const [isAssignTeacherDialogOpen, setIsAssignTeacherDialogOpen] = useState(false);
  const [selectedClassForAssign, setSelectedClassForAssign] = useState<SchoolClassResponse | null>(null);
  const [allTeachers, setAllTeachers] = useState<TeacherResponse[]>([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<number[]>([]);
  const [isAssigningTeachers, setIsAssigningTeachers] = useState(false);

  // Auto Enroll State
  const [isAutoEnrollDialogOpen, setIsAutoEnrollDialogOpen] = useState(false);
  const [autoEnrollYearId, setAutoEnrollYearId] = useState<string>("");
  const [isAutoEnrolling, setIsAutoEnrolling] = useState(false);

  // View Students State
  const [isStudentsDialogOpen, setIsStudentsDialogOpen] = useState(false);
  const [classStudents, setClassStudents] = useState<EnrollmentResponse[]>([]);
  const [selectedClassName, setSelectedClassName] = useState("");
  const [classTeachers, setClassTeachers] = useState("");
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(classes.length / itemsPerPage);
  const currentData = classes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      name: "",
      ageGroup: "",
      academicYearId: 0,
    },
  });

  const fetchAcademicYears = async () => {
    try {
      const response = await coreService.getAllAcademicYears();
      const years = response.data;
      setAcademicYears(years);
      
      if (selectedYearId === "") {
        const currentYear = years.find((y: AcademicYearResponse) => y.isCurrent || y.current);
        if (currentYear) {
          setSelectedYearId(currentYear.id.toString());
        } else {
          setSelectedYearId("all");
        }
      }
    } catch (error: any) {
      toast.error('Lỗi khi tải danh sách năm học');
    }
  };

  const fetchClasses = async (yearId: string) => {
    if (!yearId) return;
    setIsLoading(true);
    try {
      if (yearId === "all") {
        const response = await coreService.getAllClasses();
        setClasses(response.data);
      } else {
        const response = await coreService.getClassesByAcademicYear(Number(yearId));
        setClasses(response.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi tải danh sách lớp học');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademicYears();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedYearId !== "") {
      setCurrentPage(1);
      fetchClasses(selectedYearId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYearId]);

  const handleOpenDialog = (schoolClass?: SchoolClassResponse) => {
    if (schoolClass) {
      setEditingId(schoolClass.id);
      form.reset({
        name: schoolClass.name,
        ageGroup: schoolClass.ageGroup,
        academicYearId: schoolClass.academicYearId,
      });
    } else {
      setEditingId(null);
      form.reset({
        name: "",
        ageGroup: "",
        academicYearId: selectedYearId !== "all" ? Number(selectedYearId) : 0,
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (editingId) {
        await coreService.updateClass(editingId, values);
        toast.success('Cập nhật lớp học thành công');
      } else {
        await coreService.createClass(values);
        toast.success('Thêm mới lớp học thành công');
      }
      setIsDialogOpen(false);
      fetchClasses(selectedYearId);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (schoolClass: SchoolClassResponse) => {
    if (window.confirm(`Bạn có chắc muốn xóa lớp ${schoolClass.name}?`)) {
      try {
        await coreService.deleteClass(schoolClass.id);
        toast.success('Xóa lớp học thành công');
        fetchClasses(selectedYearId);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa');
      }
    }
  };

  const handleGraduate = async (schoolClass: SchoolClassResponse) => {
    if (window.confirm(`Xác nhận cho TỐT NGHIỆP lớp ${schoolClass.name}? Toàn bộ học sinh đang học trong lớp sẽ được chuyển trạng thái sang "Lên lớp 1". Hành động này không thể hoàn tác!`)) {
      try {
        await userService.graduateClass(schoolClass.id);
        toast.success(`Đã xét tốt nghiệp thành công cho lớp ${schoolClass.name}`);
        fetchClasses(selectedYearId);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xét tốt nghiệp');
      }
    }
  };

  const handleOpenAssignTeacher = async (schoolClass: SchoolClassResponse) => {
    setSelectedClassForAssign(schoolClass);
    setIsAssignTeacherDialogOpen(true);
    try {
      const teachersRes = await userService.getAllTeachers();
      setAllTeachers(teachersRes.data || []);
      
      const assignedRes = await coreService.getTeachersByClassId(schoolClass.id);
      const assignedIds = assignedRes.data?.teachers?.map(t => t.teacherId) || [];
      setSelectedTeacherIds(assignedIds);
    } catch (error: any) {
      toast.error('Lỗi khi tải thông tin giáo viên');
    }
  };

  const handleToggleTeacherSelection = (teacherId: number) => {
    setSelectedTeacherIds(prev => 
      prev.includes(teacherId) 
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const handleAssignTeachers = async () => {
    if (!selectedClassForAssign) return;

    if (selectedTeacherIds.length === 0) {
      if (!window.confirm(`Bạn không chọn giáo viên nào. Điều này sẽ HỦY PHÂN CÔNG toàn bộ giáo viên của lớp ${selectedClassForAssign.name}. Bạn có chắc chắn muốn lưu?`)) {
        return;
      }
    }

    setIsAssigningTeachers(true);
    try {
      await coreService.assignTeachersToClass({
        classId: selectedClassForAssign.id,
        teacherIds: selectedTeacherIds
      });
      toast.success('Phân công giáo viên thành công');
      setIsAssignTeacherDialogOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi phân công');
    } finally {
      setIsAssigningTeachers(false);
    }
  };

  const handleOpenAutoEnroll = () => {
    setAutoEnrollYearId(selectedYearId !== "all" ? selectedYearId : "");
    setIsAutoEnrollDialogOpen(true);
  };

  const handleAutoEnroll = async () => {
    if (!autoEnrollYearId) {
      toast.error("Vui lòng chọn năm học");
      return;
    }
    
    const selectedYear = academicYears.find(y => y.id.toString() === autoEnrollYearId);
    if (selectedYear && new Date(selectedYear.endDate) < new Date()) {
      toast.error("Năm học này đã qua nên không thể tiến hành xếp lớp nữa");
      return;
    }

    setIsAutoEnrolling(true);
    try {
      const response = await userService.autoEnroll({ academicYearId: Number(autoEnrollYearId) });
      const data = response.data;
      if (data) {
        toast.success(`Xếp lớp thành công! Đã xếp ${data.totalAssigned}/${data.totalProcessed} học sinh.`);
        if (data.totalUnassigned > 0) {
          toast.warning(`Có ${data.totalUnassigned} học sinh chưa được xếp do hết chỗ hoặc sai độ tuổi.`);
        }
      }
      setIsAutoEnrollDialogOpen(false);
      fetchClasses(selectedYearId);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tự động xếp lớp');
    } finally {
      setIsAutoEnrolling(false);
    }
  };

  const handleViewStudents = async (schoolClass: SchoolClassResponse) => {
    setSelectedClassName(schoolClass.name);
    setClassTeachers("");
    setIsStudentsDialogOpen(true);
    setIsLoadingStudents(true);
    try {
      const response = await userService.getStudentsInClass(schoolClass.id);
      setClassStudents(response.data || []);

      try {
        const teachersRes = await coreService.getTeachersByClassId(schoolClass.id);
        const teachersText = teachersRes.data?.teachers?.length ? teachersRes.data.teachers.map(t => t.fullName).join(', ') : "Chưa phân công";
        setClassTeachers(teachersText);
      } catch (teacherErr) {
        console.error("Lỗi lấy danh sách giáo viên:", teacherErr);
        setClassTeachers("Chưa phân công");
      }
    } catch (error: any) {
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setIsLoadingStudents(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Lớp học</h1>
        
        <div className="flex items-center gap-4">
          <Select value={selectedYearId} onValueChange={setSelectedYearId}>
            <SelectTrigger className="w-[200px] bg-white">
              <SelectValue placeholder="Chọn năm học" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả năm học</SelectItem>
              {academicYears.map((year) => (
                <SelectItem key={year.id} value={year.id.toString()}>
                  {year.name} {(year.isCurrent || year.current) && "(Hiện tại)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="secondary" onClick={handleOpenAutoEnroll} className="bg-purple-100 text-purple-700 hover:bg-purple-200">
            <Zap className="mr-2 h-4 w-4" /> Tự động xếp lớp
          </Button>
          
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" /> Thêm mới
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><p className="text-gray-500">Đang tải...</p></div>
      ) : classes.length === 0 ? (
        <div className="flex justify-center py-10 bg-white rounded-md border text-gray-500"><p>Chưa có dữ liệu</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentData.map((cls) => (
            <Card key={cls.id} className="hover:shadow-lg transition-shadow bg-white flex flex-col h-full border-gray-200">
              <CardHeader className="flex flex-row justify-between items-start pb-2 space-y-0">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-800 mb-2">{cls.name}</CardTitle>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none font-medium">
                    {cls.ageGroup}
                  </Badge>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:bg-gray-100 -mr-2 -mt-2">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white">
                    <DropdownMenuItem onClick={() => handleOpenDialog(cls)} className="cursor-pointer">
                      <Edit className="mr-2 h-4 w-4 text-blue-600" />
                      <span>Sửa lớp</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleGraduate(cls)} className="cursor-pointer text-purple-600">
                      <GraduationCap className="mr-2 h-4 w-4" />
                      <span>Xét tốt nghiệp</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(cls)} className="cursor-pointer text-red-600 focus:text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Xóa lớp</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              
              <CardContent className="flex-1 py-4">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Calendar className="mr-2 h-4 w-4 opacity-70" />
                  <span>Năm học: <span className="font-medium text-gray-900">{cls.academicYearName}</span></span>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-2 pt-0 pb-4 px-4 border-t border-gray-100">
                <div className="w-full flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="w-1/2 flex items-center justify-center gap-2 border-gray-300 hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-colors"
                    onClick={() => handleViewStudents(cls)}
                  >
                    <Users className="h-4 w-4 text-green-600" />
                    <span>Học sinh</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-1/2 flex items-center justify-center gap-2 border-gray-300 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 transition-colors"
                    onClick={() => handleOpenAssignTeacher(cls)}
                  >
                    <UserCheck className="h-4 w-4 text-orange-600" />
                    <span>Giáo viên</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

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
            <DialogTitle>{editingId ? "Sửa lớp học" : "Thêm mới lớp học"}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control as any}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên lớp</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Lớp Mầm 1" maxLength={100} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control as any}
                name="ageGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nhóm tuổi</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn nhóm tuổi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {AGE_GROUPS.map((group) => (
                          <SelectItem key={group} value={group}>
                            {group}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="academicYearId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Năm học</FormLabel>
                    <Select 
                      onValueChange={(val) => field.onChange(Number(val))} 
                      value={field.value ? field.value.toString() : ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn năm học" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {academicYears.map((year) => (
                          <SelectItem key={year.id} value={year.id.toString()}>
                            {year.name} {(year.isCurrent || year.current) && "(Hiện tại)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
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

      {/* Auto Enroll Dialog */}
      <Dialog open={isAutoEnrollDialogOpen} onOpenChange={setIsAutoEnrollDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tự động xếp lớp</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">
              Hệ thống sẽ tự động tìm các học sinh đang chờ xếp lớp và phân bổ vào các lớp còn trống dựa trên nhóm tuổi và cân bằng giới tính.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Chọn năm học</label>
              <Select value={autoEnrollYearId} onValueChange={setAutoEnrollYearId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn năm học..." />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year.id} value={year.id.toString()}>
                      {year.name} {(year.isCurrent || year.current) && "(Hiện tại)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAutoEnrollDialogOpen(false)} disabled={isAutoEnrolling}>
              Hủy
            </Button>
            <Button onClick={handleAutoEnroll} disabled={isAutoEnrolling || !autoEnrollYearId}>
              {isAutoEnrolling ? "Đang xử lý..." : "Tiến hành xếp lớp"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Students Dialog */}
      <Dialog open={isStudentsDialogOpen} onOpenChange={setIsStudentsDialogOpen}>
        <DialogContent className="sm:max-w-4xl w-[95vw]">
          <DialogHeader>
            <DialogTitle>Danh sách học sinh - {selectedClassName}</DialogTitle>
          </DialogHeader>
          {classTeachers && (
            <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded-md border border-blue-100 flex items-center gap-2 mt-2">
              <UserCheck className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Giáo viên phụ trách:</span> 
              <span className="text-blue-700 font-semibold">{classTeachers}</span>
            </div>
          )}
          <div className="mt-2 max-h-[60vh] overflow-y-auto">
            {isLoadingStudents ? (
              <p className="text-center py-4">Đang tải...</p>
            ) : classStudents.length === 0 ? (
              <p className="text-center py-4 text-gray-500">Chưa có học sinh nào trong lớp này.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>STT</TableHead>
                    <TableHead>Mã HS</TableHead>
                    <TableHead>Họ và tên</TableHead>
                    <TableHead>Ngày xếp lớp</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classStudents.map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>HS{student.childId}</TableCell>
                      <TableCell className="font-medium">{student.childName}</TableCell>
                      <TableCell>{new Date(student.enrollmentDate).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {student.status === 'STUDYING' ? 'Đang học' : student.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStudentsDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Teacher Dialog */}
      <Dialog open={isAssignTeacherDialogOpen} onOpenChange={setIsAssignTeacherDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Phân công giáo viên - {selectedClassForAssign?.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2 space-y-3">
            {allTeachers.length === 0 ? (
              <p className="text-center py-4 text-gray-500">Không có giáo viên nào trong hệ thống.</p>
            ) : (
              allTeachers.map((teacher) => {
                const isSelected = selectedTeacherIds.includes(teacher.id);
                const assignedClassesText = teacher.assignedClasses && teacher.assignedClasses.length > 0 
                    ? `Đang dạy: ${teacher.assignedClasses.join(', ')}` 
                    : 'Chưa có lớp';

                return (
                  <div key={teacher.id} className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:bg-gray-50'}`} onClick={() => handleToggleTeacherSelection(teacher.id)}>
                    <Checkbox id={`teacher-${teacher.id}`} checked={isSelected} onCheckedChange={() => handleToggleTeacherSelection(teacher.id)} />
                    <div className="flex-1">
                      <label htmlFor={`teacher-${teacher.id}`} className="font-medium cursor-pointer text-gray-900 block">
                        {teacher.fullName} (GV{teacher.id.toString().padStart(3, '0')})
                      </label>
                      <p className="text-sm text-gray-500">{assignedClassesText}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsAssignTeacherDialogOpen(false)} disabled={isAssigningTeachers}>Hủy</Button>
            <Button onClick={handleAssignTeachers} disabled={isAssigningTeachers} className="bg-orange-600 hover:bg-orange-700">
              {isAssigningTeachers ? "Đang xử lý..." : "Lưu phân công"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchoolClasses;
