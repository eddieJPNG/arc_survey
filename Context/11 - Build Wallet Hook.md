# 11 - Build Wallet Hook

**Step 11 do PLAN.md — Concluído**

## Verificação

| Item | Status |
|---|---|
| `pnpm build` compila | ✅ |

## Ações Realizadas

1. Criado `src/types/eip6963.d.ts` — Declaração de tipos para EIP-6963
2. Criado `src/hooks/useArcWallet.ts` — Hook de conexão de carteira

## Arquivo Criado

### src/hooks/useArcWallet.ts

```typescript
"use client";

import { useState, useCallback, useEffect } from "react";
import { arcTestnet } from "@/lib/chains";

// EIP-6963 provider discovery
// connect() — request accounts, switch to Arc Testnet
// disconnect() — reset state
// State: address, isConnected, provider, chain

export function useArcWallet() {
  const [state, setState] = useState<ArcWalletState>({
    address: null,
    isConnected: false,
    provider: null,
    chain: null,
  });

  // discoverProviders() — EIP-6963 pattern
  // switchToArcTestnet() — wallet_switchEthereumChain
  // connect() — eth_requestAccounts + switch chain
  // disconnect() — reset state
  // Auto-reconnect on mount

  return { ...state, connect, disconnect };
}
```

## Funcionalidades

| Função | Descrição |
|---|---|
| `discoverProviders()` | Descobre wallets via EIP-6963 |
| `switchToArcTestnet()` | Troca para Arc Testnet (Chain ID: 5042002) |
| `connect()` | Solicita contas + troca chain |
| `disconnect()` | Reseta estado |
| Auto-reconnect | Verifica conexão existente ao montar |

## Estado

| Campo | Tipo | Descrição |
|---|---|---|
| `address` | `string \| null` | Endereço da carteira conectada |
| `isConnected` | `boolean` | Se está conectada |
| `provider` | `EIP1193Provider \| null` | Provider da carteira |
| `chain` | `number \| null` | Chain ID atual |

## Checklists

- [x] `pnpm build` compila
- [x] TypeScript sem erros
