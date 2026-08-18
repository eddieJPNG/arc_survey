# 14 - Build Landing Page

**Step 14 do PLAN.md — Concluído**

## Verificação

| Item | Status |
|---|---|
| `pnpm build` compila | ✅ |
| Página carrega | ✅ |

## Ações Realizadas

1. Atualizado `src/app/page.tsx` com:
   - Header com logo "ARC Survey" + botão Connect/Disconnect Wallet
   - Lista de surveys ativas em cards
   - Cada card mostra título, descrição, reconta/reward, responses
   - Cards linkam para `/survey/[id]`
   - Botão "Create Survey" (visível após conectar)
   - Estados: empty, loading, connected

## Funcionalidades

| Elemento | Descrição |
|---|---|
| Header | Logo + endereço da carteira + botão connect/disconnect |
| Survey Cards | Título, descrição, reward USDC, responses |
| Empty State | Mensagem + botão para criar survey |
| Loading State | Spinner animado |
| Botão Create | Link para `/create` |

## Componentes

| Componente | Estado |
|---|---|
| `Connect Wallet` | Botão no header |
| `Survey Card` | Card com survey info |
| `Empty State` | Quando não há surveys |
| `Loading` | Spinner durante carregamento |

## Checklists

- [x] Page loads
- [x] Wallet connects
- [x] Survey cards render (empty state if no surveys yet)
