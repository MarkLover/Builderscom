import Icon from '@/components/ui/icon';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExpenseCategoryDetail } from './ExpenseCategoryDetail';
import { ProjectStageExpenses } from './finances/ProjectStageExpenses';
import { ExpenseDistribution } from './finances/ExpenseDistribution';
import { CompanyExpensesCard } from './finances/CompanyExpensesCard';
import { ExpenseCategoriesCard } from './finances/ExpenseCategoriesCard';
import { CompanyFinancesCard } from './finances/CompanyFinancesCard';

interface FinancesViewProps {
  projects: any[];
  companyExpenses: any[];
  expenseCategories: any[];
  selectedProject: number | null;
  viewingCategory: number | null;
  setSelectedProject: (id: number | null) => void;
  setViewingCategory: (id: number | null) => void;
  isStageDialogOpen: boolean;
  setIsStageDialogOpen: (open: boolean) => void;
  isCompanyExpenseDialogOpen: boolean;
  setIsCompanyExpenseDialogOpen: (open: boolean) => void;
  isExpenseCategoryDialogOpen: boolean;
  setIsExpenseCategoryDialogOpen: (open: boolean) => void;
  isPaymentDialogOpen: boolean;
  setIsPaymentDialogOpen: (open: boolean) => void;
  handleAddStage: (e: React.FormEvent<HTMLFormElement>) => void;
  handleAddCompanyExpense: (e: React.FormEvent<HTMLFormElement>) => void;
  handleAddExpenseCategory: (e: React.FormEvent<HTMLFormElement>) => void;
  handleAddPayment: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const FinancesView = (props: FinancesViewProps) => {
  const { projects, companyExpenses, expenseCategories, selectedProject, viewingCategory, setSelectedProject, setViewingCategory, isStageDialogOpen, setIsStageDialogOpen, isCompanyExpenseDialogOpen, setIsCompanyExpenseDialogOpen, isExpenseCategoryDialogOpen, setIsExpenseCategoryDialogOpen, isPaymentDialogOpen, setIsPaymentDialogOpen, handleAddStage, handleAddCompanyExpense, handleAddExpenseCategory, handleAddPayment } = props;
  const activeProjects = projects.filter(p => !p.archived);
  const project = activeProjects.find(p => p.id === selectedProject) || activeProjects[0];
  
  const viewingCategoryData = expenseCategories.find(c => c.id === viewingCategory);
  
  if (viewingCategoryData) {
    return (
      <ExpenseCategoryDetail 
        category={viewingCategoryData}
        isPaymentDialogOpen={isPaymentDialogOpen}
        setIsPaymentDialogOpen={setIsPaymentDialogOpen}
        handleAddPayment={handleAddPayment}
        onBack={() => setViewingCategory(null)}
      />
    );
  }
  
  if (!project) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Финансы</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground py-8">
              Нет активных объектов. Создайте объект, чтобы начать работу с финансами.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Финансы</h2>
        <div className="flex gap-2">
          <select 
            className="border rounded-lg px-4 py-2"
            value={selectedProject || project.id}
            onChange={(e) => setSelectedProject(Number(e.target.value))}
          >
            {activeProjects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
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
                  <Label htmlFor="projectId">Объект</Label>
                  <select id="projectId" name="projectId" className="w-full border rounded-lg px-3 py-2" required>
                    {activeProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
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
      </div>

      <CompanyFinancesCard 
        companyExpenses={companyExpenses}
        expenseCategories={expenseCategories}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProjectStageExpenses project={project} />
        <ExpenseDistribution project={project} />
      </div>

      <CompanyExpensesCard 
        companyExpenses={companyExpenses}
        isCompanyExpenseDialogOpen={isCompanyExpenseDialogOpen}
        setIsCompanyExpenseDialogOpen={setIsCompanyExpenseDialogOpen}
        handleAddCompanyExpense={handleAddCompanyExpense}
      />

      <ExpenseCategoriesCard 
        expenseCategories={expenseCategories}
        isExpenseCategoryDialogOpen={isExpenseCategoryDialogOpen}
        setIsExpenseCategoryDialogOpen={setIsExpenseCategoryDialogOpen}
        setViewingCategory={setViewingCategory}
        handleAddExpenseCategory={handleAddExpenseCategory}
      />
    </div>
  );
};