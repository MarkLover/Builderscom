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

export const AppHeader = () => {
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
    return location.pathname === path;
  };

  // Check if user has permission (owners have all permissions)
  const hasPermission = (key: keyof NonNullable<User['permissions']>) => {
    if (!user) return false;
    if (user.userType !== 'employee') return true; // Owners have all permissions
    return user.permissions?.[key] ?? false;
  };

  if (!user) return null;

  const companyName = user.userType === 'employee' ? user.ownerCompany : user.company;

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">ПростоСтройка</h1>
            <p className="text-xs text-muted-foreground">{companyName}</p>
          </div>

          <nav className="flex gap-1 items-center flex-wrap">
            {hasPermission('dashboard') && (
              <Button
                variant={isActive('/') ? 'default' : 'ghost'}
                onClick={() => navigate('/')}
                className="max-md:flex-row-reverse"
              >
                <Icon name="LayoutDashboard" size={18} className="md:mr-2" />
                <span className="max-md:hidden">Дашборд</span>
              </Button>
            )}

            {hasPermission('projects') && (
              <Button
                variant={isActive('/projects') ? 'default' : 'ghost'}
                onClick={() => navigate('/projects')}
                className="max-md:flex-row-reverse"
              >
                <Icon name="Building2" size={18} className="md:mr-2" />
                <span className="max-md:hidden">Объекты</span>
              </Button>
            )}

            {hasPermission('finances') && (
              <Button
                variant={isActive('/finances') ? 'default' : 'ghost'}
                onClick={() => navigate('/finances')}
                className="max-md:flex-row-reverse"
              >
                <Icon name="DollarSign" size={18} className="md:mr-2" />
                <span className="max-md:hidden">Финансы</span>
              </Button>
            )}

            {hasPermission('commercial') && (
              <Button
                variant={isActive('/commercial') ? 'default' : 'ghost'}
                onClick={() => navigate('/commercial')}
                className="max-md:flex-row-reverse"
              >
                <Icon name="FileText" size={18} className="md:mr-2" />
                <span className="max-md:hidden">КП</span>
              </Button>
            )}

            {hasPermission('employees') && (
              <Button
                variant={isActive('/employees') ? 'default' : 'ghost'}
                onClick={() => navigate('/employees')}
                className="max-md:flex-row-reverse"
              >
                <Icon name="Users" size={18} className="md:mr-2" />
                <span className="max-md:hidden">Сотрудники</span>
              </Button>
            )}

            {hasPermission('tasks') && (
              <Button
                variant={isActive('/tasks') ? 'default' : 'ghost'}
                onClick={() => navigate('/tasks')}
                className="max-md:flex-row-reverse"
              >
                <Icon name="CheckSquare" size={18} className="md:mr-2" />
                <span className="max-md:hidden">Задачи</span>
              </Button>
            )}

            {hasPermission('profile') && (
              <Button
                variant={isActive('/profile') ? 'default' : 'ghost'}
                onClick={() => navigate('/profile')}
                className="max-md:flex-row-reverse"
              >
                <Icon name="User" size={18} className="md:mr-2" />
                <span className="max-md:hidden">Профиль</span>
              </Button>
            )}

            {hasPermission('subscription') && (
              <Button
                variant={isActive('/subscription') ? 'default' : 'ghost'}
                onClick={() => navigate('/subscription')}
                className="max-md:flex-row-reverse"
              >
                <Icon name="CreditCard" size={18} className="md:mr-2" />
                <span className="max-md:hidden">Подписка</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="ml-2"
            >
              <Icon name="LogOut" size={18} />
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};