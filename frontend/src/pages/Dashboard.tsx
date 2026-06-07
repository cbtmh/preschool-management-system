import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, School, BookOpen, Loader2 } from 'lucide-react';
import { dashboardService, DashboardStatisticsResponse } from '../services/dashboard.service';

const Dashboard = () => {
    const [stats, setStats] = useState<DashboardStatisticsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await dashboardService.getStatistics();
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard statistics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tổng quan</h1>
            
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white/50 backdrop-blur-sm border-blue-100 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Tổng số Học sinh
                        </CardTitle>
                        <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats?.totalStudents || 0}</div>
                        <p className="text-xs text-green-600 font-medium mt-1">
                            +12% so với năm trước
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white/50 backdrop-blur-sm border-indigo-100 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Tổng số Lớp học
                        </CardTitle>
                        <School className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats?.totalClasses || 0}</div>
                        <p className="text-xs text-indigo-600 font-medium mt-1">
                            Hoạt động ổn định
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white/50 backdrop-blur-sm border-orange-100 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Tổng số Giáo viên
                        </CardTitle>
                        <BookOpen className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats?.totalTeachers || 0}</div>
                        <p className="text-xs text-green-600 font-medium mt-1">
                            +4 giáo viên mới
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
