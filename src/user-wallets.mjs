#!/usr/bin/env node
/**
 * Ganland User Wallet System
 * HD wallet derivation for X/Twitter users
 * 
 * Each user gets a deterministic wallet derived from:
 * Master Seed → m/44'/60'/0'/0/{user_index}
 * 
 * User index = hash of Twitter user ID → mod 2^31
 */

import { createPublicClient, createWalletClient, http, formatEther, parseEther, formatUnits, parseUnits } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { HDKey } from '@scure/bip32';
import { mnemonicToSeedSync } from '@scure/bip39';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { createHash } from 'crypto';

// === CONFIGURATION ===

const SECRETS_DIR = join(homedir(), '.local/secrets');
const WALLETS_DB = join(SECRETS_DIR, 'ganland-wallets.json');

// $GAN Token on Base
const GAN_TOKEN = '0xc2fa8cfa51B02fDeb84Bb22d3c9519EAEB498b07';
const CHAIN = base;

// Load Alchemy key for RPCs
const ALCHEMY_KEY = (() => {
  try {
    return readFileSync(join(SECRETS_DIR, 'alchemy-api-key'), 'utf8').trim();
  } catch { return null; }
})();

const RPC_URL = ALCHEMY_KEY 
  ? `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}` 
  : 'https://mainnet.base.org';

// ERC20 ABI for balance and transfer
const ERC20_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'transfer',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view'
  }
];

// === WALLET DATABASE ===

function loadWalletsDB() {
  try {
    if (existsSync(WALLETS_DB)) {
      return JSON.parse(readFileSync(WALLETS_DB, 'utf8'));
    }
  } catch {}
  return { users: {}, byAddress: {} };
}

function saveWalletsDB(db) {
  if (!existsSync(SECRETS_DIR)) {
    mkdirSync(SECRETS_DIR, { recursive: true });
  }
  writeFileSync(WALLETS_DB, JSON.stringify(db, null, 2));
}

// === HD WALLET DERIVATION ===

/**
 * Load or generate master seed
 * IMPORTANT: Master seed is stored securely and never exposed
 */
function getMasterSeed() {
  const seedPath = join(SECRETS_DIR, 'ganland-master-seed');
  
  try {
    return readFileSync(seedPath, 'utf8').trim();
  } catch {
    throw new Error('Master seed not found. Run: node src/user-wallets.mjs init');
  }
}

/**
 * Generate deterministic index from user ID
 * Uses SHA-256 hash to map any user ID to a safe derivation index
 */
function userIdToIndex(userId) {
  const hash = createHash('sha256').update(String(userId)).digest();
  // Use first 4 bytes as uint32, then mod 2^31 for BIP32 safety
  const index = hash.readUInt32BE(0) % 0x80000000;
  return index;
}

/**
 * Derive wallet for a specific user
 */
function deriveWalletForUser(userId, username) {
  const mnemonic = getMasterSeed();
  const seed = mnemonicToSeedSync(mnemonic);
  const hdKey = HDKey.fromMasterSeed(seed);
  
  const index = userIdToIndex(userId);
  const path = `m/44'/60'/0'/0/${index}`;
  const derived = hdKey.derive(path);
  
  if (!derived.privateKey) {
    throw new Error('Failed to derive wallet');
  }
  
  const privateKey = `0x${Buffer.from(derived.privateKey).toString('hex')}`;
  const account = privateKeyToAccount(privateKey);
  
  return {
    userId,
    username,
    address: account.address,
    derivationPath: path,
    index,
    createdAt: new Date().toISOString()
  };
}

/**
 * Get or create wallet for a user
 */
function getOrCreateWallet(userId, username) {
  const db = loadWalletsDB();
  
  // Check if user already has wallet
  if (db.users[userId]) {
    return { wallet: db.users[userId], isNew: false };
  }
  
  // Derive new wallet
  const wallet = deriveWalletForUser(userId, username);
  
  // Save to database (no private keys stored, just metadata)
  db.users[userId] = {
    userId,
    username,
    address: wallet.address,
    index: wallet.index,
    createdAt: wallet.createdAt
  };
  db.byAddress[wallet.address.toLowerCase()] = userId;
  
  saveWalletsDB(db);
  
  return { wallet: db.users[userId], isNew: true };
}

/**
 * Lookup user by address
 */
function getUserByAddress(address) {
  const db = loadWalletsDB();
  const userId = db.byAddress[address.toLowerCase()];
  if (userId) {
    return db.users[userId];
  }
  return null;
}

// === BLOCKCHAIN OPERATIONS ===

