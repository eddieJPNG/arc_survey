# 12 - Build USDC Hook

**Step 12 do PLAN.md — Concluído**

## Verificação

| Item | Status |
|---|---|
| `pnpm build` compila | ✅ |

## Ações Realizadas

1. Criado `src/abis/USDC.json` — ABI ERC-20 (balanceOf, allowance, approve)
2. Criado `src/hooks/useUSDC.ts` — Hook para interação com USDC

## Arquivo Criado

### src/hooks/useUSDC.ts

```typescript
"use client";

import { useState, useCallback, useEffect } from "react";
import { parseUnits, formatUnits, encodeFunctionData } from "viem";
import { USDC_ADDRESS } from "@/lib/contracts";
import { erc20Abi } from "viem";

const USDC_DECIMALS = 6;

export function useUSDC(address: string | null, provider: any) {
  const [balance, setBalance] = useState<string>("0");
  const [balanceRaw, setBalanceRaw] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(false);

  // fetchBalance() — lê saldo USDC via eth_call
  // approve(spender, amount) — aprova SurveyVault para gastar USDC
  // allowance(spender) — verifica allowance atual
  // refetch() — recarrega saldo

  return { balance, balanceRaw, isLoading, approve, allowance, refetch };
}
```

## Funcionalidades

| Função | Descrição |
|---|---|
| `fetchBalance()` | Lê saldo USDC via eth_call (ERC-20, 6 decimals) |
| `approve(spender, amount)` | Envia tx de approve para SurveyVault |
| `allowance(spender)` | Verifica allowance atual via eth_call |
| `refetch()` | Recarrega saldo manualmente |

## Estado

| Campo | Tipo | Descrição |
|---|---|---|
| `balance` | `string` | Saldo formatado (ex: "20.0") |
| `balanceRaw` | `bigint` | Saldo raw em wei |
| `isLoading` | `boolean` | Se está carregando |

## USDC Address

```
0x3600000000000000000000000000000000000000
```

## Checklists

- [x] `pnpm build` compila
- [x] TypeScript sem erros
