#!/usr/bin/env node
/**
 * Ganland Wallet - Multi-chain wallet management
 * Usage: node src/wallet.mjs [command] [chain]
 * Commands: balance, address, chains
 */

import { createPublicClient, http, formatEther } from 'viem';
import { mainnet, optimism, base } from 'viem/chains';
import { readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

// GAN Treasury wallet - to be configured
// Note: Old wallet 0xF393...57C6 was deprecated (Austin Griffith scaffold-eth default)
const WALLET = null; // Set this to the actual Fractal Visions treasury wallet

// Load Alchemy key for faster RPCs
const ALCHEMY_KEY = (() => {
  try {
    return readFileSync(join(homedir(), '.local/secrets/alchemy-api-key'), 'utf8').trim();
  } catch { return null; }
})();

// Supported chains - Fractal Visions ecosystem
const CHAINS = {
  ethereum: { 
    chain: mainnet, 
    rpc: ALCHEMY_KEY ? `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}` : 'https://eth.llamarpc.com' 
  },
  optimism: { 
    chain: optimism, 
    rpc: ALCHEMY_KEY ? `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}` : 'https://mainnet.optimism.io' 
  },
  base: { 
    chain: base, 
    rpc: ALCHEMY_KEY ? `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}` : 'https://mainnet.base.org' 
  },
  shape: { id: 360, name: 'Shape', rpc: 'https://mainnet.shape.network' },
  soneium: { id: 1868, name: 'Soneium', rpc: 'https://rpc.soneium.org' },
  unichain: { id: 130, name: 'Unichain', rpc: 'https://mainnet.unichain.org' },
  superseed: { id: 5330, name: 'Superseed', rpc: 'https://mainnet.superseed.xyz' }
};

/**
 * Get ETH balance for a specific chain
 */
async function getBalance(chainKey, address = WALLET) {
  const config = CHAINS[chainKey];
  if (!config) return null;
  
  try {
    const client = createPublicClient({
      chain: config.chain || { id: config.id, name: config.name },
      transport: http(config.rpc)
    });
    
    const balance = await client.getBalance({ address });
    return formatEther(balance);
  } catch (e) {
    return `error: ${e.message.slice(0, 50)}`;
  }
}

const commands = {
  /**
   * Check wallet balance on one or all chains
   */
  async balance(chain) {
    if (chain && CHAINS[chain]) {
      const bal = await getBalance(chain);
      console.log(`${chain}: ${bal} ETH`);
    } else {
      console.log('Ganland Wallet Balances');
      console.log('Alchemy:', ALCHEMY_KEY ? '✓ connected' : '✗ using public RPCs');
      console.log('Address:', WALLET);
      console.log('---');
      for (const [key] of Object.entries(CHAINS)) {
        const bal = await getBalance(key);
        console.log(`${key}: ${bal} ETH`);
      }
    }
  },
  
  /**
   * Print wallet address
   */
  address() {
    console.log(WALLET);
  },
  
  /**
   * List all supported chains
   */
  chains() {
    console.log('Supported chains (Fractal Visions ecosystem):');
    for (const [key, config] of Object.entries(CHAINS)) {
      const chainId = config.chain?.id || config.id;
      const chainName = config.chain?.name || config.name;
      console.log(`  ${key}: ${chainName} (${chainId})`);
    }
  },

  /**
   * Show help
   */
  help() {
    console.log(`
Ganland Wallet - Multi-chain wallet management

Commands:
  balance [chain]  Check ETH balance (all chains or specific)
  address          Print wallet address
  chains           List supported chains
  help             Show this help

Examples:
  node src/wallet.mjs balance
  node src/wallet.mjs balance base
  node src/wallet.mjs address
`);
  }
};

// CLI entrypoint
const [cmd = 'help', ...args] = process.argv.slice(2);

if (!commands[cmd]) {
  console.error(`Unknown command: ${cmd}`);
  commands.help();
  process.exit(1);
}

commands[cmd](...args).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
