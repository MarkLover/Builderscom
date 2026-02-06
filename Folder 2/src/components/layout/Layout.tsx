import { Outlet, useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';
import { useEffect, useState } from 'react';

export const Layout = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/auth');
        } else {
            setIsLoading(false);
        }
    }, [navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-muted-foreground">Загрузка...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AppHeader />
            <main className="container mx-auto py-8 px-4">
                <Outlet />
            </main>
        </div>
    );
};
