import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['9000-firebase-studio-1749725579144.cluster-zumahodzirciuujpqvsniawo3o.cloudworkstations.dev','studio.firebase.google.com', '*.cloudworkstations.dev', '*.local-origin.dev'],
  // crossOrigin: 'anonymous',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
