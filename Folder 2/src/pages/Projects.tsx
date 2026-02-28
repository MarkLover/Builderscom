import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Icon from '@/components/ui/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MoneyInput } from '@/components/ui/MoneyInput';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { projectsService } from '@/services/projects.service';
import { usePageOnboarding } from '@/components/layout/useOnboarding';
import { DriveStep } from 'driver.js';

interface Transaction {
    id: number;
    type: string;
    amount: number;
    category: string;
}

interface Stage {
    id: number;
    title: string;
    transactions?: Transaction[];
}

interface Project {
    id: number;
    title: string;
    address?: string;
    budget: number;
    status?: string;
    stages?: Stage[];
    transactions?: Transaction[];
}

const Projects = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [showArchived, setShowArchived] = useState(false);

    // Dialog states
    const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);
    const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);

    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const isFreeUser = user && !user.subscriptionActive;
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');

    // Queries
    const { data: projects = [], isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: projectsService.getAll,
    });

    // Tour configuration
    const projectsTourSteps: DriveStep[] = [
        {
            popover: {
                title: 'Объекты 🏗️',
                description: 'Это ваш главный рабочий стол. Здесь будут отображаться все ваши текущие и завершенные строительные объекты.',
                align: 'center'
            }
        },
        {
            element: '#tour-project-create-btn',
            popover: {
                title: 'Новый объект',
                description: 'Начните с добавления первого строительного объекта. Укажите название, адрес и планируемый бюджет.',
                side: 'bottom',
                align: 'end'
            }
        }
    ];

    usePageOnboarding(!isLoading, 'projects_page', projectsTourSteps);

    // Mutations
    const createProjectMutation = useMutation({
        mutationFn: projectsService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            setIsProjectDialogOpen(false);
            toast({ title: 'Объект создан', description: 'Новый проект успешно добавлен' });
        },
        onError: () => {
            toast({ title: 'Ошибка', description: 'Не удалось создать проект.', variant: 'destructive' });
        }
    });

    const updateProjectMutation = useMutation({
        mutationFn: (variables: { id: number, data: any }) => projectsService.update(variables),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast({ title: 'Обновлено', description: 'Статус проекта обновлен' });
        },
        onError: () => {
            toast({ title: 'Ошибка', description: 'Не удалось обновить статус', variant: 'destructive' });
        }
    });

    const createTransactionMutation = useMutation({
        mutationFn: ({ projectId, data }: { projectId: number, data: any }) =>
            projectsService.createTransaction({ projectId, data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            setIsTransactionDialogOpen(false);
            setSelectedProject(null);
            toast({ title: 'Операция добавлена', description: 'Расход/приход успешно записан' });
        },
        onError: () => {
            toast({ title: 'Ошибка', description: 'Не удалось добавить операцию', variant: 'destructive' });
        }
    });

    const handleToggleArchive = (project: Project, e: React.MouseEvent) => {
        e.stopPropagation();
        const isArchived = project.status === 'completed' || project.status === 'frozen';
        const newStatus = isArchived ? 'ongoing' : 'completed';
        updateProjectMutation.mutate({ id: project.id, data: { status: newStatus } });
    };

    const handleAddProject = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        createProjectMutation.mutate({
            title: formData.get('name') as string,
            address: formData.get('address') as string,
            budget: parseFloat(formData.get('budget') as string) || 0
        });
    };

    const handleOpenTransactionDialog = (project: Project, type: 'expense' | 'income', e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedProject(project);
        setTransactionType(type);
        setIsTransactionDialogOpen(true);
    };

    const handleAddTransaction = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedProject) return;

        const formData = new FormData(e.currentTarget);
        const category = transactionType === 'expense'
            ? (formData.get('category') as string || 'materials')
            : 'other';

        createTransactionMutation.mutate({
            projectId: selectedProject.id,
            data: {
                type: transactionType,
                amount: parseFloat(formData.get('amount') as string) || 0,
                category,
                description: formData.get('description') as string
            }
        });
    };

    // Calculate project stats
    const calculateStats = (project: Project) => {
        let materials = 0, labor = 0, other = 0, income = 0;

        project.transactions?.forEach(t => {
            if (t.type === 'expense') {
                if (t.category === 'materials') materials += t.amount;
                else if (t.category === 'labor') labor += t.amount;
                else other += t.amount;
            } else {
                income += t.amount;
            }
        });

        project.stages?.forEach(stage => {
            stage.transactions?.forEach(t => {
                if (t.type === 'expense') {
                    if (t.category === 'materials') materials += t.amount;
                    else if (t.category === 'labor') labor += t.amount;
                    else other += t.amount;
                } else {
                    income += t.amount;
                }
            });
        });

        return { materials, labor, other, income, spent: materials + labor + other };
    };

    // Filter projects
    const displayedProjects = projects.filter((p: Project) => {
        const status = p.status || 'ongoing';
        const isArchived = status === 'completed' || status === 'frozen';
        return showArchived ? isArchived : !isArchived;
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Загрузка проектов...</div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold">Объекты</h2>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowArchived(!showArchived)}
                        >
                            <Icon name="Archive" size={16} className="mr-2" />
                            {showArchived ? 'Активные' : 'Архив'}
                        </Button>
                    </div>

                    {isFreeUser && displayedProjects.length >= 1 ? (
                        <Dialog open={showPaywall} onOpenChange={setShowPaywall}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Icon name="Lock" size={18} className="mr-2" />
                                    Новый объект
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Превышен лимит объектов</DialogTitle>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        В бесплатной версии вы можете вести только один строительный объект.
                                    </p>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                    <p className="text-sm font-medium">Оформите подписку, чтобы вести неограниченное количество объектов.</p>
                                    <Button className="w-full" onClick={() => window.location.href = '/profile'}>
                                        {user?.hasUsedTrial ? 'Перейти на платный (10 ₽ - ТЕСТ)' : 'Попробовать 7 дней за 1 ₽'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
                            <DialogTrigger asChild>
                                <Button id="tour-project-create-btn">
                                    <Icon name="Plus" size={18} className="mr-2" />
                                    Новый объект
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Создать новый объект</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleAddProject} className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">Название объекта</Label>
                                        <Input id="name" name="name" placeholder="ЖК Солнечный" required />
                                    </div>
                                    <div>
                                        <Label htmlFor="address">Адрес</Label>
                                        <Input id="address" name="address" placeholder="ул. Мира, 10" required />
                                    </div>
                                    <div>
                                        <Label htmlFor="budget">Бюджет (₽)</Label>
                                        <MoneyInput id="budget" name="budget" placeholder="5 000 000" required />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={createProjectMutation.isPending}>
                                        {createProjectMutation.isPending ? 'Создание...' : 'Создать объект'}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                {displayedProjects.length === 0 && (
                    <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-dashed">
                        <CardContent className="pt-6">
                            <div className="text-center space-y-4 py-12">
                                <div className="flex justify-center">
                                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Icon name="Building2" size={40} className="text-primary" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">
                                        {showArchived ? 'Архив пуст' : 'Нет объектов'}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {showArchived
                                            ? 'Архивированные объекты будут отображаться здесь'
                                            : 'Создайте первый строительный объект, чтобы начать работу'}
                                    </p>
                                </div>
                                {!showArchived && (
                                    <Button onClick={() => setIsProjectDialogOpen(true)} size="lg">
                                        <Icon name="Plus" size={18} className="mr-2" />
                                        Создать первый объект
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayedProjects.map((project: Project) => {
                        const stats = calculateStats(project);
                        return (
                            <Card
                                key={project.id}
                                className="hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => navigate(`/projects/${project.id}`)}
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-xl">{project.title}</CardTitle>
                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Icon name="MapPin" size={14} />
                                                {project.address || 'Нет адреса'}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => handleToggleArchive(project, e)}
                                            disabled={updateProjectMutation.isPending}
                                        >
                                            <Icon
                                                name={(project.status === 'completed' || project.status === 'frozen') ? "ArchiveRestore" : "Archive"}
                                                size={16}
                                            />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Budget and Income row */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Бюджет</p>
                                            <p className="font-semibold">{project.budget?.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Доходы</p>
                                            <p className="font-semibold text-green-600">{stats.income.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽</p>
                                        </div>
                                    </div>

                                    {/* Expenses breakdown */}
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-2">Расходы</p>
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Материалы</p>
                                                <p className="font-medium text-red-600">{stats.materials.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Работа</p>
                                                <p className="font-medium text-red-600">{stats.labor.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Прочее</p>
                                                <p className="font-medium text-red-600">{stats.other.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total expenses */}
                                    <div>
                                        <p className="text-xs text-muted-foreground">Всего расходов</p>
                                        <p className="font-bold text-red-600">{stats.spent.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽</p>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={(e) => handleOpenTransactionDialog(project, 'expense', e)}
                                        >
                                            <Icon name="Minus" size={16} className="mr-2" />
                                            Расход
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={(e) => handleOpenTransactionDialog(project, 'income', e)}
                                        >
                                            <Icon name="Plus" size={16} className="mr-2" />
                                            Приход
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Transaction Dialog */}
            <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {transactionType === 'expense' ? 'Добавить расход' : 'Добавить приход'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddTransaction} className="space-y-4">
                        <div>
                            <Label htmlFor="amount">Сумма (₽)</Label>
                            <MoneyInput id="amount" name="amount" placeholder="10 000" required />
                        </div>
                        {transactionType === 'expense' && (
                            <div>
                                <Label htmlFor="category">Категория</Label>
                                <select id="category" name="category" className="w-full border rounded-lg px-3 py-2 text-sm bg-background">
                                    <option value="materials">Материалы</option>
                                    <option value="labor">Работа</option>
                                    <option value="other">Прочее</option>
                                </select>
                            </div>
                        )}
                        <div>
                            <Label htmlFor="description">Описание</Label>
                            <Input id="description" name="description" placeholder="Покупка цемента" required />
                        </div>
                        <Button type="submit" className="w-full" disabled={createTransactionMutation.isPending}>
                            {createTransactionMutation.isPending ? 'Добавление...' : 'Добавить'}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Projects;
