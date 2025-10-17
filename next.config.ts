/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "res.cloudinary.com",
        pathname: "/**", // 👈 allow fallback in case some images use http
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**", // 👈 allow fallback in case some images use http
      },
    ],
  },
};

export default nextConfig;
