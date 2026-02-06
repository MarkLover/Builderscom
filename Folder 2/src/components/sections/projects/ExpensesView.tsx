import Icon from '@/components/ui/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ExpensesViewProps {
  projects: any[];
  filterProject: string;
  filterDate: string;
  filterMinAmount: string;
  filterMaxAmount: string;
  setFilterProject: (value: string) => void;
  setFilterDate: (value: string) => void;
  setFilterMinAmount: (value: string) => void;
  setFilterMaxAmount: (value: string) => void;
  getFilteredExpenses: () => any[];
}

export const ExpensesView = (props: ExpensesViewProps) => {
  const { projects, filterProject, filterDate, filterMinAmount, filterMaxAmount, setFilterProject, setFilterDate, setFilterMinAmount, setFilterMaxAmount, getFilteredExpenses } = props;
  const filteredExpenses = getFilteredExpenses();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Все расходы</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="filterProject">Объект</Label>
              <select 
                id="filterProject" 
                className="w-full border rounded-lg px-3 py-2"
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
              >
                <option value="all">Все объекты</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="filterDate">Дата</Label>
              <Input 
                id="filterDate" 
                type="date" 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="filterMin">Мин. сумма</Label>
              <Input 
                id="filterMin" 
                type="number" 
                placeholder="0"
                value={filterMinAmount}
                onChange={(e) => setFilterMinAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="filterMax">Макс. сумма</Label>
              <Input 
                id="filterMax" 
                type="number" 
                placeholder="1000000"
                value={filterMaxAmount}
                onChange={(e) => setFilterMaxAmount(e.target.value)}
              />
            </div>
          </div>
          {(filterProject !== 'all' || filterDate || filterMinAmount || filterMaxAmount) && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => {
                setFilterProject('all');
                setFilterDate('');
                setFilterMinAmount('');
                setFilterMaxAmount('');
              }}
            >
              <Icon name="X" size={16} className="mr-2" />
              Сбросить фильтры
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {filteredExpenses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Расходов не найдено</p>
          ) : (
            <div className="space-y-3">
              {filteredExpenses.map(expense => (
                <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold">{expense.description}</h4>
                      <Badge variant="secondary">
                        {expense.type === 'materials' ? 'Материалы' : 'Работы'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {expense.projectName} • {expense.stageName} • {expense.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">{expense.amount.toLocaleString()} ₽</span>
                    {expense.receipt && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => window.open(expense.receipt!, '_blank')}
                      >
                        <Icon name="Receipt" size={18} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
