// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {SurveyFactory} from "../src/SurveyFactory.sol";
import {SurveyVault} from "../src/SurveyVault.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";

contract SurveyFactoryTest is Test {
    SurveyFactory public factory;
    SurveyVault public vault;
    MockUSDC public usdc;

    address public creator = address(0x1234);
    address public participant1 = address(0x5678);
    address public participant2 = address(0x9ABC);
    address public participant3 = address(0xDEF0);

    uint256 public constant INITIAL_SUPPLY = 100_000e6;
    uint256 public constant FUND_AMOUNT = 10_000e6;
    uint256 public constant REWARD_PER_RESPONSE = 100e6;
    uint256 public constant MAX_RESPONSES = 50;

    function setUp() public {
        usdc = new MockUSDC(INITIAL_SUPPLY);
        vault = new SurveyVault(address(usdc));
        factory = new SurveyFactory(address(vault));
        vault.setFactory(address(factory));

        usdc.mint(creator, 50_000e6);
    }

    function testCreateSurvey() public {
        vm.prank(creator);
        uint256 surveyId = factory.createSurvey(
            "Test Survey",
            "Description",
            MAX_RESPONSES,
            REWARD_PER_RESPONSE
        );

        assertEq(surveyId, 1);
        assertEq(factory.surveyCount(), 1);

        SurveyFactory.Survey memory survey = factory.getSurvey(surveyId);
        assertEq(survey.id, 1);
        assertEq(survey.creator, creator);
        assertEq(survey.title, "Test Survey");
        assertEq(survey.description, "Description");
        assertEq(survey.maxResponses, MAX_RESPONSES);
        assertEq(survey.rewardPerResponse, REWARD_PER_RESPONSE);
        assertEq(survey.responseCount, 0);
        assertTrue(survey.active);
        assertEq(survey.createdAt, block.timestamp);
    }

    function testSubmitResponse() public {
        // Create survey
        vm.prank(creator);
        uint256 surveyId = factory.createSurvey(
            "Test Survey",
            "Description",
            MAX_RESPONSES,
            REWARD_PER_RESPONSE
        );

        // Fund survey
        vm.prank(creator);
        usdc.approve(address(vault), FUND_AMOUNT);
        vm.prank(creator);
        vault.fundSurvey(surveyId, FUND_AMOUNT, REWARD_PER_RESPONSE);

        // Submit response
        uint256 balanceBefore = usdc.balanceOf(participant1);

        vm.prank(participant1);
        factory.submitResponse(surveyId);

        // Check response recorded
        assertTrue(factory.hasResponded(surveyId, participant1));
        assertEq(factory.getRespondents(surveyId).length, 1);
        assertEq(factory.getRespondents(surveyId)[0], participant1);

        // Check survey state
        SurveyFactory.Survey memory survey = factory.getSurvey(surveyId);
        assertEq(survey.responseCount, 1);

        // Check reward paid
        assertEq(usdc.balanceOf(participant1), balanceBefore + REWARD_PER_RESPONSE);
    }

    function testCannotDoubleRespond() public {
        // Create and fund survey
        vm.prank(creator);
        uint256 surveyId = factory.createSurvey(
            "Test Survey",
            "Description",
            MAX_RESPONSES,
            REWARD_PER_RESPONSE
        );

        vm.prank(creator);
        usdc.approve(address(vault), FUND_AMOUNT);
        vm.prank(creator);
        vault.fundSurvey(surveyId, FUND_AMOUNT, REWARD_PER_RESPONSE);

        // First response
        vm.prank(participant1);
        factory.submitResponse(surveyId);

        // Second response should revert
        vm.prank(participant1);
        vm.expectRevert("Already responded");
        factory.submitResponse(surveyId);
    }

    function testMultipleParticipants() public {
        // Create and fund survey
        vm.prank(creator);
        uint256 surveyId = factory.createSurvey(
            "Test Survey",
            "Description",
            MAX_RESPONSES,
            REWARD_PER_RESPONSE
        );

        vm.prank(creator);
        usdc.approve(address(vault), FUND_AMOUNT);
        vm.prank(creator);
        vault.fundSurvey(surveyId, FUND_AMOUNT, REWARD_PER_RESPONSE);

        // Multiple participants respond
        vm.prank(participant1);
        factory.submitResponse(surveyId);

        vm.prank(participant2);
        factory.submitResponse(surveyId);

        vm.prank(participant3);
        factory.submitResponse(surveyId);

        // Check responses recorded
        assertEq(factory.getRespondents(surveyId).length, 3);
        assertTrue(factory.hasResponded(surveyId, participant1));
        assertTrue(factory.hasResponded(surveyId, participant2));
        assertTrue(factory.hasResponded(surveyId, participant3));

        // Check survey state
        SurveyFactory.Survey memory survey = factory.getSurvey(surveyId);
        assertEq(survey.responseCount, 3);
    }

    function testMaxResponsesReached() public {
        // Create survey with max 2 responses
        vm.prank(creator);
        uint256 surveyId = factory.createSurvey(
            "Test Survey",
            "Description",
            2,
            REWARD_PER_RESPONSE
        );

        vm.prank(creator);
        usdc.approve(address(vault), FUND_AMOUNT);
        vm.prank(creator);
        vault.fundSurvey(surveyId, FUND_AMOUNT, REWARD_PER_RESPONSE);

        // Two responses
        vm.prank(participant1);
        factory.submitResponse(surveyId);

        vm.prank(participant2);
        factory.submitResponse(surveyId);

        // Third response should revert
        vm.prank(participant3);
        vm.expectRevert("Max responses reached");
        factory.submitResponse(surveyId);
    }

    function testWithdrawRemaining() public {
        // Create and fund survey
        vm.prank(creator);
        uint256 surveyId = factory.createSurvey(
            "Test Survey",
            "Description",
            MAX_RESPONSES,
            REWARD_PER_RESPONSE
        );

        vm.prank(creator);
        usdc.approve(address(vault), FUND_AMOUNT);
        vm.prank(creator);
        vault.fundSurvey(surveyId, FUND_AMOUNT, REWARD_PER_RESPONSE);

        // One response
        vm.prank(participant1);
        factory.submitResponse(surveyId);

        // Creator withdraws remaining
        uint256 remaining = FUND_AMOUNT - REWARD_PER_RESPONSE;
        uint256 balanceBefore = usdc.balanceOf(creator);

        vm.prank(creator);
        vault.withdrawRemaining(surveyId);

        assertEq(usdc.balanceOf(creator), balanceBefore + remaining);
        assertEq(vault.getBalance(surveyId), 0);
    }

    function testInsufficientBalance() public {
        // Create survey with high reward
        vm.prank(creator);
        uint256 surveyId = factory.createSurvey(
            "Test Survey",
            "Description",
            MAX_RESPONSES,
            1000e6 // 1000 USDC per response
        );

        // Fund with only enough for 1 response
        vm.prank(creator);
        usdc.approve(address(vault), 1000e6);
        vm.prank(creator);
        vault.fundSurvey(surveyId, 1000e6, 1000e6);

        // First response succeeds
        vm.prank(participant1);
        factory.submitResponse(surveyId);

        // Second response should fail (insufficient balance)
        vm.prank(participant2);
        vm.expectRevert("Insufficient balance");
        factory.submitResponse(surveyId);
    }

    function testCannotCreateWithZeroMaxResponses() public {
        vm.prank(creator);
        vm.expectRevert("Max responses must be > 0");
        factory.createSurvey("Test", "Desc", 0, REWARD_PER_RESPONSE);
    }

    function testCannotCreateWithZeroReward() public {
        vm.prank(creator);
        vm.expectRevert("Reward must be > 0");
        factory.createSurvey("Test", "Desc", MAX_RESPONSES, 0);
    }
}
