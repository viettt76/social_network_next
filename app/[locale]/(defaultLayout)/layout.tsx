'use client';

import Header from '@/app/components/Header';
import AppProvider from '@/app/components/AppProvider';
import ScrollToTop from '@/app/components/ScrollToTop';
import SocketProvider from '@/app/components/SocketProvider';
import ConversationBubbles from '@/app/components/ConversationBubbles';
import { usePathname } from '@/i18n/routing';
import MovieHeader from '@/app/components/MovieHeader';

export default function DefaultLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();

    return (
        <AppProvider>
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
