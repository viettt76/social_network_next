import Header from '@/app/components/Header';
import AppProvider from '@/app/components/AppProvider';
import ScrollToTop from '@/app/components/ScrollToTop';
import SocketProvider from '@/app/components/SocketProvider';
import ConversationBubbles from '@/app/components/ConversationBubbles';

export default async function DefaultLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <AppProvider>
            <SocketProvider>
                <ConversationBubbles />
                <ScrollToTop />
                <div id="root">
                    <Header />
                    {children}
                </div>
            </SocketProvider>
        </AppProvider>
    );
}
