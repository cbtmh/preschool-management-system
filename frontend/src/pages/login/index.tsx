import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import api from '../../config/axios.instance';
import { LoginRequest, AuthResponse } from '../../types/auth';
import { ApiResponse } from '../../types/api';

import { Button } from '../../components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';

const formSchema = z.object({
    username: z.string().min(1, 'Số điện thoại không được để trống'),
    password: z.string().min(1, 'Mật khẩu không được để trống'),
});

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    });

    useEffect(() => {
        const isSessionExpired = localStorage.getItem('sessionExpired');
        if (isSessionExpired) {
            setErrorMsg('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
            localStorage.removeItem('sessionExpired');
        }
    }, []);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setErrorMsg(null);
            const requestPayload: LoginRequest = values;
            
            const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/login', requestPayload);
            const data = response.data;
            
            if (data && data.data) {
                dispatch(
                    setCredentials({
                        userId: data.data.userId,
                        username: data.data.username,
                        role: data.data.role,
                        token: data.data.token,
                        requiresPasswordChange: data.data.requiresPasswordChange,
                    })
                );
                navigate('/dashboard');
            }
        } catch (error: any) {
            if (error.response?.status === 401) {
                setErrorMsg('Sai số điện thoại hoặc mật khẩu');
            } else if (error.response?.status === 404) {
                setErrorMsg('Tài khoản không tồn tại');
            } else if (error.message === 'Network Error') {
                setErrorMsg('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
            } else {
                setErrorMsg(error.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.');
            }
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Đăng nhập</CardTitle>
                    <CardDescription className="text-center">
                        Hệ thống quản lý trường mầm non
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Số điện thoại</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nhập số điện thoại" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mật khẩu</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Nhập mật khẩu" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {errorMsg && (
                                <div className="text-red-500 text-sm font-medium text-center">
                                    {errorMsg}
                                </div>
                            )}
                            <Button type="submit" className="w-full">
                                Đăng nhập
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;
