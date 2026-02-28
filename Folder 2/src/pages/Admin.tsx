import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Users, Building2, CreditCard, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import Icon from '@/components/ui/icon';

interface GlobalStats {
    totalUsers: number;
    activeSubscribers: number;
    freeUsers: number;
    totalProjects: number;
    totalEmployees: number;
}

interface UserData {
    id: number;
    name: string;
    phone: string;
    company: string | null;
    role: string;
    subscriptionActive: boolean;
    subscriptionExpiry: string | null;
    createdAt: string;
    _count: {
        projects: number;
        commercialOffers: number;
    };
}

const Admin = () => {
    const [stats, setStats] = useState<GlobalStats | null>(null);
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageCount, setPageCount] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    const { toast } = useToast();
    const navigate = useNavigate();

    // Verification check for admin role from parsing local storage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userObj = JSON.parse(storedUser);
            if (userObj.role !== 'admin') {
                navigate('/');
            }
        } else {
            navigate('/auth');
        }
    }, [navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

            const [statsRes, usersRes] = await Promise.all([
                fetch(`${API_URL}/admin/stats`, { headers }),
                fetch(`${API_URL}/admin/users?page=${page}&limit=20`, { headers })
            ]);

            if (!statsRes.ok || !usersRes.ok) {
                if (statsRes.status === 403 || usersRes.status === 403) {
                    navigate('/');
                    throw new Error('Нет доступа');
                }
                throw new Error('Ошибка загрузки данных');
            }

            const statsData = await statsRes.json();
            const usersData = await usersRes.json();

            setStats(statsData);
            setUsers(usersData.users);
            setPageCount(usersData.pageCount);
            setTotalUsers(usersData.total);

        } catch (error: any) {
            toast({
                title: 'Ошибка',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page]);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground animate-pulse">Загрузка данных панели...</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col space-y-6 lg:px-8 px-4 py-8">
            <div className="flex flex-col mb-4">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Панель управления</h1>
                <p className="text-muted-foreground mt-1">Оставайтесь в курсе всех метрик платформы</p>
            </div>

            {/* Stats Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Аккаунтов создано
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">С Подпиской</CardTitle>
                        <CreditCard className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.activeSubscribers || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Оплатили тариф
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Бесплатный тариф</CardTitle>
                        <Shield className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.freeUsers || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Используют триал/ограничения
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Объектов & Сотрудников</CardTitle>
                        <Building2 className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalProjects || 0} / {stats?.totalEmployees || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Записей в системе
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Users Table */}
            <div className="flex flex-col space-y-4 pt-4 flex-1">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold">Список пользователей ({totalUsers})</h2>
                </div>
                <div className="rounded-xl border bg-white shadow-sm overflow-hidden flex-1 flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Имя / Компания</th>
                                    <th className="px-6 py-4 font-medium">Телефон</th>
                                    <th className="px-6 py-4 font-medium">Подписка</th>
                                    <th className="px-6 py-4 font-medium">Объекты</th>
                                    <th className="px-6 py-4 font-medium">КП</th>
                                    <th className="px-6 py-4 font-medium">Регистрация</th>
                                    <th className="px-6 py-4 font-medium text-right">Роль</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">{u.name}</div>
                                            {u.company && <div className="text-xs text-muted-foreground">{u.company}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{u.phone}</td>
                                        <td className="px-6 py-4">
                                            {u.subscriptionActive ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Активна
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    Нет подписки
                                                </span>
                                            )}
                                            {u.subscriptionExpiry && (
                                                <div className="text-[10px] text-muted-foreground mt-1">
                                                    до {new Date(u.subscriptionExpiry).toLocaleDateString()}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-muted-foreground">
                                                <Icon name="Building2" size={14} className="mr-1.5" />
                                                {u._count.projects}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-muted-foreground">
                                                <Icon name="FileText" size={14} className="mr-1.5" />
                                                {u._count.commercialOffers}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {u.role === 'admin' ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded bg-purple-100 text-purple-800 text-xs font-semibold">Админ</span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs font-medium">Пользователь</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                                            Пользователи не найдены
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="px-6 py-4 border-t flex items-center justify-between bg-white mt-auto">
                        <span className="text-sm text-muted-foreground">
                            Страница <span className="font-medium text-gray-900">{page}</span> из <span className="font-medium text-gray-900">{pageCount}</span>
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Назад
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                                disabled={page === pageCount}
                            >
                                Вперед <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
