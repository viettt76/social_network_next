'use client';

import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/lib/store';
import { getPostReactions } from '@/lib/services/postService';
import { setPostReactionType } from '@/lib/features/reactionType/reactionTypeSlice';

export default function ReactionTypeProviderWrapper({ children }: { children: React.ReactNode }) {
    const storeRef = useRef<AppStore | null>(null);
    if (!storeRef.current) {
        storeRef.current = makeStore();
    }

    useEffect(() => {
        (async () => {
            try {
                const res = await getPostReactions();
                storeRef.current?.dispatch(setPostReactionType(res.data));
            } catch (error) {
                console.log(error);
            }
        })();
    }, []);

    return <Provider store={storeRef.current}>{children}</Provider>;
}
