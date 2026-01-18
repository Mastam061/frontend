/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['web.archive.org'],
  },
}

module.exports = nextConfig