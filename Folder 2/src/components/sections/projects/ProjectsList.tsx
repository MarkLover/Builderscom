import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProjectsListProps {
  projects: any[];
  isProjectDialogOpen: boolean;
  setIsProjectDialogOpen: (open: boolean) => void;
  handleAddProject: (e: React.FormEvent<HTMLFormElement>) => void;
  setViewingProject: (id: number | null) => void;
  setActiveSection: (section: string) => void;
  handleArchiveProject: (id: number) => void;
  handleUnarchiveProject: (id: number) => void;
  isProjectExpenseDialogOpen?: boolean;
  setIsProjectExpenseDialogOpen?: (open: boolean) => void;
  isProjectIncomeDialogOpen?: boolean;
  setIsProjectIncomeDialogOpen?: (open: boolean) => void;
  selectedProjectForTransaction?: number | null;
  setSelectedProjectForTransaction?: (id: number | null) => void;
  handleAddProjectExpense?: (e: React.FormEvent<HTMLFormElement>) => void;
  handleAddProjectIncome?: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const ProjectsList = (props: ProjectsListProps) => {
  const { projects, isProjectDialogOpen, setIsProjectDialogOpen, handleAddProject, setViewingProject, setActiveSection, handleArchiveProject, handleUnarchiveProject, isProjectExpenseDialogOpen, setIsProjectExpenseDialogOpen, isProjectIncomeDialogOpen, setIsProjectIncomeDialogOpen, selectedProjectForTransaction, setSelectedProjectForTransaction, handleAddProjectExpense, handleAddProjectIncome } = props;
  const [showArchived, setShowArchived] = useState(false);
  const displayedProjects = showArchived ? projects.filter(p => p.archived) : projects.filter(p => !p.archived);

  return (
  <>
    <Dialog open={isProjectExpenseDialogOpen} onOpenChange={setIsProjectExpenseDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить расход объекта</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddProjectExpense} className="space-y-4">
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
            <Input id="expenseAmount" name="amount" type="number" step="0.01" placeholder="100000.00" required />
          </div>
          <div>
            <Label htmlFor="expenseDescription">Описание</Label>
            <Input id="expenseDescription" name="description" placeholder="Закупка материалов" />
          </div>
          <Button type="submit" className="w-full">Добавить расход</Button>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog open={isProjectIncomeDialogOpen} onOpenChange={setIsProjectIncomeDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить приход средств</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddProjectIncome} className="space-y-4">
          <div>
            <Label htmlFor="incomeAmount">Сумма (₽)</Label>
            <Input id="incomeAmount" name="amount" type="number" step="0.01" placeholder="500000.00" required />
          </div>
          <div>
            <Label htmlFor="incomeDescription">Описание</Label>
            <Input id="incomeDescription" name="description" placeholder="Оплата от заказчика" />
          </div>
          <Button type="submit" className="w-full">Добавить приход</Button>
        </form>
      </DialogContent>
    </Dialog>

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
      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
        <DialogTrigger asChild>
          <Button>
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
              <Input id="budget" name="budget" type="number" placeholder="5000000" required />
            </div>
            <Button type="submit" className="w-full">Создать объект</Button>
          </form>
        </DialogContent>
      </Dialog>
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
              <h3 className="text-xl font-bold mb-2">{showArchived ? 'Архив пуст' : 'Нет объектов'}</h3>
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
      {displayedProjects.map(project => (
        <Card 
          key={project.id} 
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => {
            setViewingProject(project.id);
            setActiveSection('project-detail');
          }}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle>{project.name}</CardTitle>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Icon name="MapPin" size={14} />
                  {project.address}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (project.archived) {
                    handleUnarchiveProject(project.id);
                  } else {
                    handleArchiveProject(project.id);
                  }
                }}
              >
                <Icon name={project.archived ? "ArchiveRestore" : "Archive"} size={16} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Бюджет</p>
                  <p className="font-semibold">{project.budget.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Доходы</p>
                  <p className="font-semibold text-green-600">{project.income.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</p>
                </div>
              </div>
              <div className="border-t pt-2">
                <p className="text-muted-foreground text-xs mb-2">Расходы</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Материалы</p>
                    <p className="font-semibold text-red-600">{(project.materials || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Работа</p>
                    <p className="font-semibold text-red-600">{(project.labor || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Прочее</p>
                    <p className="font-semibold text-red-600">{(project.other || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Всего расходов</p>
                  <p className="font-bold text-red-600">{project.spent.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</p>
                </div>
              </div>
            </div>
            
            {!project.archived && setIsProjectExpenseDialogOpen && setIsProjectIncomeDialogOpen && (
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProjectForTransaction?.(project.id);
                    setIsProjectExpenseDialogOpen(true);
                  }}
                >
                  <Icon name="Minus" size={14} className="mr-1" />
                  Расход
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProjectForTransaction?.(project.id);
                    setIsProjectIncomeDialogOpen(true);
                  }}
                >
                  <Icon name="Plus" size={14} className="mr-1" />
                  Приход
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
  </>
  );
};