function getPublicClient() {
  return createPublicClient({
    chain: CHAIN,
    transport: http(RPC_URL)
  });
}

function getWalletClient(userId) {
  const mnemonic = getMasterSeed();
  const seed = mnemonicToSeedSync(mnemonic);
  const hdKey = HDKey.fromMasterSeed(seed);
  
  const index = userIdToIndex(userId);
  const path = `m/44'/60'/0'/0/${index}`;
  const derived = hdKey.derive(path);
  
  const privateKey = `0x${Buffer.from(derived.privateKey).toString('hex')}`;
  const account = privateKeyToAccount(privateKey);
  
  return createWalletClient({
    account,
    chain: CHAIN,
    transport: http(RPC_URL)
  });
}

/**
 * Check balances for a wallet
 */
async function checkBalances(address) {
  const client = getPublicClient();
  
  // Get ETH balance
  const ethBalance = await client.getBalance({ address });
  
  // Get $GAN balance
  const ganBalance = await client.readContract({
    address: GAN_TOKEN,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address]
  });
  
  return {
    eth: formatEther(ethBalance),
    gan: formatUnits(ganBalance, 18),
    ethWei: ethBalance.toString(),
    ganWei: ganBalance.toString()
  };
}

/**
 * Transfer $GAN tokens from one user to another
 */
async function transferGan(fromUserId, toAddress, amount) {
  const walletClient = getWalletClient(fromUserId);
  const publicClient = getPublicClient();
  
  // Parse amount (supports "100000" or "100,000" formats)
  const cleanAmount = String(amount).replace(/,/g, '');
  const amountWei = parseUnits(cleanAmount, 18);
  
  // Check balance first
  const balance = await publicClient.readContract({
    address: GAN_TOKEN,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [walletClient.account.address]
  });
  
  if (balance < amountWei) {
    throw new Error(`Insufficient $GAN balance. Have: ${formatUnits(balance, 18)}, Need: ${cleanAmount}`);
  }
  
  // Execute transfer
  const hash = await walletClient.writeContract({
    address: GAN_TOKEN,
    abi: ERC20_ABI,
    functionName: 'transfer',
    args: [toAddress, amountWei]
  });
  
  // Wait for confirmation
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  
  return {
    hash,
    from: walletClient.account.address,
    to: toAddress,
    amount: cleanAmount,
    status: receipt.status === 'success' ? 'confirmed' : 'failed'
  };
}

/**
 * Transfer ETH from one user to another
 */
async function transferEth(fromUserId, toAddress, amount) {
  const walletClient = getWalletClient(fromUserId);
  const publicClient = getPublicClient();
  
  const amountWei = parseEther(amount);
  
  // Check balance first
  const balance = await publicClient.getBalance({ 
    address: walletClient.account.address 
  });
  
  if (balance < amountWei) {
    throw new Error(`Insufficient ETH balance. Have: ${formatEther(balance)}, Need: ${amount}`);
  }
  
  // Execute transfer
  const hash = await walletClient.sendTransaction({
    to: toAddress,
    value: amountWei
  });
  
  // Wait for confirmation
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  
  return {
    hash,
    from: walletClient.account.address,
    to: toAddress,
    amount,
    status: receipt.status === 'success' ? 'confirmed' : 'failed'
  };
}

// === CLI COMMANDS ===

