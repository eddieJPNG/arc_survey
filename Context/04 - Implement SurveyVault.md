# 04 - Implement SurveyVault

**Step 4 do PLAN.md — Concluído**

## Verificação

| Item | Status |
|---|---|
| `forge build` compila | ✅ |
| Sem warnings | ✅ |

## Ações Realizadas

1. Criado `src/SurveyVault.sol` com:
   - State: `usdc` (immutable), `factory`, `surveyBalance`, `totalDistributed`, `surveyCreator`
   - `fundSurvey(uint256, uint256)` — transferFrom USDC do caller para vault
   - `distributeReward(uint256, address payable)` — onlyFactory, transfere recompensa
   - `withdrawRemaining(uint256)` — onlyCreator, retira saldo restante
   - `getBalance(uint256)` — view function
   - `setFactory(address)` — configura o endereço do factory
2. Adicionado `require` nos transfers para evitar warnings
3. Verificado compilação sem warnings

## Contrato SurveyVault.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "./interfaces/IERC20.sol";

contract SurveyVault {
    IERC20 public immutable usdc;
    address public factory;

    mapping(uint256 => uint256) public surveyBalance;
    mapping(uint256 => uint256) public totalDistributed;
    mapping(uint256 => address) public surveyCreator;

    // Events: SurveyFunded, RewardPaid, SurveyWithdrawn
    // Modifiers: onlyFactory, onlyCreator

    function fundSurvey(uint256 surveyId, uint256 amount) external;
    function distributeReward(uint256 surveyId, address payable participant) external onlyFactory;
    function withdrawRemaining(uint256 surveyId) external onlyCreator(surveyId);
    function getBalance(uint256 surveyId) external view returns (uint256);
}
```

## Modifiers

| Modifier | Descrição |
|---|---|
| `onlyFactory` | Apenas o SurveyFactory pode chamar |
| `onlyCreator(surveyId)` | Apenas o criador da survey pode chamar |

## Checklists

- [x] `forge build` compila
- [x] No compiler warnings
