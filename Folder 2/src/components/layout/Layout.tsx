import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useOnboarding } from '@/components/layout/useOnboarding';

export const Layout = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useOnboarding();

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
        <div className="flex bg-gray-50 font-sans h-screen overflow-hidden">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Mobile Header Toggle */}
                <header className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10 w-full shrink-0">
                    <div className="flex items-center">
                        <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(true)} className="-ml-2">
                            <Icon name="Menu" size={20} />
                        </Button>
                        <h1 className="text-lg font-bold text-primary ml-2">ПростоСтройка</h1>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
