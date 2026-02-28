import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface User {
    name: string;
    company?: string;
    ownerCompany?: string;
    accountType?: 'personal' | 'business';
    userType?: 'owner' | 'employee';
    role?: string;
    permissions?: {
        dashboard: boolean;
        projects: boolean;
        finances: boolean;
        commercial: boolean;
        employees: boolean;
        tasks: boolean;
        profile: boolean;
        subscription: boolean;
    };
}

export const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (open: boolean) => void }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/auth';
    };

    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/' || location.pathname === '/dashboard';
        }
        return location.pathname.startsWith(path);
    };

    const hasPermission = (key: keyof NonNullable<User['permissions']> | 'admin') => {
        if (!user) return false;
        if (key === 'admin') return user.role === 'admin';
        if (user.userType !== 'employee') return true;
        return user.permissions?.[key as any] ?? false;
    };

    if (!user) return null;

    let companyName = user.userType === 'employee' ? user.ownerCompany : user.company;
    if (companyName === 'Telegram User') {
        companyName = user.name;
    }

    const NavItem = ({ path, icon, label }: { path: string, icon: string, label: string }) => {
        const active = isActive(path);
        return (
            <Button
                variant={active ? 'default' : 'ghost'}
                className={`w-full justify-start mb-2 ${active ? '' : 'hover:bg-muted'}`}
                onClick={() => {
                    navigate(path);
                    setIsOpen(false);
                }}
            >
                <Icon name={icon as any} size={18} className="mr-3" />
                <span>{label}</span>
            </Button>
        );
    };

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />
            <aside className={`fixed md:sticky top-0 left-0 z-30 h-screen w-64 bg-white border-r shadow-sm transition-transform duration-300 md:translate-x-0 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">ПростоСтройка</h1>
                        <p className="text-xs text-muted-foreground truncate">{companyName}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsOpen(false)}>
                        <Icon name="X" size={18} />
                    </Button>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 flex flex-col">
                    {hasPermission('dashboard') && <NavItem path="/" icon="LayoutDashboard" label="Дашборд" />}
                    {hasPermission('projects') && <NavItem path="/projects" icon="Building2" label="Объекты" />}
                    {hasPermission('finances') && <NavItem path="/finances" icon="DollarSign" label="Финансы" />}
                    {hasPermission('commercial') && <NavItem path="/commercial" icon="FileText" label="КП" />}
                    {hasPermission('employees') && <NavItem path="/employees" icon="Users" label="Сотрудники" />}
                    {hasPermission('tasks') && <NavItem path="/tasks" icon="CheckSquare" label="Задачи" />}

                    <div className="mt-auto pt-4 border-t">
                        {hasPermission('admin') && <NavItem path="/admin" icon="Shield" label="Админ-панель" />}
                        {hasPermission('profile') && <NavItem path="/profile" icon="User" label="Профиль" />}
                        {hasPermission('subscription') && <NavItem path="/subscription" icon="CreditCard" label="Подписка" />}

                        <Button
                            variant="ghost"
                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 mt-2"
                            onClick={handleLogout}
                        >
                            <Icon name="LogOut" size={18} className="mr-3" />
                            <span>Выйти</span>
                        </Button>
                    </div>
                </nav>
            </aside>
        </>
    );
};
