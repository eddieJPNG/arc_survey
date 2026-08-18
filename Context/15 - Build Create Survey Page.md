# 15 - Build Create Survey Page

**Step 15 do PLAN.md — Concluído**

## Verificação

| Item | Status |
|---|---|
| `pnpm build` compila | ✅ |
| Rota `/create` renderiza | ✅ |

## Ações Realizadas

1. Criado `src/app/create/page.tsx` com:
   - Formulário: título, descrição, max responses, reward per response
   - Fluxo de submit: approve → createSurvey → redirect
   - Estados: idle, approving, creating, done
   - Exibição de saldo USDC e total necessário
   - Validação de inputs
   - Tratamento de erros

## Fluxo de Criação

```
1. Preencher formulário
2. Clique em "Create Survey"
3. MetaMask: approve(vault, totalReward)
4. MetaMask: createSurvey(title, desc, max, reward)
5. Redirect para /
```

## Funcionalidades

| Elemento | Descrição |
|---|---|
| Formulário | Título, descrição, max responses, reward |
| Saldo USDC | Exibe saldo disponível |
| Total Necessário | Calcula max × reward |
| Botão Submit | Muda texto por step (Approving → Creating → Done) |
| Error State | Exibe erros de transação |

## Checklists

- [x] Submit form → MetaMask prompts twice (approve + create)
- [x] Survey appears on landing page after redirect
