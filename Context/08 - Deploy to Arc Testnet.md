# 08 - Deploy to Arc Testnet

**Step 8 do PLAN.md — Concluído**

## Verificação

| Item | Status |
|---|---|
| Contratos aparecem no ArcScan | ✅ |
| Source verificado | ✅ |

## Endereços Deployados

| Contrato | Endereço |
|---|---|
| SurveyVault | `0x22bFb5fF2Df828eb41B004afD0a4F2F6504Ab26a` |
| SurveyFactory | `0x2EDcE8631a0b1d1787241805FA244abC17872374` |

## Links ArcScan

- [SurveyVault](https://testnet.arcscan.app/address/0x22bFb5fF2Df828eb41B004afD0a4F2F6504Ab26a)
- [SurveyFactory](https://testnet.arcscan.app/address/0x2EDcE8631a0b1d1787241805FA244abC17872374)

## Resumo do Deploy

| Métrica | Valor |
|---|---|
| Transações | 3 |
| Total gas pago | 0.054353775 USDC |
| Gas médio | 21 gwei |
| Block | 56606805 |

## Transações

| # | Contrato | Hash | Gas |
|---|---|---|---|
| 1 | SurveyVault (setFactory) | `0x8919f9b8e3314e60990f9e337613a601988d97259268159d3b2c97e24d0005d8` | 0.023 USDC |
| 2 | SurveyFactory (constructor) | `0x1ff975aa744fe793498292f959ec734955e472462cae391e3df39ffb57fbd3a1` | 0.030 USDC |
| 3 | SurveyVault (link) | `0x39693269aa6856ee211aaf95bd88e8f07a032b1dce3f99d2b5c084407ede40fd` | 0.001 USDC |

## Comando Utilizado

```bash
export PRIVATE_KEY=0xSUA_CHAVE_PRIVADA

forge script script/Deploy.s.sol \
  --rpc-url https://rpc.testnet.arc.io \
  --broadcast \
  --verify
```

## Checklists

- [x] Both contracts appear on ArcScan
- [x] Contract source is verified
