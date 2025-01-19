import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export function middleware(req: NextRequest) {
    const url = new URL(req.url);
    const token = req.cookies.get('token');
    const refreshToken = req.cookies.get('refreshToken');
    const isAuth = !!token || !!refreshToken;
    const isAuthFreePage = ['/login', '/signup'].some((path) => url.pathname.includes(path));

    if (!isAuth && !isAuthFreePage) {
        const locale = url.pathname.split('/')[1] || 'en';
        return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
    }

    if (isAuth && isAuthFreePage) {
        const locale = url.pathname.split('/')[1] || 'en';
        return NextResponse.redirect(new URL(`/${locale}/`, req.url));
    }

    return intlMiddleware(req);
}

export const config = {
    matcher: ['/', '/(en|vi)/:path*'],
};
