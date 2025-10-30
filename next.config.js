/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'pino-pretty': false,
      '@react-native-async-storage/async-storage': false,
    };
    config.externals.push({
      'pino-pretty': 'pino-pretty',
      '@react-native-async-storage/async-storage': '@react-native-async-storage/async-storage'
    });
    return config;
  },
}

module.exports = nextConfig
