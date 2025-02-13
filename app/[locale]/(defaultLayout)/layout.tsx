import Header from '@/app/components/Header';
import AppProvider from '@/app/components/AppProvider';
import ScrollToTop from '@/app/components/ScrollToTop';
import SocketProvider from '@/app/components/SocketProvider';

export default async function DefaultLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <AppProvider>
            <SocketProvider>
                <ScrollToTop />
                <div id="root">
                    <Header />
                    {children}
                </div>
            </SocketProvider>
        </AppProvider>
    );
}
