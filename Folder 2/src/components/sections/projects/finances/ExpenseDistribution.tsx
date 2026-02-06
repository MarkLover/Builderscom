import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ExpenseDistributionProps {
  project: any;
}

export const ExpenseDistribution = ({ project }: ExpenseDistributionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Распределение затрат</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-blue-600">
                  Материалы
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-blue-600">
                  {((project.stages.reduce((acc: number, s: any) => acc + s.materials, 0) / project.spent) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
              <div 
                style={{ width: `${(project.stages.reduce((acc: number, s: any) => acc + s.materials, 0) / project.spent) * 100}%` }} 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
              />
            </div>
          </div>

          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-orange-600">
                  Работы
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-orange-600">
                  {((project.stages.reduce((acc: number, s: any) => acc + s.labor, 0) / project.spent) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-orange-200">
              <div 
                style={{ width: `${(project.stages.reduce((acc: number, s: any) => acc + s.labor, 0) / project.spent) * 100}%` }} 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Бюджет</span>
              <span className="text-sm">{(project.budget / 1000000).toFixed(2)} млн ₽</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Потрачено</span>
              <span className="text-sm text-red-600">{(project.spent / 1000000).toFixed(2)} млн ₽</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Получено</span>
              <span className="text-sm text-green-600">{(project.income / 1000000).toFixed(2)} млн ₽</span>
            </div>
            <div className="flex justify-between pt-2 border-t font-bold">
              <span>Прибыль</span>
              <span className={project.income - project.spent >= 0 ? 'text-green-600' : 'text-red-600'}>
                {((project.income - project.spent) / 1000000).toFixed(2)} млн ₽
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
