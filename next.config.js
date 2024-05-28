/** @type {import('next').NextConfig} */
const nextConfig = {
    // required for jest, see this issue: https://github.com/vercel/next.js/issues/52541
    transpilePackages: ['ramda']
}

module.exports = nextConfig
