import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export const useOnboarding = (isReady: boolean) => {
    useEffect(() => {
        if (!isReady) return;

        // Check if the user has already seen the onboarding guide
        const hasSeenGuide = localStorage.getItem('hasSeenOnboardingGuide');
        const token = localStorage.getItem('token');

        // Only show the guide if they are logged in and haven't seen it yet
        if (token && !hasSeenGuide) {
            console.log('Starting driver.js onboarding...');
            // Mobile users shouldn't see the driver.js tour, since the sidebar is hidden and it crashes the progression
            if (window.innerWidth < 1024) { // Increased to 1024 for safety
                localStorage.setItem('hasSeenOnboardingGuide', 'true');
                return;
            }

            const driverObj = driver({
                showProgress: true,
                nextBtnText: 'Далее &rarr;',
                prevBtnText: '&larr; Назад',
                doneBtnText: 'Готово',
                steps: [
                    {
                        popover: {
                            title: 'Добро пожаловать в ПростоСтройка! 🎉',
                            description: 'Давайте проведем для вас небольшую экскурсию по основным функциям платформы. Это займет всего 30 секунд.',
                            align: 'center'
                        }
                    },
                    {
                        element: '#tour-projects',
                        popover: {
                            title: 'Управление объектами',
                            description: 'Начните с создания вашего первого строительного объекта. Здесь вы сможете управлять этапами, бюджетами и сроками.',
                            side: 'right',
                            align: 'start'
                        }
                    },
                    {
                        element: '#tour-finances',
                        popover: {
                            title: 'Финансовый учет',
                            description: 'В этом разделе вы можете вести учет всех доходов и расходов по объектам и компании в целом.',
                            side: 'right',
                        }
                    },
                    {
                        element: '#tour-commercial',
                        popover: {
                            title: 'Коммерческие предложения',
                            description: 'Создавайте красивые КП в формате PDF для ваших клиентов за пару минут с помощью нашей базы материалов и работ.',
                            side: 'right',
                        }
                    }
                ],
                onDestroyStarted: () => {
                    // Mark as seen when closed or finished
                    localStorage.setItem('hasSeenOnboardingGuide', 'true');
                    driverObj.destroy();
                }
            });

            // Give the DOM a tiny bit of time to render the layout structure
            setTimeout(() => {
                driverObj.drive();
            }, 500);
        }
    }, [isReady]);
};
