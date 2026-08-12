# ARC Survey — MVP Specification

> **Version:** 0.1.0 | **Status:** Draft | **Target:** Arc Testnet

---

## 1. Overview

**ARC Survey** is a decentralized survey platform on Arc where creators publish surveys, participants answer them, and USDC rewards are distributed automatically via smart contracts. The MVP focuses on a single, complete end-to-end flow: create survey → respond → get rewarded.

### Goals

- Demonstrate a working dApp on Arc Testnet with real USDC flow
- Prove the core value: transparent, incentivized, tamper-resistant surveys
- Ship a presentable demo in a compressed timeframe

### Non-Goals (MVP)

- No token-gated surveys
- No cross-chain bridging
- No advanced analytics dashboard
- No Arc Privacy Sector (APS) integration
- No user authentication beyond wallet connection

---

## 2. Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│  Next.js + Viem + EIP-6963 wallet connect       │
├─────────────────────────────────────────────────┤
│                  Smart Contracts                 │
│  SurveyFactory.sol — registry + creation        │
│  SurveyVault.sol   — escrow + reward payout     │
├─────────────────────────────────────────────────┤
│               Arc Testnet (L1)                   │
│  USDC gas (~$0.01/tx) • <1s finality           │
└─────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Tool |
|---|---|
| Chain | Arc Testnet (Chain ID: 5042002) |
| Smart Contracts | Solidity 0.8.24+, Foundry |
| Frontend | Next.js 14, React, TypeScript |
| Wallet | Viem + EIP-6963 discovery (MetaMask) |
| USDC | `0x3600000000000000000000000000000000000000` |
| RPC | `https://rpc.testnet.arc.io` |
| Explorer | `https://testnet.arcscan.app` |

---

## 3. Smart Contracts

### 3.1 SurveyFactory

Manages survey lifecycle. One contract holds all survey metadata.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SurveyFactory {
    struct Survey {
        uint256 id;
        address creator;
        string title;
        string description;
        uint256 maxResponses;
        uint256 rewardPerResponse;  // in USDC wei (6 decimals)
        uint256 responseCount;
        bool active;
        uint256 createdAt;
    }

    uint256 public surveyCount;
    mapping(uint256 => Survey) public surveys;
    mapping(uint256 => mapping(address => bool)) public hasResponded;
    mapping(uint256 => address[]) public respondents;

    event SurveyCreated(uint256 indexed surveyId, address indexed creator);
    event ResponseSubmitted(uint256 indexed surveyId, address indexed participant);

    function createSurvey(
        string calldata title,
        string calldata description,
        uint256 maxResponses,
        uint256 rewardPerResponse
    ) external returns (uint256 surveyId);

    function submitResponse(uint256 surveyId) external;
    function getSurvey(uint256 surveyId) external view returns (Survey memory);
    function getRespondents(uint256 surveyId) external view returns (address[] memory);
}
```

### 3.2 SurveyVault

Holds USDC escrow and distributes rewards on response submission.

```solidity
contract SurveyVault {
    IERC20 public immutable usdc;

    mapping(uint256 => uint256) public surveyBalance;
    mapping(uint256 => uint256) public totalDistributed;

    event SurveyFunded(uint256 indexed surveyId, uint256 amount);
    event RewardPaid(uint256 indexed surveyId, address indexed participant, uint256 amount);
    event SurveyWithdrawn(uint256 indexed surveyId, address indexed creator, uint256 amount);

    function fundSurvey(uint256 surveyId, uint256 amount) external;
    function distributeReward(uint256 surveyId, address payable participant) external;
    function withdrawRemaining(uint256 surveyId) external;
    function getBalance(uint256 surveyId) external view returns (uint256);
}
```

### 3.3 Flow

```
Creator                        SurveyFactory              SurveyVault              USDC
  │                                │                         │                      │
  │── createSurvey(title,...) ────▶│                         │                      │
  │                                │◀── SurveyCreated ──────│                      │
  │── approve(vault, amount) ─────│─────────────────────────│── approve ──────────▶│
  │── fundSurvey(id, amount) ─────│─────────────────────────▶                      │
  │                                │                         │◀── transferFrom ────│
  │                                │                         │                      │
  │                           [participant calls]            │                      │
  │── submitResponse(id) ─────────▶                         │                      │
  │                                │◀── ResponseSubmitted ──│                      │
  │                                │────────────────────────▶── distributeReward ──▶│
  │                                │                         │◀── transfer ────────│
```

---

## 4. Frontend

### 4.1 Pages

| Route | Description |
|---|---|
| `/` | Landing — connect wallet, list active surveys |
| `/create` | Survey creation form (title, description, max responses, reward per response) |
| `/survey/[id]` | Survey detail — view questions, submit response, see reward status |
| `/dashboard` | Creator dashboard — surveys created, total spent, responses received |

### 4.2 Core Components

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Landing
│   ├── create/page.tsx       # Survey creation
│   ├── survey/[id]/page.tsx  # Survey detail + response
│   └── dashboard/page.tsx    # Creator dashboard
├── components/
│   ├── ConnectWallet.tsx     # EIP-6963 wallet discovery + connect
│   ├── SurveyCard.tsx        # Survey list item
│   ├── SurveyForm.tsx        # Response submission form
│   ├── CreateSurveyForm.tsx  # Survey creation form
│   └── RewardBadge.tsx       # USDC reward display
├── hooks/
│   ├── useArcWallet.ts       # Wallet connection + Arc chain
│   ├── useSurveyFactory.ts   # Contract reads/writes
│   └── useUSDC.ts            # USDC balance + approve
├── lib/
│   ├── contracts.ts          # ABI + addresses
│   ├── chains.ts             # Arc Testnet config
│   └── viem.ts               # Client setup
└── abis/
    ├── SurveyFactory.json
    └── SurveyVault.json
```

