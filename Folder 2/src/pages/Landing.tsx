import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface LandingProps {
  onGetStarted: () => void;
}

const Landing = ({ onGetStarted }: LandingProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-16">
        <div className="text-center mb-12 sm:mb-20">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <Icon name="Building2" size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            ПростоСтройка
          </h1>
          <p className="text-lg sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Управляйте строительными проектами легко и эффективно
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Icon name="FileText" size={28} className="text-primary" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-3">Создание КП за минуты</h3>
            <p className="text-muted-foreground mb-4">
              Забудьте про сложные таблицы Excel. Создавайте красивые коммерческие предложения в 10 раз быстрее с автоматическим расчётом стоимости и НДС.
            </p>
            <div className="flex items-center gap-2 text-sm text-primary font-medium">
              <Icon name="Check" size={18} />
              <span>Быстрее и красивее чем в Excel</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Icon name="Users" size={28} className="text-primary" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-3">Управление командой</h3>
            <p className="text-muted-foreground mb-4">
              Добавляйте сотрудников, отслеживайте их работу и контролируйте зарплаты. Вся информация о команде в одном месте.
            </p>
            <div className="flex items-center gap-2 text-sm text-primary font-medium">
              <Icon name="Check" size={18} />
              <span>Карточки сотрудников с фото</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Icon name="BarChart3" size={28} className="text-primary" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-3">Финансовый контроль</h3>
            <p className="text-muted-foreground mb-4">
              Контролируйте бюджет проектов, отслеживайте расходы и доходы. Понимайте прибыльность каждого объекта в режиме реального времени.
            </p>
            <div className="flex items-center gap-2 text-sm text-primary font-medium">
              <Icon name="Check" size={18} />
              <span>Полная финансовая прозрачность</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-xl max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Всё для вашего бизнеса</h2>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="flex items-start gap-3">
              <Icon name="CheckCircle2" size={24} className="text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Проекты и этапы</h4>
                <p className="text-sm text-muted-foreground">Разбивайте объекты на этапы, контролируйте прогресс</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="CheckCircle2" size={24} className="text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Задачи и комментарии</h4>
                <p className="text-sm text-muted-foreground">Ставьте задачи сотрудникам, обсуждайте детали</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="CheckCircle2" size={24} className="text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Учёт расходов</h4>
                <p className="text-sm text-muted-foreground">Фиксируйте все траты по проектам и компании</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="CheckCircle2" size={24} className="text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Архив проектов</h4>
                <p className="text-sm text-muted-foreground">Храните историю завершённых объектов</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="CheckCircle2" size={24} className="text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">База материалов</h4>
                <p className="text-sm text-muted-foreground">48+ типовых материалов для быстрого КП</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="CheckCircle2" size={24} className="text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Личный кабинет</h4>
                <p className="text-sm text-muted-foreground">Редактируйте профиль и контакты компании</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 sm:p-12 shadow-xl max-w-5xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-center">Дорожная карта развития</h2>
          <p className="text-center text-muted-foreground mb-10">Мы превращаем сервис в полноценную экосистему для строительной отрасли</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md relative">
              <div className="absolute -top-3 -left-3 h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shadow-lg">
                1
              </div>
              <div className="flex items-center gap-3 mb-3 mt-2">
                <Icon name="LayoutDashboard" size={28} className="text-primary" />
                <h3 className="text-xl font-bold">Личный кабинет</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Управление проектами, сотрудниками, задачами и финансами. Создание КП, контроль бюджетов и отчётность по объектам.
              </p>
              <div className="mt-3 inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                Готово
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md relative">
              <div className="absolute -top-3 -left-3 h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-white font-bold shadow-lg">
                2
              </div>
              <div className="flex items-center gap-3 mb-3 mt-2">
                <Icon name="Store" size={28} className="text-secondary" />
                <h3 className="text-xl font-bold">Маркетплейс материалов</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Онлайн-каталог стройматериалов с ценами, характеристиками и возможностью заказа напрямую от поставщиков. Сравнение цен и быстрый поиск.
              </p>
              <div className="mt-3 inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                В разработке
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md relative">
              <div className="absolute -top-3 -left-3 h-10 w-10 rounded-full bg-accent flex items-center justify-center text-white font-bold shadow-lg">
                3
              </div>
              <div className="flex items-center gap-3 mb-3 mt-2">
                <Icon name="Handshake" size={28} className="text-accent" />
                <h3 className="text-xl font-bold">Биржа заказов</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Платформа для поиска заказов и исполнителей. Заказчики публикуют задачи, строители откликаются. Рейтинги, отзывы и безопасные сделки.
              </p>
              <div className="mt-3 inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                Планируется
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md relative">
              <div className="absolute -top-3 -left-3 h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold shadow-lg">
                4
              </div>
              <div className="flex items-center gap-3 mb-3 mt-2">
                <Icon name="Network" size={28} className="text-orange-500" />
                <h3 className="text-xl font-bold">Строительная соцсеть</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Профессиональное сообщество строителей. Портфолио проектов, обмен опытом, поиск партнёров и подрядчиков. Ваша репутация в отрасли.
              </p>
              <div className="mt-3 inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                Планируется
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button
            size="lg"
            className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-shadow"
            onClick={onGetStarted}
          >
            Начать работу
            <Icon name="ArrowRight" size={20} className="ml-2" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Бесплатно для личного использования
          </p>
        </div>
      </div>

      <div className="bg-primary/5 py-8 sm:py-12 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-muted-foreground mb-6">
            Подходит для строителей, отделочников, дизайнеров, инженеров и всех, кто работает в строительной сфере
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Icon name="Shield" size={16} />
              Безопасное хранение данных
            </span>
            <span className="flex items-center gap-1">
              <Icon name="Smartphone" size={16} />
              Работает на всех устройствах
            </span>
            <span className="flex items-center gap-1">
              <Icon name="Zap" size={16} />
              Быстрый старт без обучения
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;