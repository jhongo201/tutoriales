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
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://sgrl.mintrabajo.gov.co' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}

module.exports = nextConfig