const commands = {
  /**
   * Initialize master seed (run once)
   */
  async init() {
    const seedPath = join(SECRETS_DIR, 'ganland-master-seed');
    
    if (existsSync(seedPath)) {
      console.log('⚠️  Master seed already exists.');
      console.log('Delete', seedPath, 'to regenerate (THIS WILL INVALIDATE ALL WALLETS)');
      return;
    }
    
    // Generate new mnemonic
    const { generateMnemonic } = await import('@scure/bip39');
    const { wordlist } = await import('@scure/bip39/wordlists/english');
    
    const mnemonic = generateMnemonic(wordlist, 256); // 24 words
    
    if (!existsSync(SECRETS_DIR)) {
      mkdirSync(SECRETS_DIR, { recursive: true });
    }
    
    writeFileSync(seedPath, mnemonic);
    
    console.log('✅ Master seed generated and saved');
    console.log('📍 Location:', seedPath);
    console.log('⚠️  BACKUP THIS FILE! Losing it = losing all user wallets');
  },
  
  /**
   * Create or get wallet for a user
   */
  async create(userId, username) {
    if (!userId) {
      console.error('Usage: node src/user-wallets.mjs create <userId> [username]');
      return;
    }
    
    const { wallet, isNew } = getOrCreateWallet(userId, username || `user_${userId}`);
    
    console.log(isNew ? '🔐 New wallet created!' : '📍 Existing wallet found');
    console.log('User:', wallet.username, `(ID: ${wallet.userId})`);
    console.log('Address:', wallet.address);
    console.log('Basescan:', `https://basescan.org/address/${wallet.address}`);
  },
  
  /**
   * Check balances for a user
   */
  async balance(userId) {
    if (!userId) {
      console.error('Usage: node src/user-wallets.mjs balance <userId>');
      return;
    }
    
    const db = loadWalletsDB();
    const user = db.users[userId];
    
    if (!user) {
      console.error('User not found. Create wallet first.');
      return;
    }
    
    console.log('💰 Wallet balances for', user.username);
    console.log('Address:', user.address);
    console.log('---');
    
    const balances = await checkBalances(user.address);
    
    console.log('ETH:', balances.eth, balances.eth === '0' ? '⚠️ Need gas' : '✓');
    console.log('$GAN:', parseFloat(balances.gan).toLocaleString());
  },
  
  /**
   * Transfer $GAN between users
   */
  async transfer(fromUserId, toUserIdOrAddress, amount) {
    if (!fromUserId || !toUserIdOrAddress || !amount) {
      console.error('Usage: node src/user-wallets.mjs transfer <fromUserId> <toUserIdOrAddress> <amount>');
      return;
    }
    
    const db = loadWalletsDB();
    const fromUser = db.users[fromUserId];
    
    if (!fromUser) {
      console.error('From user not found. Create wallet first.');
      return;
    }
    
    // Resolve destination address
    let toAddress;
    if (toUserIdOrAddress.startsWith('0x')) {
      toAddress = toUserIdOrAddress;
    } else {
      const toUser = db.users[toUserIdOrAddress];
      if (!toUser) {
        console.error('To user not found. They need to create a wallet first.');
        return;
      }
      toAddress = toUser.address;
    }
    
    console.log('📤 Transferring', amount, '$GAN');
    console.log('From:', fromUser.username, `(${fromUser.address.slice(0, 10)}...)`);
    console.log('To:', toAddress.slice(0, 10) + '...');
    
    try {
      const result = await transferGan(fromUserId, toAddress, amount);
      console.log('✅ Transfer', result.status);
      console.log('TX:', `https://basescan.org/tx/${result.hash}`);
    } catch (e) {
      console.error('❌ Transfer failed:', e.message);
    }
  },
  
  /**
   * List all registered users
   */
  async list() {
    const db = loadWalletsDB();
    const users = Object.values(db.users);
    
    if (users.length === 0) {
      console.log('No users registered yet.');
      return;
    }
    
    console.log('📋 Registered Ganland Wallets');
    console.log('---');
    
    for (const user of users) {
      console.log(`@${user.username} (ID: ${user.userId})`);
      console.log(`  ${user.address}`);
    }
    
    console.log('---');
    console.log('Total:', users.length, 'wallets');
  },
  
  /**
   * Lookup user by address
   */
  async lookup(address) {
    if (!address) {
      console.error('Usage: node src/user-wallets.mjs lookup <address>');
      return;
    }
    
    const user = getUserByAddress(address);
    
    if (!user) {
      console.log('Address not found in Ganland wallet system.');
      return;
    }
    
    console.log('🔍 Found user:');
    console.log('Username:', user.username);
    console.log('User ID:', user.userId);
    console.log('Created:', user.createdAt);
  },
  
  async help() {
    console.log(`
Ganland User Wallet System
==========================

Commands:
  init                                    Initialize master seed (run once)
  create <userId> [username]              Create/get wallet for user
  balance <userId>                        Check ETH + $GAN balances
  transfer <fromId> <toIdOrAddress> <amt> Transfer $GAN between users
  list                                    List all registered wallets
  lookup <address>                        Find user by wallet address
  help                                    Show this help

Examples:
  node src/user-wallets.mjs init
  node src/user-wallets.mjs create 123456789 cooluser
  node src/user-wallets.mjs balance 123456789
  node src/user-wallets.mjs transfer 123456789 987654321 100000
  node src/user-wallets.mjs transfer 123456789 0x1234...abcd 50000
`);
  }
};

// === EXPORTS FOR X COMMAND PARSER ===

export {
  getOrCreateWallet,
  checkBalances,
  transferGan,
  transferEth,
  getUserByAddress,
  loadWalletsDB
};

// === CLI ENTRYPOINT ===

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
