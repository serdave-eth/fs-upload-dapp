# Ethers Version Compatibility Guide

This guide explains how to handle projects that need both **ethers v5** and **ethers v6** packages simultaneously, particularly when using Lit Protocol, Keypo TypeScript SDK, and other packages with conflicting ethers version requirements.

## Problem

Many Web3 packages have conflicting ethers version requirements:
- **Lit Protocol packages** and **@keypo/typescript-sdk** require **ethers v5**
- **Modern Web3 packages** like **wagmi**, **rainbowkit**, **@filoz/synapse-sdk** require **ethers v6**

The main issue is that ethers v5 and v6 have different export structures:
- **ethers v5**: `ethers/lib/utils`, `ethers/lib/wordlist`, etc.
- **ethers v6**: `ethers/utils`, `ethers/wordlist`, etc.

## Solution

Use **npm aliases** and **webpack configuration** to run both versions simultaneously.

## Configuration Steps

### 1. Package.json Setup

```json
{
  "dependencies": {
    "ethers": "^6.14.3",
    "ethers-v5": "npm:ethers@^5.7.2",
    "@keypo/typescript-sdk": "^1.0.37-beta.1",
    "@lit-protocol/auth-browser": "^7.2.0",
    "@lit-protocol/constants": "^7.2.0",
    "@lit-protocol/encryption": "^7.2.0",
    "@lit-protocol/lit-node-client": "^7.2.0",
    "@lit-protocol/types": "^7.2.0",
    // ... other dependencies
  },
  "overrides": {
    "@keypo/typescript-sdk": {
      "ethers": "ethers-v5"
    },
    "@lit-protocol/access-control-conditions": {
      "ethers": "ethers-v5"
    },
    "@lit-protocol/auth-browser": {
      "ethers": "ethers-v5"
    },
    "@lit-protocol/contracts-sdk": {
      "ethers": "ethers-v5"
    },
    "@lit-protocol/crypto": {
      "ethers": "ethers-v5"
    },
    "@lit-protocol/lit-node-client-nodejs": {
      "ethers": "ethers-v5"
    },
    "@lit-protocol/auth-helpers": {
      "ethers": "ethers-v5"
    },
    "@lit-protocol/core": {
      "ethers": "ethers-v5"
    },
    "@lit-protocol/lit-node-client": {
      "ethers": "ethers-v5"
    }
  }
}
```

### 2. Next.js Configuration (next.config.ts)

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Redirect all ethers imports to ethers-v5 for Lit Protocol packages
    config.resolve.alias = {
      ...config.resolve.alias,
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
```

### 3. Alternative: Vite Configuration (vite.config.ts)

If using Vite instead of Next.js:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'ethers': 'ethers-v5',
      'ethers/lib/utils': 'ethers-v5/lib/utils',
      'ethers/lib/wordlist': 'ethers-v5/lib/wordlist',
      'ethers/lib/constants': 'ethers-v5/lib/constants',
    }
  }
});
```

### 4. Alternative: Webpack Configuration (webpack.config.js)

For custom webpack setups:

```javascript
module.exports = {
  resolve: {
    alias: {
      'ethers': require.resolve('ethers-v5'),
      'ethers/lib/utils': require.resolve('ethers-v5/lib/utils'),
      'ethers/lib/wordlist': require.resolve('ethers-v5/lib/wordlist'),
      'ethers/lib/constants': require.resolve('ethers-v5/lib/constants'),
    }
  },
  plugins: [
    {
      apply: (compiler) => {
        compiler.hooks.normalModuleFactory.tap('EthersV5AliasPlugin', (nmf) => {
          nmf.hooks.beforeResolve.tap('EthersV5AliasPlugin', (result) => {
            if (result && result.request && result.request.startsWith('ethers/lib/')) {
              result.request = result.request.replace('ethers/lib/', 'ethers-v5/lib/');
            }
          });
        });
      }
    }
  ]
};
```

## How It Works

1. **npm aliases**: `ethers-v5: "npm:ethers@^5.7.2"` creates an alias for ethers v5
2. **Package overrides**: Forces specific packages to use `ethers-v5` instead of the main `ethers` package
3. **Webpack aliases**: Redirects all `ethers` imports to `ethers-v5` at build time
4. **Webpack plugin**: Transforms `ethers/lib/*` imports to `ethers-v5/lib/*` for compatibility

## Package Compatibility

### Requires ethers v5:
- `@keypo/typescript-sdk`
- `@lit-protocol/*` packages
- Older Web3 packages

### Requires ethers v6:
- `wagmi`
- `@rainbow-me/rainbowkit`
- `@filoz/synapse-sdk`
- `viem` (compatible with ethers v6)

## Troubleshooting

### Common Issues:

1. **"Module not found: ethers/lib/utils"**
   - Solution: Ensure webpack plugin is properly configured to transform these imports

2. **"Package path ./lib/utils is not exported"**
   - Solution: This happens when ethers v6 is used where v5 is expected. Check your overrides.

3. **Build fails with webpack errors**
   - Solution: Verify the webpack plugin syntax and ensure all required ethers v5 modules exist

### Verification:

Check that both versions are installed correctly:
```bash
npm ls ethers
npm ls ethers-v5
```

## Best Practices

1. **Always test builds** after making changes
2. **Use specific version ranges** to avoid breaking changes
3. **Document which packages need which ethers version** in your project
4. **Consider migrating** to packages that support ethers v6 when possible
5. **Keep overrides minimal** - only override packages that actually need ethers v5

## Migration Strategy

For long-term projects, consider:
1. **Gradually migrating** Lit Protocol packages to ethers v6 compatible versions
2. **Using alternative packages** that support ethers v6
3. **Contributing** to packages to add ethers v6 support
4. **Forking packages** and updating them yourself if needed

## Example Project Structure

```
project/
├── package.json          # Contains both ethers versions and overrides
├── next.config.ts        # Webpack configuration for version handling
├── src/
│   ├── components/       # React components using both ethers versions
│   ├── hooks/           # Custom hooks for Web3 functionality
│   └── utils/           # Utility functions
└── ETHERS_VERSION_COMPATIBILITY.md  # This guide
```

This configuration allows you to use both ethers versions simultaneously without conflicts, enabling you to leverage the latest Web3 tooling while maintaining compatibility with packages that haven't been updated to ethers v6 yet.
