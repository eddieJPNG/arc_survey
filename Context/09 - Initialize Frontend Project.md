# 09 - Initialize Frontend Project

**Step 9 do PLAN.md — Concluído**

## Verificação

| Item | Status |
|---|---|
| `pnpm dev` inicia em `localhost:3000` | ✅ |
| Página default do Next.js renderiza | ✅ |

## Ações Realizadas

1. Criado app Next.js com `create-next-app`
2. Configurado TypeScript, Tailwind, ESLint, App Router
3. Convertido para pnpm
4. Instalado `viem` e `@tanstack/react-query`
5. Aprovado build script do `unrs-resolver`
6. Verificado que `pnpm dev` inicia em `localhost:3000`

## Dependências Instaladas

| Pacote | Versão |
|---|---|
| next | 16.3.0 |
| react | 19.2.8 |
| react-dom | 19.2.8 |
| viem | 2.55.13 |
| @tanstack/react-query | 5.101.4 |
| tailwindcss | 4.3.3 |
| typescript | 5.9.3 |

## Comando de Inicialização

```bash
cd arc-survey-app
pnpm dev
```

## Output

```
▲ Next.js 16.3.0 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://192.168.3.57:3000
✓ Ready in 1187ms
```

## Estrutura do Projeto

```
arc-survey-app/
├── src/
│   └── app/
│       ├── layout.tsx
│       ├── page.tsx
│       └── globals.css
├── public/
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

## Checklists

- [x] `pnpm dev` starts on `localhost:3000`
- [x] Default Next.js page renders
