import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface OnboardingProps {
  userName: string;
  onComplete: () => void;
}

const Onboarding = ({ userName, onComplete }: OnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: `Добро пожаловать, ${userName}!`,
      description: 'Давайте быстро познакомимся с возможностями СтройКонтроль',
      icon: 'Sparkles',
      content: 'СтройКонтроль — это система для управления строительными объектами, финансами, сотрудниками и задачами. Всё в одном месте!'
    },
    {
      title: 'Дашборд',
      description: 'Главная страница с общей статистикой',
      icon: 'LayoutDashboard',
      content: 'На дашборде вы видите ключевые показатели: бюджет всех объектов, расходы, доходы, активные объекты и последние операции.'
    },
    {
      title: 'Объекты',
      description: 'Управление строительными объектами',
      icon: 'Building2',
      content: 'Создавайте объекты, добавляйте этапы работ, отслеживайте прогресс и комментарии. Каждый объект можно архивировать, когда работа завершена.'
    },
    {
      title: 'Финансы',
      description: 'Контроль бюджета и расходов',
      icon: 'DollarSign',
      content: 'Отслеживайте расходы по этапам, создавайте статьи расходов компании (аренда, зарплата и т.д.), добавляйте платежи и храните чеки.'
    },
    {
      title: 'Сотрудники',
      description: 'База данных вашей команды',
      icon: 'Users',
      content: 'Добавляйте сотрудников с контактами (телефон, Telegram, WhatsApp), указывайте должности, отслеживайте количество задач.'
    },
    {
      title: 'Задачи',
      description: 'Планирование и контроль работ',
      icon: 'CheckSquare',
      content: 'Создавайте задачи, назначайте исполнителей, привязывайте к объектам. Отслеживайте статус выполнения задач в реальном времени.'
    },
    {
      title: 'Готово!',
      description: 'Начните работу прямо сейчас',
      icon: 'Rocket',
      content: 'Вы готовы использовать СтройКонтроль! Создайте первый объект, добавьте сотрудников и начните контролировать свой бизнес.'
    }
  ];

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon name={step.icon as any} size={40} className="text-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold">{step.title}</h2>
              <p className="text-lg text-primary font-medium">{step.description}</p>
            </div>

            <p className="text-muted-foreground text-base px-6">
              {step.content}
            </p>

            <div className="flex items-center justify-center gap-2 pt-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep 
                      ? 'w-8 bg-primary' 
                      : 'w-2 bg-muted'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-3 pt-6">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1"
                >
                  <Icon name="ArrowLeft" size={18} className="mr-2" />
                  Назад
                </Button>
              )}
              <Button
                variant="ghost"
                size="lg"
                onClick={handleSkip}
                className="flex-1"
              >
                Пропустить
              </Button>
              <Button
                size="lg"
                onClick={handleNext}
                className="flex-1"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    Начать работу
                    <Icon name="Check" size={18} className="ml-2" />
                  </>
                ) : (
                  <>
                    Далее
                    <Icon name="ArrowRight" size={18} className="ml-2" />
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground pt-4">
              Шаг {currentStep + 1} из {steps.length}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
