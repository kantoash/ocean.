/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: true
    },
    images: {
        domains: ["fckqcakvcrskellvslyj.supabase.co"]
    }
}

module.exports = nextConfig
