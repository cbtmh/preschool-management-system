import React, { useState, useRef } from 'react';
import { Download, UploadCloud, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => void;
  onDownloadTemplate: () => void;
  title: string;
  isLoading: boolean;
}

export const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
  isOpen,
  onClose,
  onImport,
  onDownloadTemplate,
  title,
  isLoading,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.name.endsWith('.xlsx')) {
        setSelectedFile(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onImport(selectedFile);
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-500">
              Vui lòng tải xuống file mẫu, điền dữ liệu theo đúng định dạng các cột (Tên Học Sinh | Ngày Sinh | Giới Tính | Tên Phụ Huynh | SĐT Phụ Huynh | Địa Chỉ) và tải lên lại. Không thêm bớt các cột trong file mẫu.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={onDownloadTemplate}
              className="w-fit"
            >
              <Download className="mr-2 h-4 w-4" />
              Tải file mẫu (.xlsx)
            </Button>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors ${
              selectedFile ? 'border-primary/50 bg-primary/5' : 'border-gray-300 hover:border-primary/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {selectedFile ? (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-primary">
                  <UploadCloud className="h-8 w-8" />
                  <span className="font-medium text-sm">{selectedFile.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  className="h-8 text-xs text-muted-foreground mt-2"
                >
                  <X className="mr-1 h-3 w-3" />
                  Xóa file
                </Button>
              </div>
            ) : (
              <>
                <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Kéo và thả file Excel vào đây
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Hoặc click để chọn file (.xlsx)
                </p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="hidden"
                  onChange={handleFileChange}
                  id="excel-upload"
                />
                <label htmlFor="excel-upload">
                  <Button type="button" variant="secondary" className="cursor-pointer" asChild>
                    <span>Chọn file</span>
                  </Button>
                </label>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedFile || isLoading}
          >
            {isLoading ? 'Đang xử lý...' : 'Tiến hành Nhập dữ liệu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