### 4.3 Wallet Integration

```typescript
// EIP-6963 discovery pattern
async function discoverWallets(): Promise<EIP6963ProviderDetail[]> {
  const providers = new Map<string, EIP6963ProviderDetail>();

  window.addEventListener("eip6963:announceProvider", (e) => {
    providers.set(e.detail.info.uuid, e.detail);
  });

  window.dispatchEvent(new Event("eip6963:requestProvider"));
  await new Promise((r) => setTimeout(r, 250));

  return [...providers.values()];
}
```

Chain config:

```typescript
export const arcTestnet = {
  id: 5042002,
  name: "Arc Testnet",
  rpcUrls: { default: { http: ["https://rpc.testnet.arc.io"] } },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
  },
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
} as const;
```

---

## 5. User Flows

### 5.1 Create Survey

```
1. User connects wallet (MetaMask on Arc Testnet)
2. Navigates to /create
3. Fills form: title, description, max responses, reward per response (USDC)
4. Signs approve() for SurveyVault to spend USDC
5. Signs fundSurvey() — USDC moves to escrow
6. Survey appears in active list on /
```

### 5.2 Respond to Survey

```
1. User sees survey card on / with reward info
2. Clicks into /survey/[id]
3. Views survey details (MVP: static content, no custom questions yet)
4. Clicks "Submit Response"
5. Signs submitResponse() transaction
6. USDC reward sent automatically to their wallet
7. UI shows success + transaction link to ArcScan
```

### 5.3 Creator Dashboard

```
1. Creator navigates to /dashboard
2. Sees list of surveys they created
3. For each survey: response count, remaining balance, responses list
4. Can withdraw remaining funds from a survey
```

---

## 6. Anti-Sybil Strategy (MVP)

| Mechanism | Implementation |
|---|---|
| One response per wallet | `hasResponded[surveyId][msg.sender]` mapping |
| Wallet must hold minimum USDC | Check `balanceOf >= 0.01 USDC` before allowing response |
| Reward capped per survey | `maxResponses` field on Survey struct |

> **Note:** Full anti-sybil (KYC, reputation) is post-MVP.

---

## 7. Deployment

### 7.1 Foundry Setup

```bash
# Initialize
forge init arc-survey-contracts
cd arc-survey-contracts

# Add Arc Testnet as RPC
forge rpc-url --rpc-url https://rpc.testnet.arc.io
```

### 7.2 Deploy Script

```solidity
// script/Deploy.s.sol
contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        SurveyFactory factory = new SurveyFactory();
        SurveyVault vault = new SurveyVault(address(USDC));

        vm.stopBroadcast();

        console.log("SurveyFactory:", address(factory));
        console.log("SurveyVault:", address(vault));
    }
}
```

### 7.3 Deployment Checklist

- [ ] Fund deployer wallet with Arc Testnet USDC from [faucet.circle.com](https://faucet.circle.com)
- [ ] Deploy SurveyFactory + SurveyVault
- [ ] Verify contracts on ArcScan
- [ ] Update `contracts.ts` with deployed addresses
- [ ] Deploy frontend to Vercel/Netlify

---

## 8. Testing

### 8.1 Contract Tests (Foundry)

```solidity
// test/SurveyFactory.t.sol
function testCreateSurvey() public { ... }
function testSubmitResponse() public { ... }
function testCannotDoubleRespond() public { ... }
function testRewardDistribution() public { ... }
function testWithdrawRemaining() public { ... }

// test/SurveyVault.t.sol
function testFundSurvey() public { ... }
function testDistributeReward() public { ... }
function testInsufficientBalance() public { ... }
```

### 8.2 Manual Test Checklist

- [ ] Connect MetaMask to Arc Testnet
- [ ] Create a survey with 10 USDC reward pool (5 responses × 2 USDC)
- [ ] Switch to second wallet
- [ ] Respond to survey, receive 2 USDC
- [ ] Verify response recorded on ArcScan
- [ ] Try double-respond (should revert)
- [ ] Check creator dashboard shows 1 response
- [ ] Withdraw remaining funds

---

## 9. Metrics for Success

| Metric | Target |
|---|---|
| End-to-end flow works | Survey created → response → USDC received |
| Gas cost per interaction | < $0.05 total (create + respond) |
| UX latency | < 3 seconds for response confirmation |
| Demo readiness | Presentable to ARC community |

---

## 10. Future Scope (Post-MVP)

| Feature | Depends On |
|---|---|
| Custom question types (multiple choice, text, rating) | Smart contract schema upgrade |
| APS integration for private surveys | Arc Privacy Sector mainnet |
| Cross-chain participation via App Kit Bridge | App Kit SDK |
| Reputation system via ERC-8004 | ERC-8004 ecosystem maturity |
| AI agent surveys via ERC-8183 jobs | Agentic Economy patterns |
| Analytics dashboard with Envio/The Graph | Indexer integration |
| Token-gated surveys (ARC token or NFT) | Community token contract |

---

## Appendix: Contract Addresses (Arc Testnet)

| Contract | Address |
|---|---|
| USDC | `0x3600000000000000000000000000000000000000` |
| SurveyFactory | *(deploy)* |
| SurveyVault | *(deploy)* |

## Appendix: Useful Links

- Arc Testnet RPC: `https://rpc.testnet.arc.io`
- ArcScan Explorer: `https://testnet.arcscan.app`
- Arc Faucet: `https://faucet.circle.com`
- Arc Docs: `https://docs.arc.io`
