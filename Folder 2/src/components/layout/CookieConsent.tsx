import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            // Small delay for better UX
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookieConsent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 sm:p-6 translate-y-0 transition-transform duration-500 ease-in-out">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                    <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Icon name="Info" size={20} className="text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Мы используем файлы cookie</h3>
                        <p className="text-sm text-muted-foreground w-full sm:max-w-3xl leading-relaxed">
                            Этот сайт использует файлы cookie, чтобы обеспечить вам максимальное удобство при использовании портала.
                            Продолжая пользоваться сайтом, вы соглашаетесь с нашей <a href="/privacy-policy" className="text-primary hover:underline">Политикой конфиденциальности</a> и правилами использования файлов cookie.
                        </p>
                    </div>
                </div>
                <div className="flex shrink-0 gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                    <Button onClick={acceptCookies} className="w-full sm:w-auto px-8" size="lg">
                        Принять и продолжить
                    </Button>
                </div>
            </div>
        </div>
    );
};
