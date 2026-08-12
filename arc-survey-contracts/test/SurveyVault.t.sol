// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {SurveyVault} from "../src/SurveyVault.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";

contract SurveyVaultTest is Test {
    SurveyVault public vault;
    MockUSDC public usdc;

    address public factory = address(0xFAC7);
    address public creator = address(0x1234);
    address public participant1 = address(0x5678);
    address public participant2 = address(0x9ABC);

    uint256 public constant INITIAL_SUPPLY = 100_000e6; // 100k USDC
    uint256 public constant SURVEY_ID = 1;
    uint256 public constant FUND_AMOUNT = 10_000e6; // 10k USDC
    uint256 public constant REWARD_PER_RESPONSE = 100e6; // 100 USDC

    function setUp() public {
        usdc = new MockUSDC(INITIAL_SUPPLY);
        vault = new SurveyVault(address(usdc));
        vault.setFactory(factory);

        usdc.mint(creator, 50_000e6);
        usdc.mint(participant1, 0);
        usdc.mint(participant2, 0);
    }

    function testFundSurvey() public {
        vm.prank(creator);
        usdc.approve(address(vault), FUND_AMOUNT);

        vm.prank(creator);
        vault.fundSurvey(SURVEY_ID, FUND_AMOUNT, REWARD_PER_RESPONSE);

        assertEq(vault.getBalance(SURVEY_ID), FUND_AMOUNT);
        assertEq(usdc.balanceOf(address(vault)), FUND_AMOUNT);
        assertEq(vault.rewardPerResponse(SURVEY_ID), REWARD_PER_RESPONSE);
        assertEq(vault.surveyCreator(SURVEY_ID), creator);
    }

    function testDistributeReward() public {
        vm.startPrank(creator);
        usdc.approve(address(vault), FUND_AMOUNT);
        vault.fundSurvey(SURVEY_ID, FUND_AMOUNT, REWARD_PER_RESPONSE);
        vm.stopPrank();

        uint256 balanceBefore = usdc.balanceOf(participant1);

        vm.prank(factory);
        vault.distributeReward(SURVEY_ID, payable(participant1));

        assertEq(usdc.balanceOf(participant1), balanceBefore + REWARD_PER_RESPONSE);
        assertEq(vault.getBalance(SURVEY_ID), FUND_AMOUNT - REWARD_PER_RESPONSE);
        assertEq(vault.totalDistributed(SURVEY_ID), REWARD_PER_RESPONSE);
    }

    function testWithdrawRemaining() public {
        vm.startPrank(creator);
        usdc.approve(address(vault), FUND_AMOUNT);
        vault.fundSurvey(SURVEY_ID, FUND_AMOUNT, REWARD_PER_RESPONSE);
        vm.stopPrank();

        // Distribute one reward first
        vm.prank(factory);
        vault.distributeReward(SURVEY_ID, payable(participant1));

        uint256 remaining = FUND_AMOUNT - REWARD_PER_RESPONSE;
        uint256 balanceBefore = usdc.balanceOf(creator);

        vm.prank(creator);
        vault.withdrawRemaining(SURVEY_ID);

        assertEq(usdc.balanceOf(creator), balanceBefore + remaining);
        assertEq(vault.getBalance(SURVEY_ID), 0);
    }

    function testCannotWithdrawIfNotCreator() public {
        vm.startPrank(creator);
        usdc.approve(address(vault), FUND_AMOUNT);
        vault.fundSurvey(SURVEY_ID, FUND_AMOUNT, REWARD_PER_RESPONSE);
        vm.stopPrank();

        vm.prank(participant1);
        vm.expectRevert("Only creator");
        vault.withdrawRemaining(SURVEY_ID);
    }

    function testInsufficientBalance() public {
        vm.startPrank(creator);
        usdc.approve(address(vault), FUND_AMOUNT);
        vault.fundSurvey(SURVEY_ID, FUND_AMOUNT, REWARD_PER_RESPONSE);
        vm.stopPrank();

        // Distribute all rewards (100 responses worth)
        for (uint256 i = 0; i < 100; i++) {
            address participant = address(uint160(0xBEEF + i));
            usdc.mint(participant, 0);

            vm.prank(factory);
            vault.distributeReward(SURVEY_ID, payable(participant));
        }

        // Try to distribute one more
        vm.prank(factory);
        vm.expectRevert("Insufficient balance");
        vault.distributeReward(SURVEY_ID, payable(participant2));
    }

    function testCannotFundWithZeroAmount() public {
        vm.prank(creator);
        vm.expectRevert("Amount must be > 0");
        vault.fundSurvey(SURVEY_ID, 0, REWARD_PER_RESPONSE);
    }

    function testCannotFundWithZeroReward() public {
        vm.prank(creator);
        vm.expectRevert("Reward must be > 0");
        vault.fundSurvey(SURVEY_ID, FUND_AMOUNT, 0);
    }
}
