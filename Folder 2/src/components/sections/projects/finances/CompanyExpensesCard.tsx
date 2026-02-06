import Icon from '@/components/ui/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CompanyExpensesCardProps {
  companyExpenses: any[];
  isCompanyExpenseDialogOpen: boolean;
  setIsCompanyExpenseDialogOpen: (open: boolean) => void;
  handleAddCompanyExpense: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const CompanyExpensesCard = ({ 
  companyExpenses, 
  isCompanyExpenseDialogOpen, 
  setIsCompanyExpenseDialogOpen, 
  handleAddCompanyExpense 
}: CompanyExpensesCardProps) => {
  const getCategoryName = (category: string) => {
    const categories: Record<string, string> = {
      rent: 'Аренда',
      salary: 'Зарплата',
      fuel: 'Топливо',
      taxes: 'Налоги',
      other: 'Прочее'
    };
    return categories[category] || category;
  };

  const totalCompanyExpenses = companyExpenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Расходы компании</CardTitle>
          <Dialog open={isCompanyExpenseDialogOpen} onOpenChange={setIsCompanyExpenseDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить расход
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить расход компании</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddCompanyExpense} className="space-y-4">
                <div>
                  <Label htmlFor="companyExpenseDesc">Описание</Label>
                  <Input id="companyExpenseDesc" name="description" placeholder="Аренда офиса" required />
                </div>
                <div>
                  <Label htmlFor="companyExpenseAmount">Сумма (₽)</Label>
                  <Input id="companyExpenseAmount" name="amount" type="number" placeholder="50000" required />
                </div>
                <div>
                  <Label htmlFor="companyExpenseCategory">Категория</Label>
                  <select id="companyExpenseCategory" name="category" className="w-full border rounded-lg px-3 py-2" required>
                    <option value="rent">Аренда</option>
                    <option value="salary">Зарплата</option>
                    <option value="fuel">Топливо</option>
                    <option value="taxes">Налоги</option>
                    <option value="other">Прочее</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="companyExpenseDate">Дата</Label>
                  <Input id="companyExpenseDate" name="date" type="date" required />
                </div>
                <div>
                  <Label htmlFor="companyExpenseReceipt">Чек (опционально)</Label>
                  <Input id="companyExpenseReceipt" name="receipt" type="file" accept="image/*,.pdf" />
                </div>
                <Button type="submit" className="w-full">Добавить расход</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {companyExpenses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Расходов компании пока нет</p>
          ) : (
            companyExpenses.slice(0, 5).map(expense => (
              <div key={expense.id} className="flex justify-between items-start p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{expense.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryName(expense.category)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{expense.date}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold">{expense.amount.toLocaleString()} ₽</span>
                  {expense.receipt && (
                    <div className="mt-1">
                      <Icon name="Paperclip" size={14} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        {companyExpenses.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Всего расходов:</span>
              <span className="text-lg font-bold">{totalCompanyExpenses.toLocaleString()} ₽</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
