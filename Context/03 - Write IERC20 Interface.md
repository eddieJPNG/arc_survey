# 03 - Write IERC20 Interface

**Step 3 do PLAN.md — Concluído**

## Verificação

| Item | Status |
|---|---|
| `forge build` compila sem erros | ✅ |

## Ações Realizadas

1. Criado diretório `src/interfaces/`
2. Criado arquivo `src/interfaces/IERC20.sol`
3. Verificado compilação com `forge build`

## Arquivo Criado

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
```

## Funções da Interface

| Função | Descrição |
|---|---|
| `totalSupply()` | Retorna o supply total do token |
| `balanceOf(address)` | Retorna o saldo de um endereço |
| `transfer(address, uint256)` | Transfere tokens para outro endereço |
| `allowance(address, address)` | Retorna o allowance de um spender |
| `approve(address, uint256)` | Aprova um spender para gastar tokens |
| `transferFrom(address, address, uint256)` | Transfere tokens de um endereço para outro |

## Checklists

- [x] `forge build` compiles with no errors
