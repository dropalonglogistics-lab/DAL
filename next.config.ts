import path from 'path';
import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
    outputFileTracingRoot: path.join(__dirname, './'),
    async redirects() {
        return [
            { source: '/register', destination: '/signup', permanent: true },
            { source: '/auth/login', destination: '/login', permanent: true },
            { source: '/auth/register', destination: '/signup', permanent: true }
        ]
    }
};

export default withSentryConfig(nextConfig, {
    org: "dal",
    project: "dal-platform",
    silent: !process.env.CI,
    widenClientFileUpload: true,
    reactComponentAnnotation: {
        enabled: true,
    },
    sourcemaps: { disable: false },
});
