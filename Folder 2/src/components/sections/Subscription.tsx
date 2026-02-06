import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface SubscriptionProps {
  user: any;
  onUpdateUser: (userData: any) => void;
}

export const Subscription = ({ user, onUpdateUser }: SubscriptionProps) => {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleUploadReceipt = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const files = (e.currentTarget.elements.namedItem('receipt') as HTMLInputElement).files;
    
    if (files && files.length > 0) {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      
      const updatedUser = {
        ...user,
        subscriptionActive: true,
        subscriptionExpiry: expiryDate.toISOString()
      };
      
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      localStorage.setItem('user_' + user.phone, JSON.stringify(updatedUser));
      onUpdateUser(updatedUser);
      
      setIsPaymentDialogOpen(false);
      toast({ 
        title: 'Подписка активирована', 
        description: `Подписка активна до ${expiryDate.toLocaleDateString('ru-RU')}` 
      });
    }
  };

  const isExpiringSoon = user.subscriptionExpiry && 
    new Date(user.subscriptionExpiry).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000;

  const isExpired = user.subscriptionExpiry && 
    new Date(user.subscriptionExpiry) < new Date();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Подписка</h2>
        <p className="text-muted-foreground">Управление вашей подпиской на ПростоСтройка</p>
      </div>

      <Card className={`border-2 ${isExpired ? 'border-red-500' : isExpiringSoon ? 'border-yellow-500' : 'border-green-500'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Статус подписки
                {user.subscriptionActive && !isExpired ? (
                  <Badge className="bg-green-500">Активна</Badge>
                ) : (
                  <Badge variant="destructive">Не активна</Badge>
                )}
              </CardTitle>
              {user.subscriptionExpiry && (
                <CardDescription className="mt-2">
                  {isExpired 
                    ? `Подписка истекла ${new Date(user.subscriptionExpiry).toLocaleDateString('ru-RU')}`
                    : `Активна до ${new Date(user.subscriptionExpiry).toLocaleDateString('ru-RU')}`
                  }
                </CardDescription>
              )}
            </div>
            {(isExpired || isExpiringSoon || !user.subscriptionActive) && (
              <Icon name="AlertCircle" size={32} className="text-yellow-500" />
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className={!user.subscriptionActive ? 'border-2 border-primary' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Бесплатный тариф
              {!user.subscriptionActive && <Badge>Текущий</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <p className="text-4xl font-bold">0 ₽</p>
              <p className="text-sm text-muted-foreground">навсегда</p>
            </div>

            <div className="space-y-2">
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <Icon name="Check" size={16} className="text-green-500" />
                  1 объект
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Icon name="Check" size={16} className="text-green-500" />
                  До 10 сотрудников
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Icon name="Check" size={16} className="text-green-500" />
                  Учёт финансов компании
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Icon name="Check" size={16} className="text-green-500" />
                  Управление задачами
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Icon name="Check" size={16} className="text-green-500" />
                  Прикрепление чеков
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Icon name="X" size={16} className="text-red-500" />
                  <span className="line-through text-muted-foreground">Генератор КП</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className={user.subscriptionActive ? 'border-2 border-primary' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Платный тариф
              {user.subscriptionActive && <Badge className="bg-green-500">Текущий</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <p className="text-4xl font-bold">799 ₽</p>
              <p className="text-sm text-muted-foreground">в месяц</p>
            </div>

            <div className="space-y-2">
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <Icon name="Check" size={16} className="text-green-500" />
                  <span className="font-semibold">Неограниченное</span> количество объектов
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Icon name="Check" size={16} className="text-green-500" />
                  <span className="font-semibold">Неограниченное</span> количество сотрудников
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Icon name="Check" size={16} className="text-green-500" />
                  Учёт финансов компании
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Icon name="Check" size={16} className="text-green-500" />
                  Управление задачами
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Icon name="Check" size={16} className="text-green-500" />
                  Прикрепление чеков
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Icon name="Check" size={16} className="text-green-500" />
                  <span className="font-semibold">Генератор коммерческих предложений</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Icon name="Check" size={16} className="text-green-500" />
                  Экспорт КП в PDF и Excel
                </li>
              </ul>
            </div>

            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" size="lg">
                  <Icon name="CreditCard" size={18} className="mr-2" />
                  {user.subscriptionActive && !isExpired ? 'Продлить подписку' : 'Перейти на платный'}
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Оплата подписки</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUploadReceipt} className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <p className="font-semibold">Реквизиты для оплаты:</p>
                  <p className="text-sm">Сумма: <span className="font-bold">799 ₽</span></p>
                  <p className="text-sm text-muted-foreground">
                    После оплаты загрузите чек или скриншот платежа
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="receipt">Чек об оплате *</Label>
                  <Input 
                    id="receipt" 
                    name="receipt" 
                    type="file" 
                    accept="image/*,.pdf" 
                    required 
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Загрузить чек и активировать
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Icon name="Info" size={20} className="text-primary mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium">Информация о подписке</p>
              <p className="text-muted-foreground">
                Подписка активируется сразу после проверки оплаты. 
                Обычно это занимает несколько минут. 
                При возникновении вопросов свяжитесь с поддержкой.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};