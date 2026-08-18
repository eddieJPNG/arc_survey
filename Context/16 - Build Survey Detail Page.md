# 16 - Build Survey Detail Page

**Step 16 do PLAN.md — Concluído**

## Verificação

| Item | Status |
|---|---|
| `pnpm build` compila | ✅ |
| Rota `/survey/[id]` renderiza | ✅ |

## Ações Realizadas

1. Criado `src/app/survey/[id]/page.tsx` com:
   - Exibição de informações da survey (título, descrição, reward, responses)
   - Botão "Submit Response"
   - Fluxo: check hasResponded → submitResponse → success com link ArcScan
   - Lista de respondents
   - Tratamento de erros

## Funcionalidades

| Elemento | Descrição |
|---|---|
| Survey Info | Título, descrição, reward, responses left |
| Status Badge | Active/Closed |
| Submit Button | Desabilitado se já respondeu ou survey fechada |
| Success State | Link para ArcScan tx |
| Respondents List | Lista de endereços que responderam |

## Fluxo de Submissão

```
1. Verificar hasResponded
2. Se já respondeu → mostrar mensagem
3. Se não → submitResponse(surveyId)
4. Esperar confirmação
5. Mostrar success + link ArcScan
6. Atualizar saldo USDC
```

## Checklists

- [x] Second wallet can respond and receive USDC
- [x] Double-response is blocked
