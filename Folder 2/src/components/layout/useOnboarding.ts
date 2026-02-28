import { useEffect } from 'react';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

export const usePageOnboarding = (isReady: boolean, tourName: string, steps: DriveStep[]) => {
    useEffect(() => {
        if (!isReady || !steps || steps.length === 0) return;

        // Check if the user has already seen this specific onboarding guide
        const hasSeenGuide = localStorage.getItem(`hasSeenOnboarding_${tourName}`);
        const token = localStorage.getItem('token');

        // Only show the guide if they are logged in and haven't seen it yet
        if (token && !hasSeenGuide) {
            console.log(`Starting driver.js onboarding for ${tourName}...`);
            // Mobile users shouldn't see the driver.js tour, since the layouts change and it crashes the progression
            if (window.innerWidth < 1024) {
                localStorage.setItem(`hasSeenOnboarding_${tourName}`, 'true');
                return;
            }

            const driverObj = driver({
                showProgress: true,
                nextBtnText: 'Далее &rarr;',
                prevBtnText: '&larr; Назад',
                doneBtnText: 'Готово',
                steps: steps,
                onDestroyStarted: () => {
                    // Mark as seen when closed or finished
                    localStorage.setItem(`hasSeenOnboarding_${tourName}`, 'true');
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
