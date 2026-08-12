# 07 - Write Deploy Script

**Step 7 do PLAN.md — Concluído**

## Verificação

| Item | Status |
|---|---|
| `forge build` compila | ✅ |
| Script parseia sem erro | ✅ |

## Ações Realizadas

1. Criado `script/Deploy.s.sol`
2. Verificado compilação com `forge build`

## Arquivo Criado

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {SurveyFactory} from "../src/SurveyFactory.sol";
import {SurveyVault} from "../src/SurveyVault.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address usdcAddress = 0x3600000000000000000000000000000000000000;

        vm.startBroadcast(deployerPrivateKey);

        SurveyVault vault = new SurveyVault(usdcAddress);
        SurveyFactory factory = new SurveyFactory(address(vault));
        vault.setFactory(address(factory));

        vm.stopBroadcast();

        console.log("SurveyFactory:", address(factory));
        console.log("SurveyVault:", address(vault));
    }
}
```

## Fluxo de Deploy

1. Lê `PRIVATE_KEY` do environment
2. Deploy SurveyVault com endereço USDC (`0x3600...0000`)
3. Deploy SurveyFactory com endereço do vault
4. Conecta vault ao factory via `setFactory()`
5. Loga endereços dos contratos

## USDC Address (Arc Testnet)

```
0x3600000000000000000000000000000000000000
```

## Comando de Deploy

```bash
export PRIVATE_KEY=0xYOUR_PRIVATE_KEY

forge script script/Deploy.s.sol \
  --rpc-url https://rpc.testnet.arc.io \
  --broadcast \
  --verify
```

## Checklists

- [x] `forge build` compila
- [x] Script parses without error
