import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth.service';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const telegramWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (window as any).onTelegramAuth = async (user: any) => {
      try {
        await authService.telegramLogin(user);
        toast({ title: 'Вход выполнен', description: `Добро пожаловать, ${user.first_name || ''}!` });
        navigate('/');
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось войти через Telegram.',
          variant: 'destructive',
        });
      }
    };

    if (telegramWrapperRef.current && telegramWrapperRef.current.children.length === 0) {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.setAttribute('data-telegram-login', 'JustBuilders_bot');
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      script.setAttribute('data-request-access', 'write');
      script.async = true;
      telegramWrapperRef.current.appendChild(script);
    }
  }, [navigate, toast]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;

    try {
      const data = await authService.login({ phone, password });
      toast({ title: 'Вход выполнен', description: `Добро пожаловать, ${data.user.name}!` });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Ошибка входа',
        description: 'Неверный телефон или пароль.',
        variant: 'destructive'
      });
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const industry = formData.get('industry') as string;
    const isPersonal = industry === 'personal';

    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      toast({ title: 'Ошибка регистрации', description: 'Пароли не совпадают.', variant: 'destructive' });
      return;
    }

    if (password.length < 6) {
      toast({ title: 'Ошибка регистрации', description: 'Пароль дожен быть минимум 6 символов.', variant: 'destructive' });
      return;
    }

    try {
      const userData = {
        name: formData.get('name') as string,
        company: formData.get('company') as string,
        phone: formData.get('phone') as string,
        password: password,
        // industry: industry, // TODO: Add industry to backend schema if needed
        role: isPersonal ? 'user' : 'builder', // Example role mapping
        // telegram, etc... can be added later
      };

      await authService.register(userData);

      await authService.login({ phone: userData.phone, password: userData.password });
      navigate('/');

      toast({ title: 'Регистрация успешна', description: `Добро пожаловать!` });
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        toast({ title: 'Ошибка', description: 'Пользователь с таким номером уже существует', variant: 'destructive' });
      } else {
        toast({ title: 'Ошибка', description: 'Не удалось создать аккаунт.', variant: 'destructive' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
              <Icon name="Building2" size={32} className="text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">ПростоСтройка</CardTitle>
          <CardDescription className="text-base">
            {isLogin ? 'Войдите в свой аккаунт' : 'Создайте аккаунт для управления объектами'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="loginPhone">Номер телефона</Label>
                <Input
                  id="loginPhone"
                  name="phone"
                  type="tel"
                  placeholder="+7 (999) 123-45-67"
                  required
                />
              </div>
              <div>
                <Label htmlFor="loginPassword">Пароль</Label>
                <div className="relative">
                  <Input
                    id="loginPassword"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Введите пароль"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <Icon name={showPassword ? "EyeOff" : "Eye"} size={18} />
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" size="lg">
                Войти
              </Button>
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-sm text-primary hover:underline"
                >
                  Нет аккаунта? Зарегистрируйтесь
                </button>
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Или войти через</span>
                </div>
              </div>

              <div className="flex justify-center mt-4">
                <div ref={isLogin ? telegramWrapperRef : null}></div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Ваше имя *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Алексей Петров"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="company">Название компании *</Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="СтройМастер ООО"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Номер телефона *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+7 (999) 123-45-67"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Направление деятельности *</Label>
                  <select
                    id="industry"
                    name="industry"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Выберите направление</option>
                    <option value="personal">Делаю ремонт для себя</option>
                    <option value="construction">Строительство</option>
                    <option value="renovation">Ремонт и отделка</option>
                    <option value="engineering">Инженерные системы</option>
                    <option value="landscape">Благоустройство</option>
                    <option value="architecture">Архитектура и проектирование</option>
                    <option value="other">Другое</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Пароль *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Минимум 6 символов"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <Icon name={showPassword ? "EyeOff" : "Eye"} size={18} />
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Подтвердите пароль *</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Повторите пароль"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-sm font-medium mb-3">Рабочие страницы (опционально)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="telegram" className="flex items-center gap-2">
                      <Icon name="Send" size={14} />
                      Telegram
                    </Label>
                    <Input
                      id="telegram"
                      name="telegram"
                      placeholder="@username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagram" className="flex items-center gap-2">
                      <Icon name="Instagram" size={14} />
                      Instagram
                    </Label>
                    <Input
                      id="instagram"
                      name="instagram"
                      placeholder="@company_name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vk" className="flex items-center gap-2">
                      <Icon name="Share2" size={14} />
                      ВКонтакте
                    </Label>
                    <Input
                      id="vk"
                      name="vk"
                      placeholder="vk.com/company"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website" className="flex items-center gap-2">
                      <Icon name="Globe" size={14} />
                      Сайт
                    </Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Зарегистрироваться
              </Button>
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Уже есть аккаунт? Войдите
                </button>
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Или войти через</span>
                </div>
              </div>

              <div className="flex justify-center mt-4">
                <div ref={!isLogin ? telegramWrapperRef : null}></div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;