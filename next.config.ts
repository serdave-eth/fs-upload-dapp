import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Add alias to redirect ethers imports for Lit Protocol packages
    config.resolve.alias = {
      ...config.resolve.alias,
      // Redirect ethers to ethers-v5 for specific packages that need v5
      'ethers': require.resolve('ethers-v5'),
    };
    
    // Add a webpack plugin to handle ethers/lib/* imports
    config.plugins.push({
      apply: (compiler: any) => {
        compiler.hooks.normalModuleFactory.tap('EthersV5AliasPlugin', (nmf: any) => {
          nmf.hooks.beforeResolve.tap('EthersV5AliasPlugin', (result: any) => {
            if (result && result.request && result.request.startsWith('ethers/lib/')) {
              result.request = result.request.replace('ethers/lib/', 'ethers-v5/lib/');
            }
          });
        });
      }
    });
    
    return config;
  },
};

export default nextConfig;
