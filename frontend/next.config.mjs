/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep Turbopack rooted in this app (avoids picking up parent lockfiles)
  turbopack: {
    root: import.meta.dirname,
  },
}

export default nextConfig
