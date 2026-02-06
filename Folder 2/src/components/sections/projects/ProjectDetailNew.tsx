import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface ProjectDetailNewProps {
  projects: any[];
  viewingProject: number | null;
  isStageDialogOpen: boolean;
  setIsStageDialogOpen: (open: boolean) => void;
  isStageExpenseDialogOpen: boolean;
  setIsStageExpenseDialogOpen: (open: boolean) => void;
  isStageIncomeDialogOpen: boolean;
  setIsStageIncomeDialogOpen: (open: boolean) => void;
  selectedStageForTransaction: number | null;
  setSelectedStageForTransaction: (id: number | null) => void;
  setActiveSection: (section: string) => void;
  handleAddStage: (e: React.FormEvent<HTMLFormElement>) => void;
  handleAddStageExpense: (e: React.FormEvent<HTMLFormElement>) => void;
  handleAddStageIncome: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const ProjectDetailNew = (props: ProjectDetailNewProps) => {
  const { 
    projects, 
    viewingProject, 
    isStageDialogOpen, 
    setIsStageDialogOpen,
    isStageExpenseDialogOpen,
    setIsStageExpenseDialogOpen,
    isStageIncomeDialogOpen,
    setIsStageIncomeDialogOpen,
    selectedStageForTransaction,
    setSelectedStageForTransaction,
    setActiveSection, 
    handleAddStage,
    handleAddStageExpense,
    handleAddStageIncome
  } = props;
  
  const [expandedStage, setExpandedStage] = useState<number | null>(null);
  const project = projects.find(p => p.id === viewingProject);
  if (!project) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => setActiveSection('dashboard')}>
          <Icon name="ArrowLeft" size={20} className="mr-2" />
          Назад
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{project.name}</h2>
          <p className="text-muted-foreground flex items-center gap-2">
            <Icon name="MapPin" size={14} />
            {project.address}
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
            <div className="text-2xl font-bold text-green-600">{project.income.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</div>
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
              <p className="text-xl font-bold text-red-600">{(project.materials || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Работа</p>
              <p className="text-xl font-bold text-red-600">{(project.labor || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Прочее</p>
              <p className="text-xl font-bold text-red-600">{(project.other || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Всего расходов</span>
            <span className="text-2xl font-bold text-red-600">{project.spent.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</span>
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Этапы работ</h3>
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
                <input type="hidden" name="projectId" value={project.id} />
                <div>
                  <Label htmlFor="stageName">Название этапа</Label>
                  <Input id="stageName" name="stageName" placeholder="Фундамент" required />
                </div>
                <div>
                  <Label htmlFor="budget">Бюджет этапа (₽)</Label>
                  <Input id="budget" name="budget" type="number" step="0.01" placeholder="500000.00" />
                </div>
                <Button type="submit" className="w-full">Добавить этап</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {project.stages.length === 0 ? (
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground py-8">
                Этапов пока нет. Добавьте первый этап работ.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {project.stages.map((stage: any) => (
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
                        <CardTitle>{stage.name}</CardTitle>
                        {stage.budget > 0 && (
                          <p className="text-sm text-muted-foreground">
                            Бюджет: {stage.budget.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Расходы</p>
                        <p className="text-lg font-bold text-red-600">
                          {stage.spent.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
                        </p>
                      </div>
                      {stage.income > 0 && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Доходы</p>
                          <p className="text-lg font-bold text-green-600">
                            {stage.income.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                {expandedStage === stage.id && (
                  <CardContent className="space-y-4 border-t pt-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Материалы</p>
                        <p className="font-semibold text-red-600">
                          {(stage.materials || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Работа</p>
                        <p className="font-semibold text-red-600">
                          {(stage.labor || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Прочее</p>
                        <p className="font-semibold text-red-600">
                          {(stage.other || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setSelectedStageForTransaction(stage.id);
                          setIsStageExpenseDialogOpen(true);
                        }}
                      >
                        <Icon name="Minus" size={16} className="mr-2" />
                        Добавить расход
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setSelectedStageForTransaction(stage.id);
                          setIsStageIncomeDialogOpen(true);
                        }}
                      >
                        <Icon name="Plus" size={16} className="mr-2" />
                        Добавить приход
                      </Button>
                    </div>

                    {stage.expenses && stage.expenses.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Расходы</h4>
                        <div className="space-y-2">
                          {stage.expenses.map((expense: any) => (
                            <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{expense.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  {expense.type === 'materials' ? 'Материалы' : expense.type === 'labor' ? 'Работа' : 'Прочее'} • {expense.date}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-semibold text-red-600">
                                  {expense.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
                                </span>
                                {expense.receipt && (
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => window.open(expense.receipt, '_blank')}
                                  >
                                    <Icon name="Receipt" size={16} />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {stage.incomes && stage.incomes.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Приходы</h4>
                        <div className="space-y-2">
                          {stage.incomes.map((income: any) => (
                            <div key={income.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{income.description}</p>
                                <p className="text-xs text-muted-foreground">{income.date}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-semibold text-green-600">
                                  +{income.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
                                </span>
                                {income.receipt && (
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => window.open(income.receipt, '_blank')}
                                  >
                                    <Icon name="Receipt" size={16} />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isStageExpenseDialogOpen} onOpenChange={setIsStageExpenseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить расход этапа</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddStageExpense} className="space-y-4">
            <div>
              <Label htmlFor="expenseType">Тип расхода</Label>
              <select id="expenseType" name="type" className="w-full border rounded-lg px-3 py-2" required>
                <option value="materials">Материалы</option>
                <option value="labor">Работа</option>
                <option value="other">Прочее</option>
              </select>
            </div>
            <div>
              <Label htmlFor="expenseAmount">Сумма (₽)</Label>
              <Input id="expenseAmount" name="amount" type="number" step="0.01" placeholder="50000.00" required />
            </div>
            <div>
              <Label htmlFor="expenseDescription">Описание</Label>
              <Input id="expenseDescription" name="description" placeholder="Цемент М500" required />
            </div>
            <div>
              <Label htmlFor="expenseReceipt">Чек (опционально)</Label>
              <Input id="expenseReceipt" name="receipt" type="file" accept="image/*,.pdf" />
            </div>
            <Button type="submit" className="w-full">Добавить расход</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isStageIncomeDialogOpen} onOpenChange={setIsStageIncomeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить приход средств</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddStageIncome} className="space-y-4">
            <div>
              <Label htmlFor="incomeAmount">Сумма (₽)</Label>
              <Input id="incomeAmount" name="amount" type="number" step="0.01" placeholder="100000.00" required />
            </div>
            <div>
              <Label htmlFor="incomeDescription">Описание</Label>
              <Input id="incomeDescription" name="description" placeholder="Оплата от заказчика" required />
            </div>
            <div>
              <Label htmlFor="incomeReceipt">Документ (опционально)</Label>
              <Input id="incomeReceipt" name="receipt" type="file" accept="image/*,.pdf" />
            </div>
            <Button type="submit" className="w-full">Добавить приход</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
