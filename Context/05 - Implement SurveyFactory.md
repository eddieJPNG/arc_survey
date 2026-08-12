# 05 - Implement SurveyFactory

**Step 5 do PLAN.md — Concluído**

## Verificação

| Item | Status |
|---|---|
| `forge build` compila | ✅ |
| Sem warnings | ✅ |

## Ações Realizadas

1. Atualizado `src/SurveyVault.sol`:
   - Adicionado mapping `rewardPerResponse`
   - `fundSurvey()` agora aceita `_rewardPerResponse` como parâmetro
   - `distributeReward()` transfere apenas `rewardPerResponse` por response

2. Criado `src/SurveyFactory.sol` com:
   - Struct `Survey` com todos os campos do SPEC
   - `createSurvey()` — cria survey e emite SurveyCreated
   - `submitResponse()` — valida anti-double, chama vault.distributeReward, emite ResponseSubmitted
   - `getSurvey()` — retorna Survey struct
   - `getRespondents()` — retorna array de endereços

## Contrato SurveyFactory.sol

```solidity
contract SurveyFactory {
    struct Survey {
        uint256 id;
        address creator;
        string title;
        string description;
        uint256 maxResponses;
        uint256 rewardPerResponse;
        uint256 responseCount;
        bool active;
        uint256 createdAt;
    }

    uint256 public surveyCount;
    mapping(uint256 => Survey) public surveys;
    mapping(uint256 => mapping(address => bool)) public hasResponded;
    mapping(uint256 => address[]) public respondents;

    function createSurvey(string, string, uint256, uint256) external returns (uint256);
    function submitResponse(uint256 surveyId) external;
    function getSurvey(uint256 surveyId) external view returns (Survey memory);
    function getRespondents(uint256 surveyId) external view returns (address[] memory);
}
```

## Mudanças no SurveyVault

| Função | Antes | Depois |
|---|---|---|
| `fundSurvey` | `(surveyId, amount)` | `(surveyId, amount, rewardPerResponse)` |
| `distributeReward` | Transferia todo o balance | Transfere apenas `rewardPerResponse` |

## Interface ISurveyVault (usada pelo Factory)

```solidity
interface ISurveyVault {
    function fundSurvey(uint256 surveyId, uint256 amount, uint256 rewardPerResponse) external;
    function distributeReward(uint256 surveyId, address payable participant) external;
    function getBalance(uint256 surveyId) external view returns (uint256);
}
```

## Checklists

- [x] `forge build` compila
- [x] No compiler warnings
