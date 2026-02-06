import Icon from '@/components/ui/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ExpenseCategoryDetailProps {
  category: any;
  isPaymentDialogOpen: boolean;
  setIsPaymentDialogOpen: (open: boolean) => void;
  handleAddPayment: (e: React.FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
}

export const ExpenseCategoryDetail = (props: ExpenseCategoryDetailProps) => {
  const { category, isPaymentDialogOpen, setIsPaymentDialogOpen, handleAddPayment, onBack } = props;

  const totalPaid = category.payments.reduce((acc: number, p: any) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <Icon name="ArrowLeft" size={20} className="mr-2" />
          Назад
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{category.name}</h2>
            <Badge variant={category.type === 'recurring' ? 'default' : 'secondary'}>
              {category.type === 'recurring' ? 'Постоянный' : 'Разовый'}
            </Badge>
          </div>
          <p className="text-muted-foreground">{category.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Плановая сумма</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {category.amount > 0 ? `${category.amount.toLocaleString()} ₽` : 'Не указана'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Оплачено</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalPaid.toLocaleString()} ₽</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Платежей</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{category.payments.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>История платежей</CardTitle>
            <Button onClick={() => setIsPaymentDialogOpen(true)}>
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить платёж
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {category.payments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Платежей пока нет</p>
          ) : (
            <div className="space-y-2">
              {category.payments.map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{payment.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold">{payment.amount.toLocaleString()} ₽</span>
                    {payment.receipt && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => window.open(payment.receipt, '_blank')}
                      >
                        <Icon name="Receipt" size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить платёж</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddPayment} className="space-y-4">
            <div>
              <Label htmlFor="paymentAmount">Сумма (₽)</Label>
              <Input 
                id="paymentAmount" 
                name="amount" 
                type="number" 
                placeholder={category.amount > 0 ? category.amount.toString() : "50000"}
                defaultValue={category.amount > 0 ? category.amount : undefined}
                required 
              />
            </div>
            <div>
              <Label htmlFor="paymentDate">Дата платежа</Label>
              <Input 
                id="paymentDate" 
                name="date" 
                type="date" 
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label htmlFor="paymentReceipt">Фото чека (опционально)</Label>
              <Input id="paymentReceipt" name="receipt" type="file" accept="image/*" />
            </div>
            <Button type="submit" className="w-full">Добавить платёж</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
