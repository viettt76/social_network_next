import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { Role } from './lib/constants';
import { jwtVerify } from 'jose';

const intlMiddleware = createMiddleware(routing);

export async function middleware(req: NextRequest) {
    const url = new URL(req.url);
    const token = req.cookies.get('token')?.value;
    const refreshToken = req.cookies.get('refreshToken')?.value;
    const isAuth = !!token || !!refreshToken;
    const isAuthFreePage = ['/login', '/signup'].some((path) => url.pathname.includes(path));
    const isAdminPage = url.pathname.includes('/admin');

    if (!isAuth && !isAuthFreePage) {
        const locale = url.pathname.split('/')[1] || 'en';
        return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
    }

    if (isAuth && isAuthFreePage) {
        const locale = url.pathname.split('/')[1] || 'en';
        return NextResponse.redirect(new URL(`/${locale}/`, req.url));
    }

    if (isAdminPage && token && process.env.JWT_ACCESS_SECRET) {
        try {
            const user = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_ACCESS_SECRET));

            if ((user.payload as any).role !== Role.ADMIN) {
                return NextResponse.error();
            }
        } catch (error) {
            console.error(error);
            return NextResponse.error();
        }
    }

    return intlMiddleware(req);
}

export const config = {
    matcher: ['/', '/(en|vi)/:path*'],
};
