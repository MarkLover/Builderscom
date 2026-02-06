import Icon from '@/components/ui/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ExpenseCategoriesCardProps {
  expenseCategories: any[];
  isExpenseCategoryDialogOpen: boolean;
  setIsExpenseCategoryDialogOpen: (open: boolean) => void;
  setViewingCategory: (id: number | null) => void;
  handleAddExpenseCategory: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const ExpenseCategoriesCard = ({ 
  expenseCategories, 
  isExpenseCategoryDialogOpen, 
  setIsExpenseCategoryDialogOpen, 
  setViewingCategory,
  handleAddExpenseCategory 
}: ExpenseCategoriesCardProps) => {
  const totalCategoriesExpenses = expenseCategories.reduce((acc, cat) => 
    acc + cat.payments.reduce((sum: number, p: any) => sum + p.amount, 0), 0
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Статьи расходов</CardTitle>
          <Dialog open={isExpenseCategoryDialogOpen} onOpenChange={setIsExpenseCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Icon name="Plus" size={16} className="mr-2" />
                Создать статью
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Создать статью расходов</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddExpenseCategory} className="space-y-4">
                <div>
                  <Label htmlFor="categoryName">Название</Label>
                  <Input id="categoryName" name="name" placeholder="Аренда офиса" required />
                </div>
                <div>
                  <Label htmlFor="categoryType">Тип</Label>
                  <select id="categoryType" name="type" className="w-full border rounded-lg px-3 py-2" required>
                    <option value="recurring">Постоянный расход</option>
                    <option value="one-time">Разовые платежи</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="categoryAmount">Плановая сумма (₽, опционально)</Label>
                  <Input id="categoryAmount" name="amount" type="number" placeholder="50000" />
                  <p className="text-xs text-muted-foreground mt-1">Для постоянных расходов - ежемесячная сумма</p>
                </div>
                <div>
                  <Label htmlFor="categoryDescription">Описание</Label>
                  <Textarea id="categoryDescription" name="description" placeholder="Ежемесячная аренда офиса по адресу..." rows={3} />
                </div>
                <Button type="submit" className="w-full">Создать статью</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
            <span className="font-semibold">Всего расходов по статьям:</span>
            <span className="text-lg font-bold text-red-600">{totalCategoriesExpenses.toLocaleString()} ₽</span>
          </div>
          
          {expenseCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Статей расходов пока нет</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expenseCategories.map(category => {
                const categoryTotal = category.payments.reduce((acc: number, p: any) => acc + p.amount, 0);
                return (
                  <Card 
                    key={category.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setViewingCategory(category.id)}
                  >
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{category.name}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                          </div>
                          <Badge variant={category.type === 'recurring' ? 'default' : 'secondary'}>
                            {category.type === 'recurring' ? 'Постоянный' : 'Разовый'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t">
                          <div>
                            <p className="text-xs text-muted-foreground">Потрачено</p>
                            <p className="text-lg font-bold">{categoryTotal.toLocaleString()} ₽</p>
                          </div>
                          {category.amount > 0 && (
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">План</p>
                              <p className="text-sm font-semibold">{category.amount.toLocaleString()} ₽</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{category.payments.length} платеж(ей)</span>
                          <Icon name="ChevronRight" size={16} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
