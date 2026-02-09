import { useState, useEffect } from 'react';
import { Subscription as SubscriptionComponent } from '@/components/sections/Subscription';

const SubscriptionPage = () => {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const handleUpdateUser = (userData: any) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    if (!user) return null;

    return <SubscriptionComponent user={user} onUpdateUser={handleUpdateUser} />;
};

export default SubscriptionPage;
