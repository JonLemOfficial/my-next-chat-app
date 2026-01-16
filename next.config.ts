import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,
  allowedDevOrigins: [
    // Add your Network development IPs here
    // 'XXX.XXX.XXX.XXX'
    // ...
  ]
};

export default nextConfig;
