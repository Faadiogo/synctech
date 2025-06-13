/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  
  // Garantir que as variáveis de ambiente sejam expostas
  env: {
    // Hardcode temporário até resolver o problema de carregamento
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dmy660iv6',
  },
  
  // Debug de variáveis de ambiente em desenvolvimento
  ...(process.env.NODE_ENV === 'development' && {
    webpack: (config, { dev, isServer }) => {
      if (dev && !isServer) {
        console.log('🔍 Debug Next.js - Variáveis de ambiente:');
        console.log('- process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
        console.log('- Hardcode fallback: dmy660iv6');
      }
      return config;
    },
  }),
};

module.exports = nextConfig;
