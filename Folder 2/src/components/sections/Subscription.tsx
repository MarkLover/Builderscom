import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { subscriptionsService, SubscriptionStatus } from '@/services/subscriptions.service';

interface SubscriptionProps {
  user: any;
  onUpdateUser: (userData: any) => void;
}

export const Subscription = ({ user, onUpdateUser }: SubscriptionProps) => {
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    active: user.subscriptionActive || false,
    expiry: user.subscriptionExpiry || null,
  });
  const { toast } = useToast();

  // Fetch subscription status on mount
  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      const status = await subscriptionsService.getStatus();
      setSubscriptionStatus(status);
      // Also update the user object
      onUpdateUser({
        ...user,
        subscriptionActive: status.active,
        subscriptionExpiry: status.expiry,
      });
    } catch (error) {
      // Ignore error if user is not authenticated yet
    }
  };

  const handlePayPremium = async () => {
    try {
      setLoading(true);
      // We send the user to YooKassa and tell YooKassa to return them back to this page
      const returnUrl = window.location.origin + '/profile';
      const result = await subscriptionsService.generatePaymentLink(returnUrl);

      if (result && result.confirmationUrl) {
        // Redirect to YooKassa payment page
        window.location.href = result.confirmationUrl;
      } else {
        throw new Error('No confirmation URL received');
      }

    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать платеж. Пожалуйста, попробуйте позже.',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const isExpiringSoon = subscriptionStatus.expiry &&
    new Date(subscriptionStatus.expiry).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000;

  const isExpired = subscriptionStatus.expiry &&
    new Date(subscriptionStatus.expiry) < new Date();

  const isActive = subscriptionStatus.active && !isExpired;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Подписка</h2>
        <p className="text-muted-foreground">Управление вашей подпиской на ПростоСтройка</p>
      </div>

      <Card className={`border-2 ${isExpired ? 'border-red-500' : isExpiringSoon ? 'border-yellow-500' : isActive ? 'border-green-500' : 'border-muted'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Статус подписки
                {isActive ? (
                  <Badge className="bg-green-500">Активна</Badge>
                ) : (
                  <Badge variant="destructive">Не активна</Badge>
                )}
              </CardTitle>
              {subscriptionStatus.expiry && (
                <CardDescription className="mt-2">
                  {isExpired
                    ? `Подписка истекла ${new Date(subscriptionStatus.expiry).toLocaleDateString('ru-RU')}`
                    : `Активна до ${new Date(subscriptionStatus.expiry).toLocaleDateString('ru-RU')}`
                  }
                </CardDescription>
              )}
            </div>
            {(isExpired || isExpiringSoon || !isActive) && (
              <Icon name="AlertCircle" size={32} className="text-yellow-500" />
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className={!isActive ? 'border-2 border-primary' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Бесплатный тариф
              {!isActive && <Badge>Текущий</Badge>}
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

        <Card className={isActive ? 'border-2 border-primary' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Платный тариф
              {isActive && <Badge className="bg-green-500">Текущий</Badge>}
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

            <Button
              className="w-full"
              size="lg"
              onClick={handlePayPremium}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Переходим к оплате...
                </>
              ) : (
                <>
                  <Icon name="CreditCard" size={18} className="mr-2" />
                  {isActive ? 'Продлить подписку' : 'Перейти на платный (10 ₽ - ТЕСТ)'}
                </>
              )}
            </Button>
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