# ARC Survey — MVP Implementation Plan

> **Prerequisites:** Read `SPEC.md` before starting.  
> **Rule:** Each step requires the previous step to be completed.

---

## Step 0 — Environment Setup

**Depends on:** Nothing

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install Node.js 22+ (if not present)
node -v  # must be >= 22

# Install global tools
npm install -g pnpm
```

**Verify:**
- [ ] `forge --version` returns a version
- [ ] `node -v` returns v22+

---

## Step 1 — Fund Wallet on Arc Testnet

**Depends on:** Step 0

1. Open MetaMask, add custom network:
   - Name: `Arc Testnet`
   - RPC: `https://rpc.testnet.arc.io`
   - Chain ID: `5042002`
   - Symbol: `USDC`
   - Explorer: `https://testnet.arcscan.app`
2. Copy your wallet address
3. Go to [faucet.circle.com](https://faucet.circle.com), request testnet USDC
4. Confirm balance on [testnet.arcscan.app](https://testnet.arcscan.app)

**Verify:**
- [ ] MetaMask connected to Arc Testnet
- [ ] Wallet has >= 10 USDC

---

## Step 2 — Initialize Foundry Project

**Depends on:** Step 1

```bash
mkdir arc-survey-contracts
cd arc-survey-contracts
forge init --no-commit

# Configure Arc Testnet RPC
forge rpc-url --rpc-url https://rpc.testnet.arc.io
```

**Verify:**
- [ ] `forge build` compiles successfully
- [ ] `foundry.toml` exists

---

## Step 3 — Write IERC20 Interface

**Depends on:** Step 2

Create `src/interfaces/IERC20.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
```

**Verify:**
- [ ] `forge build` compiles with no errors

---

## Step 4 — Implement SurveyVault

**Depends on:** Step 3

Create `src/SurveyVault.sol`:

- State: `usdc` (immutable), `surveyBalance`, `totalDistributed`, `surveyCreator`
- `fundSurvey(uint256 surveyId, uint256 amount)` — USDC transferFrom caller to vault
- `distributeReward(uint256 surveyId, address payable participant)` — only callable by SurveyFactory, transfers USDC
- `withdrawRemaining(uint256 surveyId)` — only creator can withdraw leftover
- `getBalance(uint256 surveyId)` — view function

**Verify:**
- [ ] `forge build` compiles
- [ ] No compiler warnings

---

## Step 5 — Implement SurveyFactory

**Depends on:** Step 4

Create `src/SurveyFactory.sol`:

- State: `surveyCount`, `surveys` mapping, `hasResponded` mapping, `respondents` mapping, `vault` (immutable)
- `createSurvey(title, description, maxResponses, rewardPerResponse)` — emits SurveyCreated
- `submitResponse(uint256 surveyId)` — validates not double, calls vault.distributeReward, emits ResponseSubmitted
- `getSurvey(uint256 surveyId)` — returns Survey struct
- `getRespondents(uint256 surveyId)` — returns address array

**Verify:**
- [ ] `forge build` compiles
- [ ] No compiler warnings

---

## Step 6 — Write Unit Tests (Foundry)

**Depends on:** Step 5

Create `test/SurveyFactory.t.sol` and `test/SurveyVault.t.sol`:

- Deploy mock USDC (or use a fork of Arc Testnet USDC)
- `testCreateSurvey` — survey stored correctly
- `testFundSurvey` — USDC transferred to vault
- `testSubmitResponse` — reward paid to participant
- `testCannotDoubleRespond` — reverts on second call
- `testWithdrawRemaining` — creator gets leftover
- `testInsufficientBalance` — reverts when vault empty

```bash
forge test -vvv
```

**Verify:**
- [ ] All tests pass
- [ ] Coverage >= 80%

---

## Step 7 — Write Deploy Script

**Depends on:** Step 6

Create `script/Deploy.s.sol`:

```solidity
contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address usdcAddress = 0x3600000000000000000000000000000000000000;

        vm.startBroadcast(deployerPrivateKey);
        SurveyFactory factory = new SurveyFactory();
        SurveyVault vault = new SurveyVault(usdcAddress);
        factory.setVault(address(vault));
        vm.stopBroadcast();

        console.log("SurveyFactory:", address(factory));
        console.log("SurveyVault:", address(vault));
    }
}
```

**Verify:**
- [ ] `forge build` compiles
- [ ] Script parses without error

---

## Step 8 — Deploy to Arc Testnet

**Depends on:** Step 7

```bash
# Set private key in env (NEVER commit this)
export PRIVATE_KEY=0xYOUR_PRIVATE_KEY

# Deploy
forge script script/Deploy.s.sol \
  --rpc-url https://rpc.testnet.arc.io \
  --broadcast \
  --verify

# Note the printed addresses
```

1. Copy printed `SurveyFactory` address
2. Copy printed `SurveyVault` address
3. Verify both on [testnet.arcscan.app](https://testnet.arcscan.app)

**Verify:**
- [ ] Both contracts appear on ArcScan
- [ ] Contract source is verified

---

## Step 9 — Initialize Frontend Project

**Depends on:** Step 8

```bash
cd ..
npx create-next-app@latest arc-survey-app \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd arc-survey-app
```

Install dependencies:

```bash
pnpm add viem @tanstack/react-query
```

**Verify:**
- [ ] `pnpm dev` starts on `localhost:3000`
- [ ] Default Next.js page renders

---

## Step 10 — Setup Chain Config + ABIs

**Depends on:** Step 9

Create files:

1. `src/lib/chains.ts` — Arc Testnet chain definition (see SPEC.md §4.3)
2. `src/lib/contracts.ts` — deployed addresses + ABIs
3. `src/abis/SurveyFactory.json` — ABI from Foundry artifacts
4. `src/abis/SurveyVault.json` — ABI from Foundry artifacts

**Verify:**
- [ ] TypeScript compiles (`pnpm build` passes)

---

## Step 11 — Build Wallet Hook

**Depends on:** Step 10

Create `src/hooks/useArcWallet.ts`:

- EIP-6963 provider discovery
- `connect()` — request accounts, switch to Arc Testnet
- `disconnect()`
- State: `address`, `isConnected`, `provider`, `chain`

**Verify:**
- [ ] Click connect button → MetaMask prompt appears
- [ ] After approval, address displayed in UI

---

## Step 12 — Build USDC Hook

**Depends on:** Step 11

Create `src/hooks/useUSDC.ts`:

- `balance` — read USDC balance (ERC-20, 6 decimals)
- `approve(spender, amount)` — approve SurveyVault
- `allowance(spender)` — check current allowance

**Verify:**
- [ ] USDC balance displays correctly after wallet connect

---

## Step 13 — Build Survey Factory Hook

**Depends on:** Step 12

Create `src/hooks/useSurveyFactory.ts`:

- `createSurvey(title, description, maxResponses, rewardPerResponse)`
- `submitResponse(surveyId)`
- `getSurvey(surveyId)` — read single survey
- `listSurveys()` — read all surveys (loop over surveyCount)
- `getRespondents(surveyId)`

**Verify:**
- [ ] Hook compiles, no TypeScript errors

---

## Step 14 — Build Landing Page

**Depends on:** Step 13

Update `src/app/page.tsx`:

- Connect wallet button (top right)
- List of active surveys (cards with title, reward, response count)
- Each card links to `/survey/[id]`

**Verify:**
- [ ] Page loads
- [ ] Wallet connects
- [ ] Survey cards render (empty state if no surveys yet)

---

## Step 15 — Build Create Survey Page

**Depends on:** Step 14

Create `src/app/create/page.tsx`:

- Form: title, description, max responses, reward per response
- Submit flow:
  1. Call `approve(vault, totalReward)`
  2. Wait for confirmation
  3. Call `createSurvey(...)`
  4. Wait for confirmation
  5. Redirect to `/`

**Verify:**
- [ ] Submit form → MetaMask prompts twice (approve + create)
- [ ] Survey appears on landing page after redirect

---

## Step 16 — Build Survey Detail Page

**Depends on:** Step 15

Create `src/app/survey/[id]/page.tsx`:

- Display survey info (title, description, reward, responses left)
- "Submit Response" button
- Submit flow:
  1. Check `hasResponded` — disable if already responded
  2. Call `submitResponse(surveyId)`
  3. Wait for confirmation
  4. Show success with ArcScan tx link

**Verify:**
- [ ] Second wallet can respond and receive USDC
- [ ] Double-response is blocked

---

## Step 17 — Build Creator Dashboard

**Depends on:** Step 16

Create `src/app/dashboard/page.tsx`:

- Filter surveys where `creator == connectedAddress`
- For each: title, responses count, remaining balance, withdraw button
- Withdraw flow: call `withdrawRemaining(surveyId)`

**Verify:**
- [ ] Creator sees their surveys
- [ ] Withdraw moves USDC back to creator wallet

---

## Step 18 — Final Polish

**Depends on:** Step 17

- [ ] Add loading states for all transactions
- [ ] Add error handling (user rejection, insufficient gas)
- [ ] Add transaction status notifications
- [ ] Style with Tailwind for clean, presentable UI
- [ ] Add ArcScan links to all transactions
- [ ] Test full flow end-to-end with 2 wallets

---

## Step 19 — Deploy Frontend

**Depends on:** Step 18

```bash
# Push to GitHub
git init
git add .
git commit -m "feat: arc survey mvp"
git remote add origin git@github.com:YOUR_USER/arc-survey-app.git
git push -u origin main
```

Deploy to Vercel:
1. Import repo on [vercel.com](https://vercel.com)
2. Framework: Next.js (auto-detected)
3. Deploy

**Verify:**
- [ ] Live URL accessible
- [ ] Full flow works on deployed site

---

## Step 20 — Demo Run

**Depends on:** Step 19

Record or live-demo:

1. Connect wallet on Arc Testnet
2. Create survey (5 responses × 2 USDC = 10 USDC pool)
3. Switch to second wallet
4. Respond → receive 2 USDC
5. Show tx on ArcScan
6. Creator dashboard shows 1 response
7. Withdraw remaining 8 USDC

**Verify:**
- [ ] Demo completes without errors
- [ ] All transactions visible on ArcScan

---

## Dependency Graph

```
Step 0  → Step 1  → Step 2  → Step 3  → Step 4  → Step 5  → Step 6
                                                                     ↓
                                                              Step 7 → Step 8
                                                                     ↓
Step 9  → Step 10 → Step 11 → Step 12 → Step 13 → Step 14 → Step 15
                                                                     ↓
                                                              Step 16 → Step 17
                                                                     ↓
                                                              Step 18 → Step 19 → Step 20
```

**Parallelizable:** Steps 0-8 (contracts) and Steps 9-10 (frontend init) can run in parallel if two people work on it. Step 11+ requires Step 8 (deployed addresses).
