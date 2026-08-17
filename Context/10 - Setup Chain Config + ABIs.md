# 10 - Setup Chain Config + ABIs

**Step 10 do PLAN.md — Concluído**

## Verificação

| Item | Status |
|---|---|
| `pnpm build` compila | ✅ |

## Ações Realizadas

1. Criado `src/lib/chains.ts` — Configuração Arc Testnet
2. Criado `src/abis/SurveyFactory.json` — ABI do contrato
3. Criado `src/abis/SurveyVault.json` — ABI do contrato
4. Criado `src/lib/contracts.ts` — Endereços + ABIs

## Arquivos Criados

### src/lib/chains.ts

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

### src/lib/contracts.ts

```typescript
import SurveyFactoryAbi from "@/abis/SurveyFactory.json";
import SurveyVaultAbi from "@/abis/SurveyVault.json";

export const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";

export const contracts = {
  surveyFactory: {
    address: "0x2EDcE8631a0b1d1787241805FA244abC17872374",
    abi: SurveyFactoryAbi,
  },
  surveyVault: {
    address: "0x22bFb5fF2Df828eb41B004afD0a4F2F6504Ab26a",
    abi: SurveyVaultAbi,
  },
};
```

### ABIs

- `src/abis/SurveyFactory.json` — 11 funções (createSurvey, submitResponse, getSurvey, etc.)
- `src/abis/SurveyVault.json` — 10 funções (fundSurvey, distributeReward, withdrawRemaining, etc.)

## Endereços Deployados

| Contrato | Endereço |
|---|---|
| SurveyFactory | `0x2EDcE8631a0b1d1787241805FA244abC17872374` |
| SurveyVault | `0x22bFb5fF2Df828eb41B004afD0a4F2F6504Ab26a` |
| USDC | `0x3600000000000000000000000000000000000000` |

## Checklists

- [x] TypeScript compiles (`pnpm build` passes)
