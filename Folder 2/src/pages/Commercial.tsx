import { useState, useEffect } from 'react';
import { CommercialOffers } from '@/components/sections/CommercialOffers';
import { usePageOnboarding } from '@/components/layout/useOnboarding';
import { DriveStep } from 'driver.js';

const Commercial = () => {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    // Tour configuration
    const commercialTourSteps: DriveStep[] = [
        {
            popover: {
                title: 'Коммерческие предложения 📄',
                description: 'Модуль КП позволяет за пару минут собрать подробную смету и выгрузить ее в красивый PDF-файл для клиента.',
                align: 'center'
            }
        },
        {
            element: '#tour-co-create',
            popover: {
                title: 'Создание КП',
                description: 'Нажмите для создания нового КП. После создания вы сможете добавить комнаты, работы и материалы прямо из встроенного справочника.',
                side: 'bottom',
                align: 'end'
            }
        }
    ];

    usePageOnboarding(!!user, 'commercial_page', commercialTourSteps);

    if (!user) return null;

    return <CommercialOffers user={user} />;
};

export default Commercial;
