// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "./interfaces/IERC20.sol";

contract SurveyVault {
    IERC20 public immutable usdc;
    address public factory;

    mapping(uint256 => uint256) public surveyBalance;
    mapping(uint256 => uint256) public rewardPerResponse;
    mapping(uint256 => uint256) public totalDistributed;
    mapping(uint256 => address) public surveyCreator;

    event SurveyFunded(uint256 indexed surveyId, uint256 amount);
    event RewardPaid(uint256 indexed surveyId, address indexed participant, uint256 amount);
    event SurveyWithdrawn(uint256 indexed surveyId, address indexed creator, uint256 amount);

    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory");
        _;
    }

    modifier onlyCreator(uint256 surveyId) {
        require(msg.sender == surveyCreator[surveyId], "Only creator");
        _;
    }

    constructor(address _usdc) {
        usdc = IERC20(_usdc);
    }

    function setFactory(address _factory) external {
        require(factory == address(0), "Factory already set");
        factory = _factory;
    }

    function fundSurvey(uint256 surveyId, uint256 amount, uint256 _rewardPerResponse) external {
        require(amount > 0, "Amount must be > 0");
        require(_rewardPerResponse > 0, "Reward must be > 0");
        surveyCreator[surveyId] = msg.sender;
        rewardPerResponse[surveyId] = _rewardPerResponse;
        surveyBalance[surveyId] += amount;
        require(usdc.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        emit SurveyFunded(surveyId, amount);
    }

    function distributeReward(uint256 surveyId, address payable participant) external onlyFactory {
        uint256 reward = rewardPerResponse[surveyId];
        require(reward > 0, "No reward configured");
        require(surveyBalance[surveyId] >= reward, "Insufficient balance");

        surveyBalance[surveyId] -= reward;
        totalDistributed[surveyId] += reward;
        require(usdc.transfer(participant, reward), "Transfer failed");
        emit RewardPaid(surveyId, participant, reward);
    }

    function withdrawRemaining(uint256 surveyId) external onlyCreator(surveyId) {
        uint256 remaining = surveyBalance[surveyId];
        require(remaining > 0, "No remaining balance");

        surveyBalance[surveyId] = 0;
        require(usdc.transfer(msg.sender, remaining), "Transfer failed");
        emit SurveyWithdrawn(surveyId, msg.sender, remaining);
    }

    function getBalance(uint256 surveyId) external view returns (uint256) {
        return surveyBalance[surveyId];
    }
}
