import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Icon from '@/components/ui/icon';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { employeesService } from '@/services/employees.service';

interface Task {
    id: number;
    title: string;
    status: string;
}

interface Employee {
    id: number;
    name: string;
    role: string;
    phone?: string;
    telegram?: string;
    whatsapp?: string;
    max?: string;
    tasks: Task[];
    status: string;
}

const Employees = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);
    const [showArchivedEmployees, setShowArchivedEmployees] = useState(false);

    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const isFreeUser = user && !user.subscriptionActive;

    // Fetch employees from API
    const { data: employees = [], isLoading } = useQuery({
        queryKey: ['employees'],
        queryFn: employeesService.getAll,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: employeesService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            setIsEmployeeDialogOpen(false);
            toast({ title: 'Сотрудник добавлен', description: 'Новый сотрудник успешно создан' });
        },
        onError: () => {
            toast({ title: 'Ошибка', description: 'Не удалось добавить сотрудника', variant: 'destructive' });
        }
    });

    const updateMutation = useMutation({
        mutationFn: employeesService.update,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            toast({ title: 'Обновлено', description: 'Статус сотрудника изменён' });
        },
        onError: () => {
            toast({ title: 'Ошибка', description: 'Не удалось обновить сотрудника', variant: 'destructive' });
        }
    });

    const handleAddEmployee = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        createMutation.mutate({
            name: formData.get('name') as string,
            role: formData.get('role') as string,
            phone: formData.get('phone') as string,
            telegram: formData.get('telegram') as string,
            whatsapp: formData.get('whatsapp') as string,
            max: formData.get('max') as string,
        });
    };

    const handleToggleArchive = (employee: Employee) => {
        const newStatus = employee.status === 'archived' ? 'active' : 'archived';
        updateMutation.mutate({ id: employee.id, data: { status: newStatus } });
    };

    const displayedEmployees = showArchivedEmployees
        ? employees.filter((e: Employee) => e.status === 'archived')
        : employees.filter((e: Employee) => e.status !== 'archived');

    if (isLoading) return <div className="flex justify-center p-8">Загрузка...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold">Сотрудники</h2>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowArchivedEmployees(!showArchivedEmployees)}
                    >
                        <Icon name="Archive" size={16} className="mr-2" />
                        {showArchivedEmployees ? 'Активные' : 'Архив'}
                    </Button>
                </div>
                {isFreeUser && displayedEmployees.length >= 10 ? (
                    <Dialog open={showPaywall} onOpenChange={setShowPaywall}>
                        <DialogTrigger asChild>
                            <Button>
                                <Icon name="Lock" size={18} className="mr-2" />
                                Добавить
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Превышен лимит сотрудников</DialogTitle>
                                <p className="text-sm text-muted-foreground mt-2">
                                    В бесплатной версии вы можете добавить до 10 сотрудников.
                                </p>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                                <p className="text-sm font-medium">Оформите подписку, чтобы добавить неограниченное количество сотрудников.</p>
                                <Button className="w-full" onClick={() => window.location.href = '/profile'}>
                                    {user?.hasUsedTrial ? 'Перейти на платный (10 ₽ - ТЕСТ)' : 'Попробовать 7 дней за 1 ₽'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                ) : (
                    <Dialog open={isEmployeeDialogOpen} onOpenChange={setIsEmployeeDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Icon name="UserPlus" size={18} className="mr-2" />
                                Добавить
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Добавить сотрудника</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddEmployee} className="space-y-4">
                                <div>
                                    <Label htmlFor="empName">ФИО</Label>
                                    <Input id="empName" name="name" placeholder="Иван Иванов" required />
                                </div>
                                <div>
                                    <Label htmlFor="role">Должность</Label>
                                    <Input id="role" name="role" placeholder="Прораб" required />
                                </div>
                                <div>
                                    <Label htmlFor="phone">Телефон</Label>
                                    <Input id="phone" name="phone" type="tel" placeholder="+7 (999) 123-45-67" />
                                </div>
                                <div>
                                    <Label htmlFor="telegram">Telegram</Label>
                                    <Input id="telegram" name="telegram" placeholder="@username" />
                                </div>
                                <div>
                                    <Label htmlFor="whatsapp">WhatsApp</Label>
                                    <Input id="whatsapp" name="whatsapp" type="tel" placeholder="+79991234567" />
                                </div>
                                <div>
                                    <Label htmlFor="max">MAX</Label>
                                    <Input id="max" name="max" placeholder="@max_username" />
                                </div>
                                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                                    {createMutation.isPending ? 'Добавление...' : 'Добавить сотрудника'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {displayedEmployees.length === 0 && (
                <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-dashed">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4 py-12">
                            <div className="flex justify-center">
                                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Icon name="Users" size={40} className="text-primary" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">{showArchivedEmployees ? 'Архив пуст' : 'Нет сотрудников'}</h3>
                                <p className="text-muted-foreground">
                                    {showArchivedEmployees
                                        ? 'Архивированные сотрудники будут отображаться здесь'
                                        : 'Добавьте сотрудников вашей команды с контактами'}
                                </p>
                            </div>
                            {!showArchivedEmployees && (
                                <Button onClick={() => setIsEmployeeDialogOpen(true)} size="lg">
                                    <Icon name="UserPlus" size={18} className="mr-2" />
                                    Добавить первого сотрудника
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {displayedEmployees.map((employee: Employee) => (
                    <Card key={employee.id}>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center space-y-4 relative">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-0 right-0"
                                    onClick={() => handleToggleArchive(employee)}
                                >
                                    <Icon name={employee.status === 'archived' ? "ArchiveRestore" : "Archive"} size={16} />
                                </Button>
                                <Avatar className="h-20 w-20">
                                    <AvatarFallback className="text-2xl bg-primary text-white">
                                        {employee.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold text-lg">{employee.name}</h3>
                                    <p className="text-sm text-muted-foreground">{employee.role}</p>
                                </div>
                                <Badge variant="secondary">
                                    {employee.tasks?.length || 0} {(employee.tasks?.length || 0) === 1 ? 'задача' : 'задач'}
                                </Badge>

                                {(employee.phone || employee.telegram || employee.whatsapp || employee.max) && (
                                    <div className="w-full space-y-2 pt-2 border-t">
                                        {employee.phone && (
                                            <a
                                                href={`tel:${employee.phone}`}
                                                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                <Icon name="Phone" size={14} />
                                                <span>{employee.phone}</span>
                                            </a>
                                        )}
                                        {employee.telegram && (
                                            <a
                                                href={`https://t.me/${employee.telegram.replace('@', '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                <Icon name="Send" size={14} />
                                                <span>{employee.telegram}</span>
                                            </a>
                                        )}
                                        {employee.whatsapp && (
                                            <a
                                                href={`https://wa.me/${employee.whatsapp.replace(/[^0-9]/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                <Icon name="MessageCircle" size={14} />
                                                <span>{employee.whatsapp}</span>
                                            </a>
                                        )}
                                        {employee.max && (
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Icon name="AtSign" size={14} />
                                                <span>{employee.max}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Employees;
