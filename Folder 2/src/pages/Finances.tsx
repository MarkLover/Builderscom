import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Icon from '@/components/ui/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { projectsService } from '@/services/projects.service';

interface Transaction {
    id: number;
    type: string;
    amount: number;
    category: string;
    description: string;
    date: string;
    projectId: number;
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
    stages?: Stage[];
    transactions?: Transaction[];
}

interface FlatTransaction extends Transaction {
    projectName: string;
    stageName: string;
    uniqueKey: string; // Unique key for React rendering
}

const Finances = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
    const [categoryFilter, setCategoryFilter] = useState<'all' | 'materials' | 'labor' | 'other'>('all');
    const [editingTransaction, setEditingTransaction] = useState<FlatTransaction | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    // Fetch all projects with their transactions
    const { data: projects = [], isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: projectsService.getAll,
    });

    // Mutations
    const updateTransactionMutation = useMutation({
        mutationFn: ({ transactionId, data }: { transactionId: number; data: any }) =>
            projectsService.updateTransaction({ transactionId, data }),
        onSuccess: () => {
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
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast({ title: 'Удалено', description: 'Операция успешно удалена' });
        },
        onError: () => {
            toast({ title: 'Ошибка', description: 'Не удалось удалить операцию', variant: 'destructive' });
        }
    });

    // Memoize all transactions to prevent recalculation on every render
    const allTransactions = useMemo(() => {
        const transactions: FlatTransaction[] = [];

        projects.forEach((project: Project) => {
            // Project-level transactions
            project.transactions?.forEach((t: Transaction) => {
                transactions.push({
                    ...t,
                    projectName: project.title,
                    stageName: 'Общий',
                    uniqueKey: `project-${project.id}-tx-${t.id}`
                });
            });

            // Stage transactions
            project.stages?.forEach((stage: Stage) => {
                stage.transactions?.forEach((t: Transaction) => {
                    transactions.push({
                        ...t,
                        projectName: project.title,
                        stageName: stage.title,
                        uniqueKey: `project-${project.id}-stage-${stage.id}-tx-${t.id}`
                    });
                });
            });
        });

        // Sort by date descending
        return transactions.sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [projects]);

    // Memoize filtered transactions
    const filteredTransactions = useMemo(() => {
        return allTransactions.filter(t => {
            // Type filter
            if (typeFilter !== 'all' && t.type !== typeFilter) {
                return false;
            }
            // Category filter (only applies when filtering by specific category)
            if (categoryFilter !== 'all') {
                // When category filter is active, only show expenses with matching category
                if (t.type !== 'expense') {
                    return false;
                }
                const transactionCategory = t.category || 'other';
                if (transactionCategory !== categoryFilter) {
                    return false;
                }
            }
            return true;
        });
    }, [allTransactions, typeFilter, categoryFilter]);

    // Memoize statistics calculation
    const stats = useMemo(() => {
        let totalIncome = 0;
        let totalExpense = 0;
        let materials = 0;
        let labor = 0;
        let other = 0;

        allTransactions.forEach(t => {
            if (t.type === 'income') {
                totalIncome += t.amount;
            } else {
                totalExpense += t.amount;
                const cat = t.category || 'other';
                if (cat === 'materials') materials += t.amount;
                else if (cat === 'labor') labor += t.amount;
                else other += t.amount;
            }
        });

        return {
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense,
            materials,
            labor,
            other
        };
    }, [allTransactions]);

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            materials: 'Материалы',
            labor: 'Работа',
            other: 'Прочее',
        };
        return labels[category] || 'Прочее';
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            materials: 'bg-blue-100 text-blue-800',
            labor: 'bg-purple-100 text-purple-800',
            other: 'bg-gray-100 text-gray-800',
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    const handleEditTransaction = (transaction: FlatTransaction) => {
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

    const handleDeleteTransaction = (transaction: FlatTransaction) => {
        if (window.confirm(`Удалить операцию "${transaction.description}"?`)) {
            deleteTransactionMutation.mutate(transaction.id);
        }
    };

    if (isLoading) return <div className="flex justify-center p-8">Загрузка...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Финансы</h2>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                            <Icon name="TrendingUp" size={16} />
                            Доходы
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">
                            +{stats.totalIncome.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
                            <Icon name="TrendingDown" size={16} />
                            Расходы
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700">
                            -{stats.totalExpense.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽
                        </div>
                    </CardContent>
                </Card>
                <Card className={`bg-gradient-to-br ${stats.balance >= 0 ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-orange-50 to-orange-100 border-orange-200'}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className={`text-sm font-medium flex items-center gap-2 ${stats.balance >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                            <Icon name="Wallet" size={16} />
                            Баланс
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                            {stats.balance >= 0 ? '+' : ''}{stats.balance.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Expense Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Расходы по категориям</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Материалы</p>
                            <p className="text-xl font-bold text-blue-700">
                                {stats.materials.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽
                            </p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Работа</p>
                            <p className="text-xl font-bold text-purple-700">
                                {stats.labor.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽
                            </p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Прочее</p>
                            <p className="text-xl font-bold text-gray-700">
                                {stats.other.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap items-center p-4 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium mr-2">Тип:</span>
                <Button
                    variant={typeFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setTypeFilter('all'); setCategoryFilter('all'); }}
                >
                    Все
                </Button>
                <Button
                    variant={typeFilter === 'expense' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTypeFilter('expense')}
                >
                    <Icon name="TrendingDown" size={14} className="mr-1" />
                    Расходы
                </Button>
                <Button
                    variant={typeFilter === 'income' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setTypeFilter('income'); setCategoryFilter('all'); }}
                >
                    <Icon name="TrendingUp" size={14} className="mr-1" />
                    Доходы
                </Button>

                <div className="w-px bg-border h-6 mx-2" />

                <span className="text-sm font-medium mr-2">Категория:</span>
                <Button
                    variant={categoryFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategoryFilter('all')}
                >
                    Все категории
                </Button>
                <Button
                    variant={categoryFilter === 'materials' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setCategoryFilter('materials'); setTypeFilter('expense'); }}
                    className={categoryFilter === 'materials' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                    Материалы
                </Button>
                <Button
                    variant={categoryFilter === 'labor' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setCategoryFilter('labor'); setTypeFilter('expense'); }}
                    className={categoryFilter === 'labor' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                >
                    Работа
                </Button>
                <Button
                    variant={categoryFilter === 'other' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setCategoryFilter('other'); setTypeFilter('expense'); }}
                    className={categoryFilter === 'other' ? 'bg-gray-600 hover:bg-gray-700' : ''}
                >
                    Прочее
                </Button>
            </div>

            {/* Transaction List */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>История операций</CardTitle>
                    <span className="text-sm text-muted-foreground">
                        Показано: {filteredTransactions.length} из {allTransactions.length}
                    </span>
                </CardHeader>
                <CardContent>
                    {filteredTransactions.length === 0 ? (
                        <div className="text-center py-8">
                            <Icon name="DollarSign" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground font-medium">Нет операций</p>
                            <p className="text-sm text-muted-foreground">Нет операций по выбранным фильтрам</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredTransactions.map(transaction => (
                                <div
                                    key={transaction.uniqueKey}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === 'expense' ? 'bg-red-100' : 'bg-green-100'}`}>
                                            <Icon
                                                name={transaction.type === 'expense' ? 'TrendingDown' : 'TrendingUp'}
                                                size={20}
                                                className={transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}
                                            />
                                        </div>
                                        <div>
                                            <p className="font-medium">{transaction.description}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {transaction.projectName} • {transaction.stageName}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(transaction.date).toLocaleDateString('ru-RU')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {transaction.type === 'expense' && (
                                            <Badge variant="secondary" className={getCategoryColor(transaction.category || 'other')}>
                                                {getCategoryLabel(transaction.category)}
                                            </Badge>
                                        )}
                                        <span className={`font-bold text-lg ${transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                                            {transaction.type === 'expense' ? '-' : '+'}{transaction.amount.toLocaleString('ru-RU')} ₽
                                        </span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditTransaction(transaction)}
                                            >
                                                <Icon name="Pencil" size={14} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteTransaction(transaction)}
                                                disabled={deleteTransactionMutation.isPending}
                                            >
                                                <Icon name="Trash2" size={14} className="text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Transaction Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Редактировать операцию</DialogTitle>
                    </DialogHeader>
                    {editingTransaction && (
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="type">Тип</Label>
                                <select
                                    id="type"
                                    name="type"
                                    defaultValue={editingTransaction.type}
                                    className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
                                >
                                    <option value="expense">Расход</option>
                                    <option value="income">Доход</option>
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="amount">Сумма (₽)</Label>
                                <Input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    step="0.01"
                                    defaultValue={editingTransaction.amount}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="category">Категория</Label>
                                <select
                                    id="category"
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
                                <Label htmlFor="description">Описание</Label>
                                <Input
                                    id="description"
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

export default Finances;
