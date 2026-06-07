import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, LogOut, KeyRound, ChevronDown } from 'lucide-react';

import { RootState } from '../../store';
import { setCredentials, logout } from '../../store/slices/authSlice';
import api from '../../config/axios.instance';
import { MeResponse, ChangePasswordRequest } from '../../types/auth';
import { ApiResponse } from '../../types/api';
import { authService } from '../../services/auth.service';

import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';

const passwordSchema = z.object({
    oldPassword: z.string().min(1, 'Mật khẩu cũ không được để trống'),
    newPassword: z.string().min(1, 'Mật khẩu mới không được để trống'),
});

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.auth);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            oldPassword: '',
            newPassword: '',
        },
    });

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const response = await api.get<ApiResponse<MeResponse>>('/api/auth/me');
                const data = response.data.data;
                if (data) {
                    dispatch(
                        setCredentials({
                            userId: data.userId,
                            username: data.username,
                            role: data.role,
                            token: localStorage.getItem('token') || '',
                        })
                    );
                }
            } catch (error) {
                console.error("Failed to fetch user info", error);
            }
        };

        if (user.token) {
            fetchMe();
        }
    }, [dispatch, user.token]);

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout API failed", error);
        } finally {
            dispatch(logout());
            navigate('/login');
        }
    };

    const onChangePasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
        try {
            setPasswordError(null);
            const requestPayload: ChangePasswordRequest = values;
            await api.put('/api/auth/change-password', requestPayload);
            setIsPasswordDialogOpen(false);
            form.reset();
            // Optional: show a success toast here
        } catch (error: any) {
            setPasswordError(error.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại.');
        }
    };

    return (
        <header className="bg-white border-b px-6 py-3 flex justify-end items-center sticky top-0 z-10">
            <div className="flex items-center space-x-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <User size={18} />
                            </div>
                            <span className="font-medium">{user.username || 'Admin'}</span>
                            <ChevronDown size={16} className="text-gray-500" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setIsPasswordDialogOpen(true)} className="cursor-pointer">
                            <KeyRound className="mr-2 h-4 w-4" />
                            <span>Đổi mật khẩu</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Đăng xuất</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Đổi mật khẩu</DialogTitle>
                        <DialogDescription>
                            Nhập mật khẩu cũ và mật khẩu mới để thay đổi.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onChangePasswordSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="oldPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mật khẩu cũ</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mật khẩu mới</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {passwordError && (
                                <div className="text-red-500 text-sm font-medium">
                                    {passwordError}
                                </div>
                            )}
                            <div className="flex justify-end space-x-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                                    Hủy
                                </Button>
                                <Button type="submit">Lưu thay đổi</Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </header>
    );
};

export default Header;