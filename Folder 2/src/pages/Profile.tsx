import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { companyUsersService, CompanyUser } from '@/services/company-users.service';

const Profile = () => {
    const [user, setUser] = useState<any>(null);
    const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
    const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<CompanyUser | null>(null);
    const [isEditPermissionsOpen, setIsEditPermissionsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            loadCompanyUsers();
        }
    }, []);

    const loadCompanyUsers = async () => {
        try {
            const users = await companyUsersService.getAll();
            setCompanyUsers(users);
        } catch (error) {
            // Ignore error for users without permission
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/auth';
    };

    const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        try {
            setLoading(true);
            const newUser = await companyUsersService.create({
                name: formData.get('name') as string,
                phone: formData.get('phone') as string,
                password: formData.get('password') as string,
                role: formData.get('role') as string,
            });

            setCompanyUsers([...companyUsers, newUser]);
            setIsAddUserDialogOpen(false);
            toast({ title: 'Пользователь добавлен', description: `${newUser.name} успешно добавлен` });
        } catch (error: any) {
            toast({
                title: 'Ошибка',
                description: error.response?.data?.message || 'Не удалось добавить пользователя',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePermissions = async (userId: number, updates: Partial<CompanyUser>) => {
        try {
            const updated = await companyUsersService.update(userId, updates);
            setCompanyUsers(companyUsers.map(u => u.id === userId ? updated : u));
            if (editingUser?.id === userId) {
                setEditingUser(updated);
            }
        } catch (error) {
            toast({ title: 'Ошибка', description: 'Не удалось обновить права', variant: 'destructive' });
        }
    };

    const handleRemoveUser = async (userId: number) => {
        try {
            await companyUsersService.remove(userId);
            setCompanyUsers(companyUsers.filter(u => u.id !== userId));
            toast({ title: 'Пользователь удалён' });
        } catch (error) {
            toast({ title: 'Ошибка', description: 'Не удалось удалить пользователя', variant: 'destructive' });
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Загрузка...</p>
            </div>
        );
    }

    // Company users (employees) cannot see this section
    if (user.userType === 'employee') {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold">Профиль</h2>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-6 mb-6">
                            <Avatar className="h-24 w-24">
                                <AvatarFallback className="text-3xl bg-primary text-white">
                                    {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h3 className="text-2xl font-semibold">{user.name}</h3>
                                <p className="text-muted-foreground">{user.ownerCompany}</p>
                                <Badge className="mt-2">{user.role}</Badge>
                            </div>
                            <Button variant="outline" onClick={handleLogout}>
                                <Icon name="LogOut" size={18} className="mr-2" />
                                Выйти
                            </Button>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Телефон</label>
                            <p className="text-muted-foreground">{user.phone}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const initials = user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U';

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Профиль</h2>
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-6 mb-6">
                        <Avatar className="h-24 w-24">
                            <AvatarFallback className="text-3xl bg-primary text-white">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h3 className="text-2xl font-semibold">{user.name}</h3>
                            <p className="text-muted-foreground">{user.company}</p>
                            {user.subscriptionActive ? (
                                <Badge className="bg-green-500 mt-2">
                                    <Icon name="Check" size={14} className="mr-1" />
                                    Подписка активна
                                </Badge>
                            ) : (
                                <Badge variant="destructive" className="mt-2">
                                    <Icon name="X" size={14} className="mr-1" />
                                    Подписка не активна
                                </Badge>
                            )}
                        </div>
                        <Button variant="outline" onClick={handleLogout}>
                            <Icon name="LogOut" size={18} className="mr-2" />
                            Выйти
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium">Телефон</label>
                            <p className="text-muted-foreground">{user.phone}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Тип аккаунта</label>
                            <p className="text-muted-foreground">
                                {user.accountType === 'personal' ? 'Личный ремонт' : 'Бизнес'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Company Users Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Пользователи компании</CardTitle>
                        <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Icon name="UserPlus" size={16} className="mr-2" />
                                    Добавить пользователя
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Добавить пользователя</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleAddUser} className="space-y-4">
                                    <div>
                                        <Label htmlFor="userName">ФИО *</Label>
                                        <Input id="userName" name="name" placeholder="Иван Петров" required />
                                    </div>
                                    <div>
                                        <Label htmlFor="userPhone">Телефон *</Label>
                                        <Input id="userPhone" name="phone" type="tel" placeholder="+7 (999) 123-45-67" required />
                                    </div>
                                    <div>
                                        <Label htmlFor="userPassword">Пароль *</Label>
                                        <Input id="userPassword" name="password" type="password" placeholder="Пароль для входа" required />
                                    </div>
                                    <div>
                                        <Label htmlFor="userRole">Должность *</Label>
                                        <Input id="userRole" name="role" placeholder="Менеджер" required />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? 'Добавление...' : 'Добавить'}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {/* Owner */}
                        <div className="p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-primary text-white text-sm">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{user.name}</p>
                                        <p className="text-sm text-muted-foreground">Владелец</p>
                                    </div>
                                </div>
                                <Badge>Полный доступ</Badge>
                            </div>
                        </div>

                        {/* Company Users */}
                        {companyUsers.map(companyUser => (
                            <div key={companyUser.id} className="p-4 bg-muted rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-secondary text-white text-sm">
                                                {companyUser.name.split(' ').map((n: string) => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{companyUser.name}</p>
                                            <p className="text-sm text-muted-foreground">{companyUser.role}</p>
                                            <p className="text-xs text-muted-foreground">{companyUser.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setEditingUser(companyUser);
                                                setIsEditPermissionsOpen(true);
                                            }}
                                        >
                                            <Icon name="Settings" size={14} className="mr-1" />
                                            Права
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleRemoveUser(companyUser.id)}
                                        >
                                            <Icon name="Trash2" size={14} />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs">
                                    {companyUser.canDashboard && <Badge variant="secondary">Дашборд</Badge>}
                                    {companyUser.canProjects && <Badge variant="secondary">Объекты</Badge>}
                                    {companyUser.canFinances && <Badge variant="secondary">Финансы</Badge>}
                                    {companyUser.canCommercial && <Badge variant="secondary">КП</Badge>}
                                    {companyUser.canEmployees && <Badge variant="secondary">Сотрудники</Badge>}
                                    {companyUser.canTasks && <Badge variant="secondary">Задачи</Badge>}
                                    {companyUser.canProfile && <Badge variant="secondary">Профиль</Badge>}
                                </div>
                            </div>
                        ))}

                        {companyUsers.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <Icon name="Users" size={40} className="mx-auto mb-3 opacity-50" />
                                <p>Пользователи не добавлены</p>
                                <p className="text-sm">Добавьте членов команды с доступом к системе</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Edit Permissions Dialog */}
            <Dialog open={isEditPermissionsOpen} onOpenChange={setIsEditPermissionsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Права доступа: {editingUser?.name}</DialogTitle>
                    </DialogHeader>
                    {editingUser && (
                        <div className="space-y-4">
                            <div className="space-y-3">
                                {[
                                    { key: 'canDashboard', label: 'Дашборд', icon: 'LayoutDashboard' },
                                    { key: 'canProjects', label: 'Объекты', icon: 'Building2' },
                                    { key: 'canFinances', label: 'Финансы', icon: 'DollarSign' },
                                    { key: 'canCommercial', label: 'Коммерческие предложения', icon: 'FileText' },
                                    { key: 'canEmployees', label: 'Сотрудники', icon: 'Users' },
                                    { key: 'canTasks', label: 'Задачи', icon: 'CheckSquare' },
                                    { key: 'canProfile', label: 'Профиль компании', icon: 'User' },
                                    { key: 'canSubscription', label: 'Подписка', icon: 'CreditCard' },
                                ].map(({ key, label, icon }) => (
                                    <div key={key} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Icon name={icon as any} size={18} className="text-muted-foreground" />
                                            <Label htmlFor={`perm-${key}`} className="cursor-pointer">{label}</Label>
                                        </div>
                                        <Checkbox
                                            id={`perm-${key}`}
                                            checked={(editingUser as any)[key]}
                                            onCheckedChange={(checked) => {
                                                handleUpdatePermissions(editingUser.id, { [key]: checked });
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <Button
                                className="w-full"
                                onClick={() => setIsEditPermissionsOpen(false)}
                            >
                                Готово
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Profile;
