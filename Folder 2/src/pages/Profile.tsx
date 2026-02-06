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

const Profile = () => {
    const [user, setUser] = useState<any>(null);
    const [companyUsers, setCompanyUsers] = useState<any[]>([]);
    const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [isEditPermissionsOpen, setIsEditPermissionsOpen] = useState(false);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);

            const savedCompanyUsers = localStorage.getItem(`company_users_${parsedUser.phone}`);
            if (savedCompanyUsers) {
                setCompanyUsers(JSON.parse(savedCompanyUsers));
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/auth';
    };

    const handleAddUser = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const newUser = {
            id: Date.now(),
            name: formData.get('name') as string,
            phone: formData.get('phone') as string,
            role: formData.get('role') as string,
            permissions: {
                dashboard: true,
                projects: true,
                finances: false,
                commercial: false,
                employees: false,
                tasks: true,
                profile: false
            },
            addedDate: new Date().toLocaleDateString('ru-RU'),
            isOwner: false
        };

        const updatedUsers = [...companyUsers, newUser];
        setCompanyUsers(updatedUsers);
        localStorage.setItem(`company_users_${user.phone}`, JSON.stringify(updatedUsers));
        setIsAddUserDialogOpen(false);
    };

    const handleUpdatePermissions = (userId: number, permissions: any) => {
        const updatedUsers = companyUsers.map(u =>
            u.id === userId ? { ...u, permissions } : u
        );
        setCompanyUsers(updatedUsers);
        localStorage.setItem(`company_users_${user.phone}`, JSON.stringify(updatedUsers));
    };

    const handleRemoveUser = (userId: number) => {
        const updatedUsers = companyUsers.filter(u => u.id !== userId);
        setCompanyUsers(updatedUsers);
        localStorage.setItem(`company_users_${user.phone}`, JSON.stringify(updatedUsers));
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Загрузка...</p>
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
                            {user.accountType === 'business' && (
                                <div className="mt-2">
                                    {user.subscriptionActive ? (
                                        <Badge className="bg-green-500">
                                            <Icon name="Check" size={14} className="mr-1" />
                                            Подписка активна
                                        </Badge>
                                    ) : (
                                        <Badge variant="destructive">
                                            <Icon name="X" size={14} className="mr-1" />
                                            Подписка не активна
                                        </Badge>
                                    )}
                                </div>
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

                    {(user.telegram || user.instagram || user.vk || user.website) && (
                        <>
                            <div className="border-t my-6"></div>
                            <div>
                                <h4 className="text-sm font-medium mb-4">Рабочие страницы</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {user.telegram && (
                                        <div>
                                            <label className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Icon name="Send" size={14} />
                                                Telegram
                                            </label>
                                            <a
                                                href={`https://t.me/${user.telegram.replace('@', '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline"
                                            >
                                                {user.telegram}
                                            </a>
                                        </div>
                                    )}
                                    {user.website && (
                                        <div>
                                            <label className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Icon name="Globe" size={14} />
                                                Сайт
                                            </label>
                                            <a
                                                href={user.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline"
                                            >
                                                {user.website}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {user.accountType === 'business' && (
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
                                            <Label htmlFor="userRole">Должность *</Label>
                                            <Input id="userRole" name="role" placeholder="Менеджер" required />
                                        </div>
                                        <Button type="submit" className="w-full">Добавить</Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
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
                                        {(Object.entries(companyUser.permissions) as [string, boolean][]).map(([key, value]) => (
                                            value && (
                                                <Badge key={key} variant="secondary" className="text-xs">
                                                    {key === 'dashboard' && 'Дашборд'}
                                                    {key === 'projects' && 'Объекты'}
                                                    {key === 'finances' && 'Финансы'}
                                                    {key === 'commercial' && 'КП'}
                                                    {key === 'employees' && 'Сотрудники'}
                                                    {key === 'tasks' && 'Задачи'}
                                                    {key === 'profile' && 'Профиль'}
                                                </Badge>
                                            )
                                        ))}
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
            )}

            <Dialog open={isEditPermissionsOpen} onOpenChange={setIsEditPermissionsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Права доступа: {editingUser?.name}</DialogTitle>
                    </DialogHeader>
                    {editingUser && (
                        <div className="space-y-4">
                            <div className="space-y-3">
                                {[
                                    { key: 'dashboard', label: 'Дашборд', icon: 'LayoutDashboard' },
                                    { key: 'projects', label: 'Объекты', icon: 'Building2' },
                                    { key: 'finances', label: 'Финансы', icon: 'DollarSign' },
                                    { key: 'commercial', label: 'Коммерческие предложения', icon: 'FileText' },
                                    { key: 'employees', label: 'Сотрудники', icon: 'Users' },
                                    { key: 'tasks', label: 'Задачи', icon: 'CheckSquare' },
                                    { key: 'profile', label: 'Профиль компании', icon: 'User' }
                                ].map(({ key, label, icon }) => (
                                    <div key={key} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Icon name={icon as any} size={18} className="text-muted-foreground" />
                                            <Label htmlFor={`perm-${key}`} className="cursor-pointer">{label}</Label>
                                        </div>
                                        <Checkbox
                                            id={`perm-${key}`}
                                            checked={editingUser.permissions[key]}
                                            onCheckedChange={(checked) => {
                                                const newPermissions = { ...editingUser.permissions, [key]: checked };
                                                setEditingUser({ ...editingUser, permissions: newPermissions });
                                                handleUpdatePermissions(editingUser.id, newPermissions);
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
