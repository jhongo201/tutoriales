/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/tutorials',
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['mssql', 'ldapjs'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sgrl.mintrabajo.gov.co',
      },
    ],
  },
  async headers() {
    const isProd = process.env.NODE_ENV === 'production'

    const cspDirectives = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      `script-src 'self' 'unsafe-inline'${isProd ? '' : " 'unsafe-eval'"}`,
      `connect-src 'self' https:${isProd ? '' : ' http: ws: wss:'}`,
      "media-src 'self' blob: https:",
      "form-action 'self'",
      ...(isProd ? ['upgrade-insecure-requests'] : []),
    ]

    const securityHeaders = [
      { key: 'Content-Security-Policy', value: cspDirectives.join('; ') },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
      { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
      ...(isProd
        ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }]
        : []),
    ]

    const corsOrigin = process.env.CORS_ORIGIN || ''
    const corsHeaders = corsOrigin
      ? [
          { key: 'Access-Control-Allow-Origin', value: corsOrigin },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Vary', value: 'Origin' },
        ]
      : []

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/api/:path*',
        headers: [...securityHeaders, ...corsHeaders],
      },
    ]
  },
}

module.exports = nextConfig