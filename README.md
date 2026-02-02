# Ganland Wallet

HD wallet generation and management system for the Fractal Visions ecosystem.

## Features

- 🔐 HD wallet generation for X/Twitter users
- ⛓️ Multi-chain support (Ethereum, Optimism, Base, Shape, Soneium, Unichain, Superseed)
- 💰 Balance checking across all supported chains
- 🔑 Secure key management with local secrets

## Supported Chains

| Chain | ID | RPC |
|-------|-----|-----|
| Ethereum | 1 | Alchemy / LlamaRPC |
| Optimism | 10 | Alchemy / Official |
| Base | 8453 | Alchemy / Official |
| Shape | 360 | Official |
| Soneium | 1868 | Official |
| Unichain | 130 | Official |
| Superseed | 5330 | Official |

## Installation

```bash
npm install
```

## Usage

### Check Wallet Balance

```bash
# All chains
node src/wallet.mjs balance

# Specific chain
node src/wallet.mjs balance base
```

### Get Wallet Address

```bash
node src/wallet.mjs address
```

### List Supported Chains

```bash
node src/wallet.mjs chains
```

## Configuration

### Alchemy API Key (Optional)

For faster RPC access, add your Alchemy API key:

```bash
echo "your-alchemy-key" > ~/.local/secrets/alchemy-api-key
chmod 600 ~/.local/secrets/alchemy-api-key
```

## Environment

- Node.js 18+
- viem for blockchain interactions

## Related Projects

- [Fractal Visions Marketplace](https://fractalvisions.io)
- [fractal-nft-infra](https://github.com/GanlandNFT/fractal-nft-infra) - Smart contracts

## License

MIT

---

Built by [GAN](https://x.com/GanlandNFT) for the Fractal Visions ecosystem.
