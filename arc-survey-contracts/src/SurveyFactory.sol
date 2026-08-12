// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "./interfaces/IERC20.sol";

interface ISurveyVault {
    function fundSurvey(uint256 surveyId, uint256 amount, uint256 rewardPerResponse) external;
    function distributeReward(uint256 surveyId, address payable participant) external;
    function getBalance(uint256 surveyId) external view returns (uint256);
}

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

    ISurveyVault public immutable vault;

    event SurveyCreated(uint256 indexed surveyId, address indexed creator);
    event ResponseSubmitted(uint256 indexed surveyId, address indexed participant);

    modifier onlyVault() {
        require(msg.sender == address(vault), "Only vault");
        _;
    }

    constructor(address _vault) {
        vault = ISurveyVault(_vault);
    }

    function createSurvey(
        string calldata title,
        string calldata description,
        uint256 maxResponses,
        uint256 rewardPerResponse
    ) external returns (uint256 surveyId) {
        require(maxResponses > 0, "Max responses must be > 0");
        require(rewardPerResponse > 0, "Reward must be > 0");

        surveyCount++;
        surveyId = surveyCount;

        surveys[surveyId] = Survey({
            id: surveyId,
            creator: msg.sender,
            title: title,
            description: description,
            maxResponses: maxResponses,
            rewardPerResponse: rewardPerResponse,
            responseCount: 0,
            active: true,
            createdAt: block.timestamp
        });

        emit SurveyCreated(surveyId, msg.sender);
    }

    function submitResponse(uint256 surveyId) external {
        Survey storage survey = surveys[surveyId];
        require(survey.active, "Survey not active");
        require(survey.responseCount < survey.maxResponses, "Max responses reached");
        require(!hasResponded[surveyId][msg.sender], "Already responded");

        hasResponded[surveyId][msg.sender] = true;
        respondents[surveyId].push(msg.sender);
        survey.responseCount++;

        vault.distributeReward(surveyId, payable(msg.sender));

        emit ResponseSubmitted(surveyId, msg.sender);
    }

    function getSurvey(uint256 surveyId) external view returns (Survey memory) {
        return surveys[surveyId];
    }

    function getRespondents(uint256 surveyId) external view returns (address[] memory) {
        return respondents[surveyId];
    }
}
