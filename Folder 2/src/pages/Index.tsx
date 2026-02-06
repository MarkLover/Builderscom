import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Icon from '@/components/ui/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Onboarding from '@/components/Onboarding';
import { projectsService } from '@/services/projects.service';

interface Transaction {
  id: number;
  type: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  projectName?: string;
  stageName?: string;
}

interface Project {
  id: number;
  title: string;
  address?: string;
  budget: number;
  // Computed helpers (backend returns these or we sum them up)
  spent?: number;
  income?: number;
  status: string; // 'ongoing', 'completed', 'frozen'
  stages?: any[];
  transactions?: any[];
}

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Fetch projects from API
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsService.getAll,
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    // Only show onboarding if no projects and haven't seen it
    if (!hasSeenOnboarding && projects.length === 0 && !isLoading) {
      setShowOnboarding(true);
    }
  }, [projects.length, isLoading]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  // Helper to calculate project stats from transactions
  const calculateProjectStats = (project: Project) => {
    let spent = 0;
    let income = 0;

    // Sum project-level transactions
    project.transactions?.forEach((t: any) => {
      if (t.type === 'expense') spent += t.amount;
      else income += t.amount;
    });

    // Sum stage transactions
    project.stages?.forEach((stage: any) => {
      stage.transactions?.forEach((t: any) => {
        if (t.type === 'expense') spent += t.amount;
        else income += t.amount;
      });
    });

    return {
      spent,
      budget: project.budget || 0,
      income
    };
  };

  // Calculate global totals from all transactions
  const calculateGlobalTotals = () => {
    let totalSpent = 0;
    let totalIncome = 0;

    projects.forEach((project: Project) => {
      const stats = calculateProjectStats(project);
      totalSpent += stats.spent;
      totalIncome += stats.income;
    });

    return { totalSpent, totalIncome };
  };

  const { totalSpent, totalIncome } = calculateGlobalTotals();
  const totalBudget = projects.reduce((sum: number, p: Project) => sum + (p.budget || 0), 0);

  const activeProjects = projects.filter((p: Project) => p.status === 'ongoing' || !p.status); // Default to active if no status

  // Flatten all transactions for "Recent Expenses"
  // This is a bit heavy for frontend if many projects, but fine for now.
  const getAllExpenses = (): Transaction[] => {
    const expenses: Transaction[] = [];
    projects.forEach((project: Project) => {
      // Check project level transactions
      if (project.transactions) {
        project.transactions.forEach((t: any) => {
          if (t.type === 'expense') {
            expenses.push({ ...t, projectName: project.title, stageName: 'Общий' });
          }
        });
      }
      // Check stage transactions
      if (project.stages) {
        project.stages.forEach((stage: any) => {
          if (stage.transactions) {
            stage.transactions.forEach((t: any) => {
              if (t.type === 'expense') {
                expenses.push({ ...t, projectName: project.title, stageName: stage.title });
              }
            });
          }
        });
      }
    });
    return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const recentExpenses = getAllExpenses().slice(0, 5);
  const isEmpty = projects.length === 0;

  if (!user || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Загрузка данных...</p>
      </div>
    );
  }

  return (
    <>
      {showOnboarding && <Onboarding userName={user.name} onComplete={handleOnboardingComplete} />}

      <div className="space-y-6">
        {isEmpty && !isLoading && (
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
                    onClick={() => navigate('/projects')}
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
                    onClick={() => navigate('/employees')}
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
                    onClick={() => navigate('/finances')}
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
                  {activeProjects.map((project: Project) => {
                    const stats = calculateProjectStats(project);
                    const percent = stats.budget > 0 ? (stats.spent / stats.budget) * 100 : 0;
                    return (
                      <div
                        key={project.id}
                        className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{project.title}</h4>
                          <Badge variant="outline">
                            {percent.toFixed(0)}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{project.address}</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Потрачено:</span>
                          <span className="font-medium">{stats.spent.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Последние расходы</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/finances')}>
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
                  {recentExpenses.map((expense: Transaction) => (
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
                        {expense.category === 'materials' ? 'Материалы' : 'Работы'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Index;