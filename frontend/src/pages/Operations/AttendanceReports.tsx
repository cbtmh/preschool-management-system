import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Download, Loader2, Search, Users, CheckCircle, CalendarX, UtensilsCrossed, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import * as xlsx from 'xlsx';

import { coreService } from '../../services/core.service';
import { getClassAttendanceReport } from '../../services/report.service';
import { SchoolClassResponse } from '../../types/core';
import { ClassAttendanceReportResponse, ChildAttendanceReportDto } from '../../types/report.type';

const AttendanceReports = () => {
  const [classes, setClasses] = useState<SchoolClassResponse[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth() + 1 + '');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear() + '');
  
  const [report, setReport] = useState<ClassAttendanceReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const yearsResponse = await coreService.getAllAcademicYears();
        const currentYear = yearsResponse.data?.find(y => y.isCurrent || y.current);
        if (currentYear) {
          const response = await coreService.getClassesByAcademicYear(currentYear.id);
          if (response.data) {
            setClasses(response.data);
            if (response.data.length > 0 && !selectedClassId) {
              setSelectedClassId(response.data[0].id.toString());
            }
          }
        } else {
           toast.error('Không tìm thấy năm học hiện tại');
        }
      } catch (error) {
        toast.error('Lỗi khi tải danh sách lớp học');
      }
    };
    fetchClasses();
  }, []);

  const fetchReport = async () => {
    if (!selectedClassId || !selectedMonth || !selectedYear) return;
    
    setIsLoading(true);
    try {
      const response = await getClassAttendanceReport(
        Number(selectedClassId),
        Number(selectedMonth),
        Number(selectedYear)
      );
      if (response.data) {
        setReport(response.data);
        toast.success('Đã cập nhật dữ liệu thống kê');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi tải báo cáo thống kê');
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClassId) {
      fetchReport();
    }
  }, [selectedClassId, selectedMonth, selectedYear]);

  const handleExportExcel = () => {
    if (!report || !report.childReports || report.childReports.length === 0) {
      toast.warning('Không có dữ liệu để xuất');
      return;
    }

    const exportData = report.childReports.map((child, index) => ({
      'STT': index + 1,
      'Mã HS': child.childId,
      'Họ và tên': child.childName,
      'Tổng ngày đi học': child.totalPresentDays,
      'Nghỉ có phép': child.totalExcusedAbsences,
      'Nghỉ không phép': child.totalUnexcusedAbsences,
      'Tổng cắt ăn': child.totalCancelledMeals,
      'Cắt bữa sáng': child.totalCancelledBreakfasts,
      'Cắt bữa trưa': child.totalCancelledLunches,
      'Cắt bữa xế': child.totalCancelledSnacks,
      'Tỷ lệ chuyên cần (%)': child.attendanceRate,
    }));

    const worksheet = xlsx.utils.json_to_sheet(exportData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Thống kê');

    // Generate column widths
    const wscols = [
      { wch: 5 },  // STT
      { wch: 10 }, // Mã
      { wch: 25 }, // Tên
      { wch: 15 }, // Đi học
      { wch: 15 }, // Có phép
      { wch: 15 }, // Không phép
      { wch: 15 }, // Tổng cắt ăn
      { wch: 15 }, // Sáng
      { wch: 15 }, // Trưa
      { wch: 15 }, // Xế
      { wch: 20 }, // Chuyên cần
    ];
    worksheet['!cols'] = wscols;

    const fileName = `Bao_Cao_Lop_${report.className}_Thang_${report.month}_${report.year}.xlsx`;
    xlsx.writeFile(workbook, fileName);
    toast.success('Đã xuất file Excel thành công!');
  };

  const filteredReports = report?.childReports.filter(child => 
    child.childName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalStudents = report?.childReports.length || 0;
  const avgAttendance = totalStudents > 0 
    ? (report!.childReports.reduce((sum, child) => sum + child.attendanceRate, 0) / totalStudents).toFixed(1) 
    : 0;
  const totalExcused = report?.childReports.reduce((sum, child) => sum + child.totalExcusedAbsences, 0) || 0;
  const totalUnexcused = report?.childReports.reduce((sum, child) => sum + child.totalUnexcusedAbsences, 0) || 0;
  const totalCancelled = report?.childReports.reduce((sum, child) => sum + child.totalCancelledMeals, 0) || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Thống kê Vận hành</h1>
      </div>

      {report && !isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng sĩ số</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">Học sinh trong danh sách</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">TB Chuyên cần</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{avgAttendance}%</div>
              <p className="text-xs text-muted-foreground">Tổng ngày đi học của lớp</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng ngày nghỉ</CardTitle>
              <CalendarX className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{totalExcused + totalUnexcused}</div>
              <p className="text-xs text-muted-foreground">{totalExcused} có phép / {totalUnexcused} không phép</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng suất cắt ăn</CardTitle>
              <UtensilsCrossed className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{totalCancelled}</div>
              <p className="text-xs text-muted-foreground">Các bữa ăn bị hủy trong tháng</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Báo cáo điểm danh & suất ăn</CardTitle>
          <CardDescription>Chọn lớp và tháng để xem chi tiết thống kê làm cơ sở tính học phí</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
            <div className="flex flex-col gap-1.5 w-full sm:w-32">
              <label className="text-sm font-medium text-muted-foreground">Lớp học</label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn lớp" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 w-full sm:w-32">
              <label className="text-sm font-medium text-muted-foreground">Tháng</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tháng" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(m => (
                    <SelectItem key={m} value={m.toString()}>Tháng {m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 w-full sm:w-32">
              <label className="text-sm font-medium text-muted-foreground">Năm</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Năm" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(y => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleExportExcel} 
              disabled={!report || report.childReports.length === 0}
              className="w-full sm:w-auto ml-auto bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              Xuất Excel
            </Button>
          </div>

          <div className="flex items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm học sinh..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {report && (
              <div className="ml-auto text-sm text-muted-foreground hidden sm:block">
                <span className="font-medium text-foreground">{report.totalSchoolDays}</span> ngày học trong tháng
              </div>
            )}
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[50px] text-center">STT</TableHead>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead className="text-center">Tổng đi học</TableHead>
                  <TableHead className="text-center">Nghỉ có phép</TableHead>
                  <TableHead className="text-center">Nghỉ không phép</TableHead>
                  <TableHead className="text-center text-orange-600 font-semibold">Tổng cắt ăn</TableHead>
                  <TableHead className="text-right">Tỷ lệ chuyên cần</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="ml-2">Đang xử lý dữ liệu...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : !report || filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Calendar className="h-8 w-8 text-muted-foreground/50" />
                        <p>{searchTerm ? 'Không tìm thấy học sinh nào' : 'Không có dữ liệu cho tháng này'}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((child, index) => (
                    <TableRow key={child.childId}>
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell className="font-medium">{child.childName}</TableCell>
                      <TableCell className="text-center text-green-600 font-bold">{child.totalPresentDays}</TableCell>
                      <TableCell className="text-center text-amber-600 font-medium">{child.totalExcusedAbsences}</TableCell>
                      <TableCell className="text-center text-red-600 font-medium">{child.totalUnexcusedAbsences}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <span className="font-bold text-orange-600">{child.totalCancelledMeals}</span>
                          {child.totalCancelledMeals > 0 && (
                            <div className="flex gap-1 flex-wrap justify-center">
                              {child.totalCancelledBreakfasts > 0 && <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-orange-50 text-orange-600 border-orange-200">S:{child.totalCancelledBreakfasts}</Badge>}
                              {child.totalCancelledLunches > 0 && <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-orange-50 text-orange-600 border-orange-200">T:{child.totalCancelledLunches}</Badge>}
                              {child.totalCancelledSnacks > 0 && <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-orange-50 text-orange-600 border-orange-200">X:{child.totalCancelledSnacks}</Badge>}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          child.attendanceRate >= 90 ? 'bg-green-100 text-green-800' : 
                          child.attendanceRate >= 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {child.attendanceRate}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceReports;
