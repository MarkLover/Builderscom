import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Icon from '@/components/ui/icon';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { tasksService } from '@/services/tasks.service';
import { projectsService } from '@/services/projects.service';
import { employeesService } from '@/services/employees.service';

interface Project {
    id: number;
    title: string;
}

interface Employee {
    id: number;
    name: string;
}

interface Task {
    id: number;
    title: string;
    description?: string;
    project: Project;
    assignee?: Employee;
    status: 'draft' | 'todo' | 'in_progress' | 'completed' | 'cancelled';
    dueDate?: string;
    priority: 'low' | 'medium' | 'high';
    projectId: number;
    assigneeId?: number;
}

const Tasks = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Dialog states
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    // Fetch data from API
    const { data: tasks = [], isLoading: tasksLoading } = useQuery({
        queryKey: ['tasks'],
        queryFn: tasksService.getAll,
    });

    const { data: projects = [] } = useQuery({
        queryKey: ['projects'],
        queryFn: projectsService.getAll,
    });

    const { data: employees = [] } = useQuery({
        queryKey: ['employees'],
        queryFn: employeesService.getAll,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: tasksService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['employees'] }); // Update task counts
            setIsTaskDialogOpen(false);
            toast({ title: 'Задача создана', description: 'Новая задача добавлена' });
        },
        onError: () => {
            toast({ title: 'Ошибка', description: 'Не удалось создать задачу', variant: 'destructive' });
        }
    });

    const updateMutation = useMutation({
        mutationFn: tasksService.update,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            setIsEditTaskDialogOpen(false);
            setEditingTask(null);
            toast({ title: 'Задача обновлена', description: 'Изменения сохранены' });
        },
        onError: () => {
            toast({ title: 'Ошибка', description: 'Не удалось обновить задачу', variant: 'destructive' });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: tasksService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            setIsEditTaskDialogOpen(false);
            setEditingTask(null);
            toast({ title: 'Задача удалена', variant: 'destructive' });
        },
        onError: () => {
            toast({ title: 'Ошибка', description: 'Не удалось удалить задачу', variant: 'destructive' });
        }
    });

    const handleAddTask = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const projectId = parseInt(formData.get('projectId') as string);
        const assigneeId = formData.get('assigneeId') as string;

        createMutation.mutate({
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            projectId,
            assigneeId: assigneeId ? parseInt(assigneeId) : undefined,
            dueDate: formData.get('dueDate') as string || undefined,
            priority: formData.get('priority') as string || 'medium',
        });
    };

    const handleUpdateTask = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingTask) return;

        const formData = new FormData(e.currentTarget);
        const assigneeId = formData.get('assigneeId') as string;

        updateMutation.mutate({
            id: editingTask.id,
            data: {
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                projectId: parseInt(formData.get('projectId') as string),
                assigneeId: assigneeId ? parseInt(assigneeId) : undefined,
                status: formData.get('status') as string,
                dueDate: formData.get('dueDate') as string || undefined,
                priority: formData.get('priority') as string,
            }
        });
    };

    const handleDeleteTask = () => {
        if (!editingTask) return;
        deleteMutation.mutate(editingTask.id);
    };

    const getStatusBadge = (status: Task['status']) => {
        const styles = {
            draft: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
            todo: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
            in_progress: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
            completed: 'bg-green-100 text-green-800 hover:bg-green-200',
            cancelled: 'bg-red-100 text-red-800 hover:bg-red-200',
        };

        const labels = {
            draft: 'Черновик',
            todo: 'К выполнению',
            in_progress: 'В работе',
            completed: 'Готово',
            cancelled: 'Отменено',
        };

        return <Badge className={`${styles[status]} border-0`}>{labels[status]}</Badge>;
    };

    const getPriorityIcon = (priority: Task['priority']) => {
        if (priority === 'high') return <Icon name="AlertCircle" size={16} className="text-red-500" />;
        if (priority === 'medium') return <Icon name="BarChart2" size={16} className="text-amber-500" />;
        return <Icon name="ArrowDown" size={16} className="text-blue-500" />;
    };

    if (tasksLoading) return <div className="flex justify-center p-8">Загрузка...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Задачи</h2>
                <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Icon name="Plus" size={18} className="mr-2" />
                            Новая задача
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Создать задачу</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddTask} className="space-y-4">
                            <div>
                                <Label htmlFor="title">Название задачи</Label>
                                <Input id="title" name="title" placeholder="Залить бетон" required />
                            </div>
                            <div>
                                <Label htmlFor="description">Описание</Label>
                                <Textarea id="description" name="description" placeholder="Детали задачи..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="projectId">Объект</Label>
                                    <select id="projectId" name="projectId" className="w-full border rounded-lg px-3 py-2 text-sm bg-background" required>
                                        <option value="">Выберите...</option>
                                        {projects.map((p: Project) => (
                                            <option key={p.id} value={p.id}>{p.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="assigneeId">Исполнитель</Label>
                                    <select id="assigneeId" name="assigneeId" className="w-full border rounded-lg px-3 py-2 text-sm bg-background">
                                        <option value="">Не назначен</option>
                                        {employees.map((e: Employee) => (
                                            <option key={e.id} value={e.id}>{e.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="dueDate">Дедлайн</Label>
                                    <Input id="dueDate" name="dueDate" type="date" />
                                </div>
                                <div>
                                    <Label htmlFor="priority">Приоритет</Label>
                                    <select id="priority" name="priority" className="w-full border rounded-lg px-3 py-2 text-sm bg-background">
                                        <option value="medium">Средний</option>
                                        <option value="high">Высокий</option>
                                        <option value="low">Низкий</option>
                                    </select>
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                                {createMutation.isPending ? 'Создание...' : 'Создать задачу'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Edit Task Dialog */}
            <Dialog open={isEditTaskDialogOpen} onOpenChange={setIsEditTaskDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Редактирование задачи</DialogTitle>
                    </DialogHeader>
                    {editingTask && (
                        <form onSubmit={handleUpdateTask} className="space-y-4">
                            <div>
                                <Label htmlFor="edit-title">Название задачи</Label>
                                <Input id="edit-title" name="title" defaultValue={editingTask.title} required />
                            </div>
                            <div>
                                <Label htmlFor="edit-status">Статус</Label>
                                <select
                                    id="edit-status"
                                    name="status"
                                    defaultValue={editingTask.status}
                                    className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
                                >
                                    <option value="draft">Черновик</option>
                                    <option value="todo">К выполнению</option>
                                    <option value="in_progress">В работе</option>
                                    <option value="completed">Готово</option>
                                    <option value="cancelled">Отменено</option>
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="edit-description">Описание</Label>
                                <Textarea id="edit-description" name="description" defaultValue={editingTask.description} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-projectId">Объект</Label>
                                    <select id="edit-projectId" name="projectId" defaultValue={editingTask.projectId} className="w-full border rounded-lg px-3 py-2 text-sm bg-background" required>
                                        <option value="">Выберите...</option>
                                        {projects.map((p: Project) => (
                                            <option key={p.id} value={p.id}>{p.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="edit-assigneeId">Исполнитель</Label>
                                    <select id="edit-assigneeId" name="assigneeId" defaultValue={editingTask.assigneeId || ''} className="w-full border rounded-lg px-3 py-2 text-sm bg-background">
                                        <option value="">Не назначен</option>
                                        {employees.map((e: Employee) => (
                                            <option key={e.id} value={e.id}>{e.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-dueDate">Дедлайн</Label>
                                    <Input id="edit-dueDate" name="dueDate" type="date" defaultValue={editingTask.dueDate?.split('T')[0]} />
                                </div>
                                <div>
                                    <Label htmlFor="edit-priority">Приоритет</Label>
                                    <select id="edit-priority" name="priority" defaultValue={editingTask.priority} className="w-full border rounded-lg px-3 py-2 text-sm bg-background">
                                        <option value="medium">Средний</option>
                                        <option value="high">Высокий</option>
                                        <option value="low">Низкий</option>
                                    </select>
                                </div>
                            </div>
                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button type="button" variant="destructive" onClick={handleDeleteTask} disabled={deleteMutation.isPending}>
                                    Удалить
                                </Button>
                                <Button type="submit" disabled={updateMutation.isPending}>
                                    {updateMutation.isPending ? 'Сохранение...' : 'Сохранить'}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {tasks.length === 0 ? (
                <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-dashed">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4 py-12">
                            <div className="flex justify-center">
                                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Icon name="CheckSquare" size={40} className="text-primary" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Нет задач</h3>
                                <p className="text-muted-foreground">
                                    Создайте первую задачу для отслеживания работ
                                </p>
                            </div>
                            <Button onClick={() => setIsTaskDialogOpen(true)} size="lg">
                                <Icon name="Plus" size={18} className="mr-2" />
                                Создать первую задачу
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {tasks.map((task: Task) => (
                                <div
                                    key={task.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer group"
                                    onClick={() => {
                                        setEditingTask(task);
                                        setIsEditTaskDialogOpen(true);
                                    }}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${task.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
                                            <Icon name={task.status === 'completed' ? "Check" : "CheckSquare"} size={20} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className={`font-medium ${task.status === 'completed' || task.status === 'cancelled' ? 'line-through text-muted-foreground' : ''}`}>
                                                    {task.title}
                                                </h4>
                                                {getPriorityIcon(task.priority)}
                                            </div>
                                            <p className="text-sm text-muted-foreground flex gap-2 items-center mt-1">
                                                <span>{task.project?.title || 'Без проекта'}</span>
                                                {task.assignee && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <Icon name="User" size={12} />
                                                            {task.assignee.name}
                                                        </span>
                                                    </>
                                                )}
                                                {task.dueDate && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1 text-xs">
                                                            <Icon name="Calendar" size={12} />
                                                            {new Date(task.dueDate).toLocaleDateString('ru-RU')}
                                                        </span>
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {getStatusBadge(task.status)}
                                        <Icon name="ChevronRight" size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default Tasks;
