import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Eye, AlertTriangle, MessageSquare, Clock, CheckCircle } from 'lucide-react';

import { incidentService } from '../../services/incident.service';
import { AdminIncidentResponse, AdminIncidentUpdateRequest } from '../../types/incident';

import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../components/ui/pagination';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const Incidents = () => {
  const [incidents, setIncidents] = useState<AdminIncidentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<AdminIncidentResponse | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("NEW");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { register, handleSubmit, setValue, watch, reset } = useForm<AdminIncidentUpdateRequest>();

  const filteredIncidents = incidents.filter(inc => {
    if (statusFilter !== "ALL") {
      return inc.status === statusFilter;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredIncidents.length / itemsPerPage));
  const currentData = filteredIncidents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const res = await incidentService.getAllIncidents();
      console.log("Incidents response:", res);
      setIncidents(res.data || []);
    } catch (error: any) {
      console.error("Fetch incidents error:", error);
      toast.error('Lỗi khi tải danh sách tường trình');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleOpenDialog = (incident: AdminIncidentResponse) => {
    setSelectedIncident(incident);
    reset({
      status: incident.status,
      principalNotes: incident.principalNotes || ''
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: AdminIncidentUpdateRequest) => {
    if (!selectedIncident) return;
    try {
      await incidentService.updateIncident(selectedIncident.id, data);
      toast.success('Cập nhật tường trình thành công');
      setIsDialogOpen(false);
      fetchIncidents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'NEW': return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Mới</span>;
      case 'IN_PROGRESS': return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center gap-1"><Clock className="w-3 h-3"/> Đang xử lý</span>;
      case 'RESOLVED': return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Đã giải quyết</span>;
      default: return <span>{status}</span>;
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch(severity) {
      case 'LOW': return 'Nhẹ';
      case 'MEDIUM': return 'Trung bình';
      case 'HIGH': return 'Nghiêm trọng';
      case 'CRITICAL': return 'Rất nghiêm trọng';
      default: return severity;
    }
  };

  const getRoleLabel = (role: string) => {
    switch(role) {
      case 'VICTIM': return 'Nạn nhân';
      case 'AGGRESSOR': return 'Gây ra';
      case 'WITNESS': return 'Nhân chứng';
      case 'INVOLVED': return 'Liên quan';
      default: return role;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'HH:mm dd/MM/yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Quản lý Sự việc</h1>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[600px] mb-6">
          <TabsTrigger value="NEW" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-800">
            Mới (Chưa xử lý)
          </TabsTrigger>
          <TabsTrigger value="IN_PROGRESS" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800">
            Đang xử lý
          </TabsTrigger>
          <TabsTrigger value="RESOLVED" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">
            Đã giải quyết
          </TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-0 outline-none">
          <div className="bg-white rounded-md border shadow-sm">
            <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Lớp</TableHead>
              <TableHead>Giáo viên</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">Đang tải...</TableCell>
              </TableRow>
            ) : filteredIncidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Chưa có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="font-medium max-w-[200px] truncate" title={incident.title}>
                    {incident.title}
                    <div className="text-xs text-gray-500 mt-1">Mức độ: {getSeverityLabel(incident.severityLevel)}</div>
                  </TableCell>
                  <TableCell>{incident.className}</TableCell>
                  <TableCell>{incident.reportedByTeacherName}</TableCell>
                  <TableCell>{formatDate(incident.incidentTime)}</TableCell>
                  <TableCell>{getStatusBadge(incident.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleOpenDialog(incident)}>
                      <Eye className="w-4 h-4 mr-2" /> Xem chi tiết
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
        </TabsContent>
      </Tabs>

      {/* Incident Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <AlertTriangle className="text-red-500 w-6 h-6"/> Chi tiết tường trình
            </DialogTitle>
          </DialogHeader>

          {selectedIncident && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{selectedIncident.title}</h3>
                  <div className="flex gap-2 items-center mt-2">
                    {getStatusBadge(selectedIncident.status)}
                    <span className="text-sm bg-gray-100 px-2 py-1 rounded-md text-gray-700">Mức độ: {getSeverityLabel(selectedIncident.severityLevel)}</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-md border text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-500">Giáo viên:</span>
                    <span className="font-medium">{selectedIncident.reportedByTeacherName}</span>
                    
                    <span className="text-gray-500">Lớp:</span>
                    <span className="font-medium">{selectedIncident.className}</span>
                    
                    <span className="text-gray-500">Thời gian:</span>
                    <span className="font-medium">{formatDate(selectedIncident.incidentTime)}</span>
                    
                    <span className="text-gray-500">Ngày tạo:</span>
                    <span className="font-medium">{formatDate(selectedIncident.createdAt)}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Mô tả sự việc:</h4>
                  <div className="text-gray-700 bg-white p-3 border rounded-md min-h-[100px] whitespace-pre-wrap">
                    {selectedIncident.description}
                  </div>
                </div>

                {selectedIncident.initialHandling && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Cách xử lý ban đầu:</h4>
                    <div className="text-gray-700 bg-white p-3 border rounded-md min-h-[100px] whitespace-pre-wrap">
                      {selectedIncident.initialHandling}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Học sinh liên quan ({selectedIncident.involvedChildren?.length || 0}):</h4>
                  {selectedIncident.involvedChildren && selectedIncident.involvedChildren.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedIncident.involvedChildren.map(child => (
                        <li key={child.childId} className="flex justify-between items-center bg-white p-2 border rounded-md">
                          <span className="font-medium text-sm">{child.childFullName}</span>
                          <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">{getRoleLabel(child.role)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-gray-500 italic">Không có</div>
                  )}
                </div>

                {selectedIncident.imageUrls && selectedIncident.imageUrls.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Hình ảnh đính kèm:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedIncident.imageUrls.map((url, idx) => (
                        <a key={idx} href={url} target="_blank" rel="noreferrer" className="block w-full h-24 overflow-hidden rounded-md border">
                           <img src={url} alt={`Minh chứng ${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <hr className="my-2" />

          {/* Form Xử lý */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Phản hồi từ Ban giám hiệu</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Trạng thái xử lý</label>
                <Select value={watch('status')} onValueChange={(val: any) => setValue('status', val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">Mới (Chưa xử lý)</SelectItem>
                    <SelectItem value="IN_PROGRESS">Đang xử lý</SelectItem>
                    <SelectItem value="RESOLVED">Đã giải quyết</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ghi chú (Sẽ hiển thị cho Phụ huynh và Giáo viên khi Đã giải quyết)</label>
              <Textarea 
                {...register('principalNotes')} 
                placeholder="Nhập ghi chú hoặc kết luận xử lý của BGH..." 
                className="min-h-[100px]"
              />
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
              <Button type="submit">Lưu phản hồi</Button>
            </DialogFooter>
          </form>

        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Incidents;
