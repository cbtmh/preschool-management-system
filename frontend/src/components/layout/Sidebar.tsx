import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, School, Settings, ChevronLeft, ChevronRight, Menu, CalendarDays, Library, Coffee, Newspaper, Bell, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

const navItems = [
    { name: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Năm học', href: '/academic-years', icon: CalendarDays },
    { name: 'Lớp học', href: '/classes', icon: Library },
    { name: 'Giáo viên', href: '/teachers', icon: Users },
    { name: 'Phụ huynh', href: '/parents', icon: Users },
    { name: 'Học sinh', href: '/students', icon: School },
    { name: 'Suất ăn', href: '/meals', icon: Coffee },
    { name: 'Tin tức', href: '/manage-news', icon: Newspaper },
    { name: 'Thông báo', href: '/manage-notifications', icon: Bell },
    { name: 'Sự việc', href: '/incidents', icon: AlertTriangle },
    { name: 'Báo cáo', href: '/reports', icon: Library },
];

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside className={cn(
            "bg-slate-900 text-white transition-all duration-300 flex flex-col min-h-screen",
            collapsed ? "w-16" : "w-64"
        )}>
            <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
                {!collapsed && <span className="font-bold text-lg truncate">Preschool Admin</span>}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setCollapsed(!collapsed)}
                    className="text-white hover:bg-slate-800 rounded-md shrink-0"
                >
                    {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                </Button>
            </div>
            
            <nav className="flex-1 py-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.href}
                        to={item.href}
                        className={({ isActive }) => cn(
                            "flex items-center px-4 py-3 text-sm transition-colors",
                            isActive ? "bg-slate-800 text-white border-l-4 border-blue-500" : "text-slate-300 hover:bg-slate-800 hover:text-white border-l-4 border-transparent",
                            collapsed && "justify-center px-0 border-l-0"
                        )}
                        title={collapsed ? item.name : undefined}
                    >
                        <item.icon size={20} className={cn(!collapsed && "mr-3")} />
                        {!collapsed && <span>{item.name}</span>}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;