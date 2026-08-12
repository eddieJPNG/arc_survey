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
