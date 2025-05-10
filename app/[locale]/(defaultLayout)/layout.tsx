'use client';

import Header from '@/app/components/Header';
import AppProvider from '@/app/components/AppProvider';
import ScrollToTop from '@/app/components/ScrollToTop';
import SocketProvider from '@/app/components/SocketProvider';
import ConversationBubbles from '@/app/components/ConversationBubbles';
import { usePathname, useRouter } from '@/i18n/routing';
import MovieHeader from '@/app/components/MovieHeader';
import { useState } from 'react';
import { SetupInterceptors } from '@/lib/services/api';

export default function DefaultLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();

    return (
        <AppProvider>
            <NavigateFunctionComponent />
            <SocketProvider>
                <ConversationBubbles />
                <ScrollToTop />
                <div className="flex flex-col h-screen">
                    {pathname.includes('/movie') ? <MovieHeader /> : <Header />}
                    <div className="flex-1">{children}</div>
                </div>
            </SocketProvider>
        </AppProvider>
    );
}

function NavigateFunctionComponent() {
    const router = useRouter();
    const [ran, setRan] = useState(false);

    if (!ran) {
        SetupInterceptors(router);
        setRan(true);
    }
    return <></>;
}
