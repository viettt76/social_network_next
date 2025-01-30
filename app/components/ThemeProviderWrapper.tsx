import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';

export default function ThemeProviderWrapper({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
        </ThemeProvider>
    );
}
