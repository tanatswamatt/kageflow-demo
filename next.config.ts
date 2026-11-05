import type { NextConfig } from 'next';

const supabase = (() => {
  try { return process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin : ''; } catch { return ''; }
})();
const isDev = process.env.NODE_ENV !== 'production';

const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  `style-src 'self' 'unsafe-inline'`,
  // Kageflow's photo storage too: cars pushed from Kageflow show their photos by link
  `img-src 'self' data: blob: ${supabase} https://*.supabase.co`.trim(),
  `font-src 'self'`,
  `connect-src 'self' ${supabase} ${supabase.replace(/^http/, 'ws')}${isDev ? ' ws://localhost:*' : ''}`.trim(),
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
].join('; ');

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'Content-Security-Policy', value: csp },
        { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }];
  },
};

export default nextConfig;
