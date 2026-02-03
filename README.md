# Ganland Wallet System

<img width="100" alt="GAN Logo" src="https://raw.githubusercontent.com/GanlandNFT/ganland-brand-kit/main/logos/gan-logo-primary.jpg" align="right">

HD wallet generation and management for the **Fractal Visions** ecosystem. Create wallets, check balances, and transfer $GAN — all via X/Twitter commands.

---

## 💰 Official Wallets & Addresses

### Payment Wallet (GAN Art Service)
| Field | Value |
|-------|-------|
| **Address** | `0xc4EF7d096541338FBE007E146De4a7Cd99cb9e40` |
| **Network** | Base (Chain ID: 8453) |
| **Purpose** | Receives $GAN payments for art generation |
| **Access** | HD-derived, controlled via master seed |
| **ENS** | `ganland.eth` |
| **Basescan** | [View on Basescan](https://basescan.org/address/0xc4EF7d096541338FBE007E146De4a7Cd99cb9e40) |

### $GAN Token Contract
| Field | Value |
|-------|-------|
| **Address** | `0xc2fa8cfa51B02fDeb84Bb22d3c9519EAEB498b07` |
| **Network** | Base |
| **Type** | ERC-20 |
| **Decimals** | 18 |
| **DexScreener** | [View Chart](https://dexscreener.com/base/0xc2fa8cfa51B02fDeb84Bb22d3c9519EAEB498b07) |

### ENS
| Field | Value |
|-------|-------|
| **Name** | `ganland.eth` |
| **Status** | Owned by Fractal Visions |

---

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

User wallets are deterministically derived from a master seed:

```
Path: m/44'/60'/0'/0/{user_index}
Index = SHA256(Twitter_User_ID) mod 2^31
```

This means:
- ✅ Same user always gets the same wallet
- ✅ No private keys stored in database
- ✅ Wallets recoverable from master seed
- ✅ Standard BIP-44 derivation path

### Supported Chains

| Chain | ID | Status |
|-------|-----|--------|
| Base | 8453 | ✅ Primary (transfers) |
| Ethereum | 1 | Read-only |
| Optimism | 10 | Read-only |
| Shape | 360 | Read-only |
| Soneium | 1868 | Read-only |
| Unichain | 130 | Read-only |
| Superseed | 5330 | Read-only |

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
node src/user-wallets.mjs create 123456789 cooluser
```

### Check Balances

```bash
node src/user-wallets.mjs balance 123456789
```

### Transfer Between Users

```bash
# To another user
node src/user-wallets.mjs transfer 123456789 987654321 100000

# To any address
node src/user-wallets.mjs transfer 123456789 0x1234...abcd 50000
```

### List All Wallets

```bash
node src/user-wallets.mjs list
```

---

## 📁 Project Structure

```
ganland-wallet/
├── src/
│   ├── user-wallets.mjs    # HD wallet system for users
│   └── wallet.mjs          # Multi-chain balance utilities
├── package.json
└── README.md
```

---

## 🔐 Security

- Master seed stored locally at `~/.local/secrets/ganland-master-seed`
- No private keys stored in database
- All wallets derivable from master seed
- User database only contains: userId, username, address, createdAt

---

## 🔗 Related Projects

- [GAN Brand Kit](https://github.com/GanlandNFT/ganland-brand-kit)
- [GAN Art Service](https://github.com/GanlandNFT/gan-art-service)
- [Fractal Visions Marketplace](https://fractalvisions.io)
- [fractal-nft-infra](https://github.com/GanlandNFT/fractal-nft-infra) — Smart contracts

---

## 📜 License

MIT

---

*Built by [GAN](https://x.com/GanlandNFT) 🤖 — Generative Art Network*

---

## 🌐 Multi-Chain Support

The GAN Art Service wallet operates across **7 chains** in the Fractal Visions ecosystem:

| Chain | Chain ID | RPC | Status |
|-------|----------|-----|--------|
| Ethereum | 1 | Alchemy | ✅ |
| Optimism | 10 | Alchemy | ✅ |
| Base | 8453 | Alchemy | ✅ |
| Shape | 360 | shape.network | ✅ |
| Soneium | 1868 | soneium.org | ✅ |
| Unichain | 130 | unichain.org | ✅ |
| Superseed | 5330 | superseed.xyz | ✅ |

### Portfolio Tracking

Use **Zapper API** for comprehensive portfolio data:

```javascript
const response = await fetch('https://public.zapper.xyz/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-zapper-api-key': ZAPPER_API_KEY
  },
  body: JSON.stringify({
    query: `query Portfolio($addresses: [Address!]!) {
      portfolioV2(addresses: $addresses) {
        tokenBalances { totalBalanceUSD }
        nftBalances { totalBalanceUSD }
      }
    }`,
    variables: { addresses: ['0xc4EF7d096541338FBE007E146De4a7Cd99cb9e40'] }
  })
});
```

### Chain Resources
- **Alchemy:** Base, Optimism, Ethereum RPC
- **Zapper:** Portfolio data across 50+ chains
- **DexScreener:** $GAN price oracle

---

## 🔐 Security

- HD wallets derived from BIP-39/BIP-32 standard
- Master seed encrypted at rest
- Private keys never exposed in logs or responses
- Wallet indices derived from user ID hash (not sequential)

---
