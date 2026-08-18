# 13 - Build Survey Factory Hook

**Step 13 do PLAN.md — Concluído**

## Verificação

| Item | Status |
|---|---|
| `pnpm build` compila | ✅ |
| Sem erros TypeScript | ✅ |

## Ações Realizadas

1. Criado `src/hooks/useSurveyFactory.ts` com:
   - `createSurvey()` — cria survey via transação
   - `submitResponse()` — submete resposta via transação
   - `getSurvey()` — lê survey individual
   - `listSurveys()` — lê todas as surveys
   - `getRespondents()` — retorna array de endereços
   - `hasResponded()` — verifica se wallet já respondeu

## Arquivo Criado

### src/hooks/useSurveyFactory.ts

```typescript
"use client";

import { useState, useCallback } from "react";
import { encodeFunctionData } from "viem";
import { contracts } from "@/lib/contracts";

export type Survey = {
  id: bigint;
  creator: string;
  title: string;
  description: string;
  maxResponses: bigint;
  rewardPerResponse: bigint;
  responseCount: bigint;
  active: boolean;
  createdAt: bigint;
};

export function useSurveyFactory(provider: any) {
  // readCall() — eth_call para funções view
  // writeCall() — eth_sendTransaction para funções state-changing

  return {
    createSurvey,
    submitResponse,
    getSurvey,
    listSurveys,
    getRespondents,
    hasResponded,
  };
}
```

## Funcionalidades

| Função | Tipo | Descrição |
|---|---|---|
| `createSurvey(title, desc, max, reward)` | write | Cria survey + emite SurveyCreated |
| `submitResponse(surveyId)` | write | Submete resposta + recebe recompensa |
| `getSurvey(surveyId)` | read | Retorna Survey struct decodificado |
| `listSurveys()` | read | Retorna array de todas as surveys |
| `getRespondents(surveyId)` | read | Retorna array de endereços |
| `hasResponded(surveyId, address)` | read | Retorna boolean |

## Decodificação

O hook inclui decodificadores manuais para:
- `decodeSurvey()` — decodifica tuple do Survey struct
- `decodeString()` — decodifica strings dynamic ABI-encoded
- `decodeAddressArray()` — decodifica arrays de endereços

## Checklists

- [x] `pnpm build` compila
- [x] No TypeScript errors
