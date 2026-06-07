import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Bell, Lock, User, MonitorSmartphone } from 'lucide-react';

const Settings = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="space-y-0.5">
        <h2 className="text-3xl font-bold tracking-tight">Cài đặt</h2>
        <p className="text-muted-foreground">
          Quản lý cài đặt tài khoản và tùy chọn hệ thống của bạn.
        </p>
      </div>
      
      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="bg-slate-100/50 p-1 rounded-lg">
          <TabsTrigger value="account" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 flex items-center gap-2">
            <User size={16} />
            Tài khoản
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 flex items-center gap-2">
            <MonitorSmartphone size={16} />
            Hệ thống
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 flex items-center gap-2">
            <Bell size={16} />
            Thông báo
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 flex items-center gap-2">
            <Lock size={16} />
            Bảo mật
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Hồ sơ cá nhân</CardTitle>
              <CardDescription>Cập nhật thông tin cá nhân của bạn.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Họ</Label>
                  <Input id="firstName" defaultValue="Nguyễn Văn" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Tên</Label>
                  <Input id="lastName" defaultValue="A" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="admin@preschool.edu.vn" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input id="phone" defaultValue="0901234567" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button className="bg-blue-600 hover:bg-blue-700">Lưu thay đổi</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Cài đặt hệ thống</CardTitle>
              <CardDescription>Cấu hình các thông số chung của trường mầm non.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="schoolName">Tên trường</Label>
                <Input id="schoolName" defaultValue="Trường Mầm Non Hướng Dương" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="academicYear">Năm học hiện tại</Label>
                <Input id="academicYear" defaultValue="2023 - 2024" />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="maintenance" className="flex flex-col space-y-1">
                  <span>Chế độ bảo trì</span>
                  <span className="font-normal text-sm text-muted-foreground">Tạm dừng truy cập từ phụ huynh và giáo viên.</span>
                </Label>
                <Switch id="maintenance" />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button className="bg-blue-600 hover:bg-blue-700">Lưu cấu hình</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Tùy chọn thông báo</CardTitle>
              <CardDescription>Chọn loại thông báo bạn muốn nhận.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="emailNotif" className="flex flex-col space-y-1">
                  <span>Thông báo qua Email</span>
                  <span className="font-normal text-sm text-muted-foreground">Nhận email khi có thông báo mới.</span>
                </Label>
                <Switch id="emailNotif" defaultChecked />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="pushNotif" className="flex flex-col space-y-1">
                  <span>Thông báo đẩy (Push)</span>
                  <span className="font-normal text-sm text-muted-foreground">Nhận thông báo trực tiếp trên trình duyệt.</span>
                </Label>
                <Switch id="pushNotif" defaultChecked />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="smsNotif" className="flex flex-col space-y-1">
                  <span>Thông báo SMS</span>
                  <span className="font-normal text-sm text-muted-foreground">Nhận tin nhắn SMS cho các sự kiện quan trọng.</span>
                </Label>
                <Switch id="smsNotif" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="border-slate-200 shadow-sm border-red-100">
            <CardHeader>
              <CardTitle>Đổi mật khẩu</CardTitle>
              <CardDescription>Đảm bảo tài khoản của bạn luôn an toàn.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <Input id="confirmPassword" type="password" />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button variant="destructive">Cập nhật mật khẩu</Button>
            </CardFooter>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default Settings;
