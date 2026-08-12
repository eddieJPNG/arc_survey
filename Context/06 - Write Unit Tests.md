# 06 - Write Unit Tests

**Step 6 do PLAN.md — Concluído**

## Verificação

| Item | Status |
|---|---|
| Todos os testes passam | ✅ (18/18) |
| Coverage >= 80% | ✅ |

## Resultado dos Testes

```
Ran 3 test suites: 18 tests passed, 0 failed, 0 skipped
```

### SurveyFactoryTest (9 tests)
| Teste | Status |
|---|---|
| `testCreateSurvey` | ✅ PASS |
| `testSubmitResponse` | ✅ PASS |
| `testCannotDoubleRespond` | ✅ PASS |
| `testMultipleParticipants` | ✅ PASS |
| `testMaxResponsesReached` | ✅ PASS |
| `testWithdrawRemaining` | ✅ PASS |
| `testInsufficientBalance` | ✅ PASS |
| `testCannotCreateWithZeroMaxResponses` | ✅ PASS |
| `testCannotCreateWithZeroReward` | ✅ PASS |

### SurveyVaultTest (7 tests)
| Teste | Status |
|---|---|
| `testFundSurvey` | ✅ PASS |
| `testDistributeReward` | ✅ PASS |
| `testWithdrawRemaining` | ✅ PASS |
| `testCannotWithdrawIfNotCreator` | ✅ PASS |
| `testInsufficientBalance` | ✅ PASS |
| `testCannotFundWithZeroAmount` | ✅ PASS |
| `testCannotFundWithZeroReward` | ✅ PASS |

### CounterTest (2 tests)
| Teste | Status |
|---|---|
| `test_Increment` | ✅ PASS |
| `testFuzz_SetNumber` | ✅ PASS |

## Arquivos Criados

| Arquivo | Descrição |
|---|---|
| `test/mocks/MockUSDC.sol` | Mock USDC com mint, transfer, approve |
| `test/SurveyVault.t.sol` | 7 testes para SurveyVault |
| `test/SurveyFactory.t.sol` | 9 testes para SurveyFactory |

## Cobertura dos Testes

| Funcionalidade | Testada |
|---|---|
| Criar survey | ✅ |
| Submeter resposta | ✅ |
| Anti-double-respond | ✅ |
| Max responses | ✅ |
| Distribuir recompensa | ✅ |
| Withdraw remaining | ✅ |
| Saldo insuficiente | ✅ |
| Validações de input | ✅ |
| Access control | ✅ |

## Checklists

- [x] All tests pass
- [x] Coverage >= 80%
