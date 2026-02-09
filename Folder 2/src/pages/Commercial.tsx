import { useState, useEffect } from 'react';
import { CommercialOffers } from '@/components/sections/CommercialOffers';

const Commercial = () => {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    if (!user) return null;

    return <CommercialOffers user={user} />;
};

export default Commercial;
