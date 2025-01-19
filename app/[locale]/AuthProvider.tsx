'use client';
import { useEffect, useRef, useState } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/lib/store';
import { getMyInfoService } from '@/lib/services/userService';
import { setInfo } from '@/lib/features/users/usersSlice';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const storeRef = useRef<AppStore | null>(null);
    if (!storeRef.current) {
        storeRef.current = makeStore();
    }

    useEffect(() => {
        (async () => {
            try {
                const res = await getMyInfoService();
                storeRef.current?.dispatch(setInfo(res));
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    if (isLoading) {
        return null;
    }

    return <Provider store={storeRef.current}>{children}</Provider>;
}
