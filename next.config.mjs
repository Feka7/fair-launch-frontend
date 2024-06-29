/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
      ignoreBuildErrors: true
    },
    webpack: (config) => {
      config.externals.push("pino-pretty", "lokijs", "encoding");
      return config;
    },
    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.ipfscdn.io',
      },
    ],
  },
  };
  
  export default nextConfig;