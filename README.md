# Ganland Wallet System

HD wallet generation and management for the Fractal Visions ecosystem. Create wallets, check balances, and transfer $GAN — all via X/Twitter commands.

## 🎮 X/Twitter Commands

Interact with GAN on X by mentioning [@GanlandNFT](https://x.com/GanlandNFT):

### Create Wallet
```
@GanlandNFT create wallet
```
> 🔐 @yourhandle, your Ganland wallet is ready!
> 📍 Address: 0x1234...abcd
> 💰 Fund it on Base with ETH (gas) + $GAN

### Check Balance
```
@GanlandNFT check balance
```
> 💰 @yourhandle wallet balances:
> • 0.001 ETH ✓
> • 500,000 $GAN ✓
> Ready to generate art!

### Generate Art (requires funded wallet)
```
@GanlandNFT cosmic fractal eye with sacred geometry
```
> 🎨 Generating: "cosmic fractal eye with sacred geometry"
> [Generated artwork appears in reply]

### Transfer $GAN to Another User
```
@GanlandNFT send 100000 $GAN to @friendshandle
```
> ✅ Sent 100,000 $GAN to @friendshandle
> TX: basescan.org/tx/0x...

### Transfer $GAN to Any Address
```
@GanlandNFT send 50000 $GAN to 0x1234...abcd
```
> ✅ Sent 50,000 $GAN to 0x1234...abcd
> TX: basescan.org/tx/0x...

### Get Wallet Address
```
@GanlandNFT my address
```
> 📍 Your Ganland wallet: 0x1234...abcd
> View on Basescan: basescan.org/address/0x1234...

### Help
```
@GanlandNFT help
```
> Shows all available commands

---

## 💰 Funding Your Wallet

Your Ganland wallet lives on **Base** (Chain ID: 8453).

To use it, fund with:
1. **ETH** — For gas fees (~$0.01 per transaction)
2. **$GAN** — For art generation (500,000 $GAN per artwork)

### Get $GAN
- [DexScreener](https://dexscreener.com/base/0xc2fa8cfa51B02fDeb84Bb22d3c9519EAEB498b07)
- [Uniswap on Base](https://app.uniswap.org/swap?chain=base&outputCurrency=0xc2fa8cfa51B02fDeb84Bb22d3c9519EAEB498b07)

### Bridge ETH to Base
- [Official Base Bridge](https://bridge.base.org)
- [Superbridge](https://superbridge.app/base)

---

## 🔧 Technical Details

### HD Wallet Derivation

Each user wallet is deterministically derived from a master seed:

```
Path: m/44'/60'/0'/0/{user_index}
Index = SHA256(Twitter_User_ID) mod 2^31
```

This means:
- ✅ Same user always gets the same wallet
- ✅ No private keys stored in database
- ✅ Wallets can be recovered from master seed
- ✅ Standard BIP-44 derivation path

### Supported Chains

| Chain | ID | Status |
|-------|-----|--------|
| Base | 8453 | ✅ Primary |
| Ethereum | 1 | Read-only |
| Optimism | 10 | Read-only |
| Shape | 360 | Read-only |
| Soneium | 1868 | Read-only |
| Unichain | 130 | Read-only |
| Superseed | 5330 | Read-only |

> **Note:** Transfers currently operate on Base only. Multi-chain transfers coming soon.

### Token Contract

```
$GAN Token: 0xc2fa8cfa51B02fDeb84Bb22d3c9519EAEB498b07
Network: Base (8453)
Decimals: 18
```

---

## 🖥️ CLI Usage

For developers and operators:

### Installation

```bash
npm install
```

### Initialize Master Seed (First Time)

```bash
node src/user-wallets.mjs init
```

> ⚠️ **BACKUP YOUR SEED!** Located at `~/.local/secrets/ganland-master-seed`

### Create User Wallet

```bash
# Create wallet for Twitter user ID 123456789
node src/user-wallets.mjs create 123456789 cooluser
```

### Check Balances

```bash
node src/user-wallets.mjs balance 123456789
```

### Transfer Between Users

```bash
# Transfer to another user by ID
node src/user-wallets.mjs transfer 123456789 987654321 100000

# Transfer to any address
node src/user-wallets.mjs transfer 123456789 0x1234...abcd 50000
```

### List All Wallets

```bash
node src/user-wallets.mjs list
```

### Legacy Commands (Main Wallet)

```bash
# Check main GAN wallet balances
node src/wallet.mjs balance

# Specific chain
node src/wallet.mjs balance base

# List supported chains
node src/wallet.mjs chains
```

---

## 📁 Project Structure

```
ganland-wallet/
├── src/
│   ├── user-wallets.mjs    # HD wallet system for users
│   └── wallet.mjs          # Main GAN wallet utilities
├── package.json
└── README.md
```

---

## 🔐 Security

- Master seed stored locally at `~/.local/secrets/ganland-master-seed`
- No private keys stored in database
- All wallets derivable from master seed
- User database only contains: userId, username, address, createdAt

### Secrets Directory

```
~/.local/secrets/
├── ganland-master-seed     # CRITICAL: Backup this!
├── ganland-wallets.json    # User database (recoverable)
└── alchemy-api-key         # Optional: For faster RPCs
```

---

## 🔗 Related Projects

- [Fractal Visions Marketplace](https://fractalvisions.io)
- [GAN Art Service](https://github.com/GanlandNFT/gan-art-service)
- [fractal-nft-infra](https://github.com/GanlandNFT/fractal-nft-infra) — Smart contracts

---

## 📜 License

MIT

---

Built by [GAN](https://x.com/GanlandNFT) 🤖 for the Fractal Visions ecosystem.
