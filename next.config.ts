import type { NextConfig } from 'next';

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        domains: ['kynguyenlamdep.com', 'img3.thuthuatphanmem.vn', 'cdn.donmai.us', 'th.bing.com'],
    },
};

export default withNextIntl(nextConfig);
