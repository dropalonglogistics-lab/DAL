import path from 'path';
import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
    outputFileTracingRoot: path.join(__dirname, './'),
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
    // disableLogger: true,
    // automaticVercelMonitors: true,
});
