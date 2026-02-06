import Icon from '@/components/ui/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DashboardProps {
  projects: any[];
  totalBudget: number;
  totalSpent: number;
  totalIncome: number;
  setActiveSection: (section: string) => void;
  setViewingProject: (id: number | null) => void;
  getAllExpenses: () => any[];
}

export const Dashboard = (props: DashboardProps) => {
  const { projects, totalBudget, totalSpent, totalIncome, setActiveSection, setViewingProject, getAllExpenses } = props;
  const activeProjects = projects.filter(p => !p.archived && p.spent < p.budget);
  const recentExpenses = getAllExpenses().slice(0, 5);
  const isEmpty = projects.length === 0;

  return (
    <div className="space-y-6">
      {isEmpty && (
        <Card className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-2 border-dashed">
          <CardContent className="pt-6">
            <div className="text-center space-y-4 py-8">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Icon name="Rocket" size={32} className="text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Добро пожаловать в СтройКонтроль!</h3>
                <p className="text-muted-foreground">Начните управлять вашими объектами прямо сейчас</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto pt-6">
                <Button 
                  variant="outline" 
                  className="h-auto flex-col py-6 space-y-2"
                  onClick={() => setActiveSection('projects')}
                >
                  <Icon name="Building2" size={24} className="text-primary" />
                  <div>
                    <div className="font-semibold">Создайте объект</div>
                    <div className="text-xs text-muted-foreground">Добавьте первый строительный объект</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto flex-col py-6 space-y-2"
                  onClick={() => setActiveSection('employees')}
                >
                  <Icon name="Users" size={24} className="text-primary" />
                  <div>
                    <div className="font-semibold">Добавьте команду</div>
                    <div className="text-xs text-muted-foreground">Внесите данные сотрудников</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto flex-col py-6 space-y-2"
                  onClick={() => setActiveSection('finances')}
                >
                  <Icon name="DollarSign" size={24} className="text-primary" />
                  <div>
                    <div className="font-semibold">Настройте финансы</div>
                    <div className="text-xs text-muted-foreground">Создайте статьи расходов</div>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90">Общий бюджет</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalBudget.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90">Расходы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSpent.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90">Доходы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalIncome.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Активные объекты</CardTitle>
          </CardHeader>
          <CardContent>
            {activeProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">Нет активных объектов</p>
            ) : (
              <div className="space-y-3">
                {activeProjects.map(project => (
                  <div 
                    key={project.id} 
                    className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => {
                      setViewingProject(project.id);
                      setActiveSection('project-detail');
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{project.name}</h4>
                      <Badge variant="outline">
                        {((project.spent / project.budget) * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{project.address}</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Потрачено:</span>
                      <span className="font-medium">{project.spent.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Последние расходы</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setActiveSection('expenses')}>
                Все расходы
                <Icon name="ArrowRight" size={16} className="ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentExpenses.length === 0 ? (
              <p className="text-sm text-muted-foreground">Расходов пока нет</p>
            ) : (
              <div className="space-y-3">
                {recentExpenses.map(expense => (
                  <div key={expense.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{expense.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {expense.projectName} • {expense.stageName}
                        </p>
                      </div>
                      <span className="font-semibold">{expense.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {expense.type === 'materials' ? 'Материалы' : 'Работы'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};