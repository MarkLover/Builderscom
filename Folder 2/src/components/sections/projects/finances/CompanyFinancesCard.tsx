import Icon from '@/components/ui/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CompanyFinancesCardProps {
  companyExpenses: any[];
  expenseCategories: any[];
}

export const CompanyFinancesCard = ({ companyExpenses, expenseCategories }: CompanyFinancesCardProps) => {
  const totalExpenses = companyExpenses.reduce((acc, e) => acc + e.amount, 0);
  
  const totalPlannedBudget = expenseCategories.reduce((acc, cat) => acc + cat.amount, 0);
  
  const totalPaidFromCategories = expenseCategories.reduce((acc, cat) => {
    const categoryPaid = cat.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
    return acc + categoryPaid;
  }, 0);
  
  const totalCompanySpent = totalExpenses + totalPaidFromCategories;
  
  const balance = totalPlannedBudget - totalPaidFromCategories;

  const getCategoryStats = () => {
    const stats: Record<string, { name: string; planned: number; spent: number }> = {};
    
    companyExpenses.forEach(expense => {
      const categoryKey = expense.category;
      if (!stats[categoryKey]) {
        stats[categoryKey] = { name: getCategoryName(categoryKey), planned: 0, spent: 0 };
      }
      stats[categoryKey].spent += expense.amount;
    });
    
    expenseCategories.forEach(cat => {
      const categoryPaid = cat.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
      if (!stats[cat.name]) {
        stats[cat.name] = { name: cat.name, planned: cat.amount, spent: categoryPaid };
      } else {
        stats[cat.name].planned += cat.amount;
        stats[cat.name].spent += categoryPaid;
      }
    });
    
    return Object.values(stats);
  };

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

  const categoryStats = getCategoryStats();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Building2" size={20} />
          Финансы компании
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Запланировано</p>
              <p className="text-2xl font-bold text-primary">{totalPlannedBudget.toLocaleString()} ₽</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Потрачено всего</p>
              <p className="text-2xl font-bold text-red-600">{totalCompanySpent.toLocaleString()} ₽</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Остаток</p>
              <p className="text-2xl font-bold text-green-600">{balance.toLocaleString()} ₽</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Прочие расходы</p>
              <p className="text-2xl font-bold text-orange-600">{totalExpenses.toLocaleString()} ₽</p>
            </div>
          </div>

          {categoryStats.length > 0 && (
            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3 text-sm">Расходы по категориям</h4>
              <div className="space-y-3">
                {categoryStats.map((stat, index) => {
                  const percentage = stat.planned > 0 ? (stat.spent / stat.planned) * 100 : 0;
                  const isOverBudget = stat.spent > stat.planned && stat.planned > 0;
                  
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">{stat.name}</span>
                        <span className={isOverBudget ? 'text-red-600 font-semibold' : ''}>
                          {stat.spent.toLocaleString()} / {stat.planned.toLocaleString()} ₽
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            isOverBudget ? 'bg-red-500' : percentage > 80 ? 'bg-orange-500' : 'bg-primary'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      {stat.planned > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {percentage.toFixed(1)}% использовано
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
