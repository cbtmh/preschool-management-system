import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setRequiresPasswordChange } from '../../store/slices/authSlice';
import { ForceChangePasswordModal } from '../ForceChangePasswordModal';

const AdminLayout = () => {
    const auth = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();

    return (
        <div className="flex h-screen bg-gray-100">
            <ForceChangePasswordModal 
                isOpen={!!auth.requiresPasswordChange} 
                onSuccess={() => {
                    dispatch(setRequiresPasswordChange(false));
                }} 
            />
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;