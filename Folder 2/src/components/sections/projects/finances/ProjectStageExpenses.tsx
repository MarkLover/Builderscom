import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProjectStageExpensesProps {
  project: any;
}

export const ProjectStageExpenses = ({ project }: ProjectStageExpensesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Расходы по этапам</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {project.stages.map((stage: any, idx: number) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{stage.name}</span>
                <span className="text-sm text-muted-foreground">
                  {(stage.spent / 1000).toFixed(0)} тыс ₽
                </span>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                <span>Материалы: {(stage.materials / 1000).toFixed(0)} тыс</span>
                <span>Работы: {(stage.labor / 1000).toFixed(0)} тыс</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
