import type { NextConfig } from 'next';

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        domains: [
            'kynguyenlamdep.com',
            'img3.thuthuatphanmem.vn',
            'cdn.donmai.us',
            'th.bing.com',
            'khoinguonsangtao.vn',
            'bedental.vn',
            'demoda.vn',
            'res.cloudinary.com',
        ],
    },
    reactStrictMode: false,
};

export default withNextIntl(nextConfig);
