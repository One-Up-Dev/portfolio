/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "localhost",
      "127.0.0.1",
      "vercel.blob.com", // Vercel Blob storage
      "*.vercel.blob.com",
    ],
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
