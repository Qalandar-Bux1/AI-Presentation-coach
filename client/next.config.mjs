/** @type {import('next').NextConfig} */
const isDesktop = process.env.BUILD_DESKTOP === "1";

const nextConfig = {
  reactStrictMode: true,
  ...(isDesktop
    ? {
        // Electron runs this as a bundled Next server (no local Node install needed,
        // because Electron ships Node runtime).
        output: "standalone",
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
