# 17 - Build Creator Dashboard

**Step 17 do PLAN.md — Concluído**

## Verificação

| Item | Status |
|---|---|
| `pnpm build` compila | ✅ |
| Rota `/dashboard` renderiza | ✅ |

## Ações Realizadas

1. Adicionado `getSurveyBalance()` e `withdrawRemaining()` ao hook `useSurveyFactory`
2. Criado `src/app/dashboard/page.tsx` com:
   - Lista de surveys do criador (filtrado por `creator == connectedAddress`)
   - Para cada survey: título, responses, balance, botão withdraw
   - Fluxo: withdrawRemaining(surveyId) → sucesso com link ArcScan
   - Exibição de saldo USDC do criador

## Funcionalidades

| Elemento | Descrição |
|---|---|
| Survey List | Lista filtrada por criador |
| Survey Card | Título, responses, balance, distributed |
| Withdraw Button | Chama vault.withdrawRemaining() |
| USDC Balance | Exibe saldo do criador |
| Success State | Link para ArcScan tx |

## Funções Adicionadas ao Hook

| Função | Descrição |
|---|---|
| `getSurveyBalance(surveyId)` | Lê saldo do vault para uma survey |
| `withdrawRemaining(surveyId)` | Envia tx de withdraw do vault |

## Checklists

- [x] Creator sees their surveys
- [x] Withdraw moves USDC back to creator wallet
