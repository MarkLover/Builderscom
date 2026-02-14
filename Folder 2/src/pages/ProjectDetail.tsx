import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Icon from '@/components/ui/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MoneyInput } from '@/components/ui/MoneyInput';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { projectsService } from '@/services/projects.service';

interface Transaction {
    id: number;
    type: string;
    amount: number;
    category: string;
    description: string;
    date: string;
}

interface Stage {
    id: number;
    title: string;
    budget: number;
    status: string;
    transactions: Transaction[];
}

interface Project {
    id: number;
    title: string;
    address?: string;
    budget: number;
    stages: Stage[];
    transactions: Transaction[];
}

const ProjectDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [expandedStage, setExpandedStage] = useState<number | null>(null);

    // Dialogs
    const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);
    const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    // Fetch project data
    const { data: project, isLoading, isError } = useQuery({
        queryKey: ['project', id],
        queryFn: () => projectsService.getOne(Number(id)),
        retry: false
    });

    // Mutations
    const createStageMutation = useMutation({
        mutationFn: (data: { title: string, budget?: number }) =>
            projectsService.createStage({ projectId: Number(id), data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project', id] });
            setIsStageDialogOpen(false);
            toast({ title: 'Этап добавлен', description: 'Новый этап успешно создан' });
        },
        onError: () => {
            toast({ title: 'Ошибка', description: 'Не удалось создать этап', variant: 'destructive' });
        }
    });

    const createTransactionMutation = useMutation({
        mutationFn: (data: any) =>
            projectsService.createTransaction({ projectId: Number(id), data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project', id] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            setIsTransactionDialogOpen(false);
            setSelectedStageId(null);
            toast({ title: 'Операция добавлена', description: 'Расход/доход успешно записан' });
        },
        onError: () => {
            toast({ title: 'Ошибка', description: 'Не удалось добавить операцию', variant: 'destructive' });
        }
    });

    const updateTransactionMutation = useMutation({
        mutationFn: ({ transactionId, data }: { transactionId: number; data: any }) =>
            projectsService.updateTransaction({ transactionId, data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project', id] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            setIsEditDialogOpen(false);
            setEditingTransaction(null);
            toast({ title: 'Обновлено', description: 'Операция успешно изменена' });
        },
        onError: () => {
            toast({ title: 'Ошибка', description: 'Не удалось обновить операцию', variant: 'destructive' });
        }
    });

    const deleteTransactionMutation = useMutation({
        mutationFn: (transactionId: number) => projectsService.deleteTransaction(transactionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project', id] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast({ title: 'Удалено', description: 'Операция успешно удалена' });
        },
        onError: () => {
            toast({ title: 'Ошибка', description: 'Не удалось удалить операцию', variant: 'destructive' });
        }
    });

    if (isLoading) return <div className="flex justify-center p-8">Загрузка проекта...</div>;
    if (isError || !project) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                <h3 className="text-xl font-bold">Проект не найден</h3>
                <Button onClick={() => navigate('/projects')}>Вернуться к списку</Button>
            </div>
        );
    }

    // Подсчет статистики на клиенте
    const calculateStats = (proj: Project) => {
        let materials = 0, labor = 0, other = 0, income = 0;

        proj.transactions?.forEach(t => {
            if (t.type === 'expense') {
                if (t.category === 'materials') materials += t.amount;
                else if (t.category === 'labor') labor += t.amount;
                else other += t.amount;
            } else {
                income += t.amount;
            }
        });

        proj.stages?.forEach(stage => {
            stage.transactions?.forEach((t: Transaction) => {
                if (t.type === 'expense') {
                    if (t.category === 'materials') materials += t.amount;
                    else if (t.category === 'labor') labor += t.amount;
                    else other += t.amount;
                } else {
                    income += t.amount;
                }
            });
        });

        return { spent: materials + labor + other, income, materials, labor, other };
    };

    const stats = calculateStats(project);

    // Handlers
    const handleAddStage = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const title = formData.get('stageName') as string;
        const budget = parseFloat(formData.get('budget') as string) || 0;
        createStageMutation.mutate({ title, budget });
    };

    const handleAddTransaction = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const type = formData.get('type') as string;
        const amount = parseFloat(formData.get('amount') as string) || 0;
        const category = type === 'expense'
            ? (formData.get('category') as string || 'materials')
            : 'other';
        const description = formData.get('description') as string;

        createTransactionMutation.mutate({
            type,
            amount,
            category,
            description,
            stageId: selectedStageId
        });
    };

    const handleEditTransaction = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsEditDialogOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingTransaction) return;

        const formData = new FormData(e.currentTarget);
        updateTransactionMutation.mutate({
            transactionId: editingTransaction.id,
            data: {
                type: formData.get('type') as string,
                amount: parseFloat(formData.get('amount') as string) || 0,
                category: formData.get('category') as string,
                description: formData.get('description') as string
            }
        });
    };

    const handleDeleteTransaction = (transaction: Transaction) => {
        if (window.confirm(`Удалить операцию "${transaction.description}"?`)) {
            deleteTransactionMutation.mutate(transaction.id);
        }
    };

    const openTransactionDialog = (stageId: number | null = null) => {
        setSelectedStageId(stageId);
        setIsTransactionDialogOpen(true);
    };

    // Calculate stage stats
    const getStageStats = (stage: Stage) => {
        let spent = 0, income = 0;
        stage.transactions?.forEach(t => {
            if (t.type === 'expense') spent += t.amount;
            else income += t.amount;
        });
        return { spent, income };
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            materials: 'Материалы',
            labor: 'Работа',
            other: 'Прочее',
        };
        return labels[category] || category;
    };

    // Render transaction row with edit/delete buttons
    const TransactionRow = ({ transaction }: { transaction: Transaction }) => (
        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg group hover:bg-muted transition-colors">
            <div>
                <p className="font-medium">{transaction.description}</p>
                <p className="text-xs text-muted-foreground">
                    {getCategoryLabel(transaction.category)}
                    {' • '}
                    {new Date(transaction.date).toLocaleDateString('ru-RU')}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <span className={`font-bold ${transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                    {transaction.type === 'expense' ? '-' : '+'}{transaction.amount.toLocaleString('ru-RU')} ₽
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleEditTransaction(transaction); }}
                    >
                        <Icon name="Pencil" size={14} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleDeleteTransaction(transaction); }}
                        disabled={deleteTransactionMutation.isPending}
                    >
                        <Icon name="Trash2" size={14} className="text-red-500" />
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
                    <Icon name="ArrowLeft" size={20} className="mr-2" />
                    Назад к списку
                </Button>
                <div>
                    <h2 className="text-2xl font-bold">{project.title}</h2>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <Icon name="MapPin" size={14} />
                        {project.address || 'Адрес не указан'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Бюджет</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{project.budget.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Доходы</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.income.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Расходы по категориям</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Материалы</p>
                            <p className="text-xl font-bold text-red-600">{stats.materials.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Работа</p>
                            <p className="text-xl font-bold text-red-600">{stats.labor.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Прочее</p>
                            <p className="text-xl font-bold text-red-600">{stats.other.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</p>
                        </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Всего расходов</span>
                        <span className="text-2xl font-bold text-red-600">{stats.spent.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</span>
                    </div>
                </CardContent>
            </Card>

            {/* Project-level transactions */}
            {project.transactions && project.transactions.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Общие операции</CardTitle>
                            <Button size="sm" onClick={() => openTransactionDialog(null)}>
                                <Icon name="Plus" size={16} className="mr-1" />
                                Добавить
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {project.transactions.map((t: Transaction) => (
                            <TransactionRow key={t.id} transaction={t} />
                        ))}
                    </CardContent>
                </Card>
            )}

            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Этапы работ</h3>
                    <div className="flex gap-2">
                        {(!project.transactions || project.transactions.length === 0) && (
                            <Button variant="outline" onClick={() => openTransactionDialog(null)}>
                                <Icon name="Plus" size={16} className="mr-1" />
                                Общий расход
                            </Button>
                        )}
                        <Dialog open={isStageDialogOpen} onOpenChange={setIsStageDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Icon name="Plus" size={18} className="mr-2" />
                                    Добавить этап
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Добавить этап работ</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleAddStage} className="space-y-4">
                                    <div>
                                        <Label htmlFor="stageName">Название этапа</Label>
                                        <Input id="stageName" name="stageName" placeholder="Фундамент" required />
                                    </div>
                                    <div>
                                        <Label htmlFor="budget">Бюджет этапа (₽)</Label>
                                        <MoneyInput id="budget" name="budget" placeholder="500 000" />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={createStageMutation.isPending}>
                                        {createStageMutation.isPending ? 'Добавление...' : 'Добавить этап'}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {(!project.stages || project.stages.length === 0) ? (
                    <Card className="bg-muted/50">
                        <CardContent className="pt-6">
                            <p className="text-center text-muted-foreground py-8">
                                Этапов пока нет. Добавьте первый этап работ.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {project.stages.map((stage: Stage) => {
                            const stageStats = getStageStats(stage);
                            return (
                                <Card key={stage.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}
                                                >
                                                    <Icon name={expandedStage === stage.id ? "ChevronDown" : "ChevronRight"} size={18} />
                                                </Button>
                                                <div>
                                                    <CardTitle>{stage.title}</CardTitle>
                                                    <div className="flex gap-4 text-sm text-muted-foreground">
                                                        {stage.budget > 0 && <span>Бюджет: {stage.budget.toLocaleString('ru-RU')} ₽</span>}
                                                        <span className="text-red-600">Расход: {stageStats.spent.toLocaleString('ru-RU')} ₽</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button size="sm" onClick={() => openTransactionDialog(stage.id)}>
                                                <Icon name="Plus" size={16} className="mr-1" />
                                                Расход
                                            </Button>
                                        </div>
                                    </CardHeader>

                                    {expandedStage === stage.id && (
                                        <CardContent className="space-y-4 border-t pt-4">
                                            {(!stage.transactions || stage.transactions.length === 0) ? (
                                                <p className="text-muted-foreground text-sm">Нет записей по этому этапу</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {stage.transactions.map((t: Transaction) => (
                                                        <TransactionRow key={t.id} transaction={t} />
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Transaction Dialog */}
            <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Добавить операцию</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddTransaction} className="space-y-4">
                        <div>
                            <Label htmlFor="type">Тип</Label>
                            <Select name="type" defaultValue="expense">
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите тип" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="expense">Расход</SelectItem>
                                    <SelectItem value="income">Доход</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="amount">Сумма (₽)</Label>
                            <MoneyInput id="amount" name="amount" placeholder="10 000" required />
                        </div>
                        <div>
                            <Label htmlFor="category">Категория</Label>
                            <Select name="category" defaultValue="materials">
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите категорию" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="materials">Материалы</SelectItem>
                                    <SelectItem value="labor">Работа</SelectItem>
                                    <SelectItem value="other">Прочее</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
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

            {/* Edit Transaction Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Редактировать операцию</DialogTitle>
                    </DialogHeader>
                    {editingTransaction && (
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="edit-type">Тип</Label>
                                <select
                                    id="edit-type"
                                    name="type"
                                    defaultValue={editingTransaction.type}
                                    className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
                                >
                                    <option value="expense">Расход</option>
                                    <option value="income">Доход</option>
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="edit-amount">Сумма (₽)</Label>
                                <MoneyInput
                                    id="edit-amount"
                                    name="amount"
                                    value={editingTransaction.amount}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-category">Категория</Label>
                                <select
                                    id="edit-category"
                                    name="category"
                                    defaultValue={editingTransaction.category || 'other'}
                                    className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
                                >
                                    <option value="materials">Материалы</option>
                                    <option value="labor">Работа</option>
                                    <option value="other">Прочее</option>
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="edit-description">Описание</Label>
                                <Input
                                    id="edit-description"
                                    name="description"
                                    defaultValue={editingTransaction.description}
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" className="flex-1" disabled={updateTransactionMutation.isPending}>
                                    {updateTransactionMutation.isPending ? 'Сохранение...' : 'Сохранить'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditDialogOpen(false)}
                                >
                                    Отмена
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProjectDetail;
