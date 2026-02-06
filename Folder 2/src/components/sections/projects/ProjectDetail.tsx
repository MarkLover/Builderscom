import Icon from '@/components/ui/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

interface ProjectDetailProps {
  projects: any[];
  viewingProject: number | null;
  isCommentDialogOpen: boolean;
  setIsCommentDialogOpen: (open: boolean) => void;
  isExpenseDialogOpen: boolean;
  setIsExpenseDialogOpen: (open: boolean) => void;
  setActiveSection: (section: string) => void;
  handleAddComment: (e: React.FormEvent<HTMLFormElement>) => void;
  handleAddExpense: (e: React.FormEvent<HTMLFormElement>) => void;
  setSelectedStage: (id: number | null) => void;
}

export const ProjectDetail = (props: ProjectDetailProps) => {
  const { projects, viewingProject, isCommentDialogOpen, setIsCommentDialogOpen, isExpenseDialogOpen, setIsExpenseDialogOpen, setActiveSection, handleAddComment, handleAddExpense, setSelectedStage } = props;
  const project = projects.find(p => p.id === viewingProject);
  if (!project) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => setActiveSection('dashboard')}>
          <Icon name="ArrowLeft" size={20} className="mr-2" />
          Назад
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{project.name}</h2>
          <p className="text-muted-foreground flex items-center gap-2">
            <Icon name="MapPin" size={14} />
            {project.address}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Бюджет</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.budget.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Доходы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{project.income.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Расходы по категориям</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Материалы</p>
              <p className="text-xl font-bold text-red-600">{(project.materials || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Работа</p>
              <p className="text-xl font-bold text-red-600">{(project.labor || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Прочее</p>
              <p className="text-xl font-bold text-red-600">{(project.other || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Всего расходов</span>
            <span className="text-2xl font-bold text-red-600">{project.spent.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Комментарии</CardTitle>
            <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Icon name="Plus" size={16} className="mr-2" />
                  Добавить
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить комментарий</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddComment} className="space-y-4">
                  <div>
                    <Label htmlFor="comment">Комментарий</Label>
                    <Textarea id="comment" name="comment" placeholder="Введите комментарий..." rows={4} required />
                  </div>
                  <Button type="submit" className="w-full">Добавить комментарий</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {project.comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Комментариев пока нет</p>
          ) : (
            <div className="space-y-4">
              {project.comments.map(comment => (
                <div key={comment.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">{comment.author}</span>
                    <span className="text-xs text-muted-foreground">{comment.date}</span>
                  </div>
                  <p className="text-sm">{comment.text}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h3 className="text-xl font-bold mb-4">Этапы работ</h3>
        <div className="space-y-4">
          {project.stages.map(stage => (
            <Card key={stage.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{stage.name}</span>
                  <Badge variant="outline">{(stage.spent / 1000).toFixed(0)} тыс ₽</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Материалы</p>
                    <p className="font-semibold">{(stage.materials / 1000).toFixed(0)} тыс ₽</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Работы</p>
                    <p className="font-semibold">{(stage.labor / 1000).toFixed(0)} тыс ₽</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Расходы</h4>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedStage(stage.id);
                        setIsExpenseDialogOpen(true);
                      }}
                    >
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить
                    </Button>
                  </div>
                  {stage.expenses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Расходов пока нет</p>
                  ) : (
                    <div className="space-y-2">
                      {stage.expenses.map(expense => (
                        <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{expense.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {expense.type === 'materials' ? 'Материалы' : 'Работы'}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">{expense.amount.toLocaleString()} ₽</span>
                            {expense.receipt && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => window.open(expense.receipt!, '_blank')}
                              >
                                <Icon name="Receipt" size={16} />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить расход</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <Label htmlFor="description">Описание</Label>
              <Input id="description" name="description" placeholder="Цемент М500" required />
            </div>
            <div>
              <Label htmlFor="amount">Сумма (₽)</Label>
              <Input id="amount" name="amount" type="number" placeholder="50000" required />
            </div>
            <div>
              <Label htmlFor="type">Тип расхода</Label>
              <select id="type" name="type" className="w-full border rounded-lg px-3 py-2" required>
                <option value="materials">Материалы</option>
                <option value="labor">Работы</option>
              </select>
            </div>
            <div>
              <Label htmlFor="receipt">Фото чека (опционально)</Label>
              <Input id="receipt" name="receipt" type="file" accept="image/*" />
            </div>
            <Button type="submit" className="w-full">Добавить расход</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};