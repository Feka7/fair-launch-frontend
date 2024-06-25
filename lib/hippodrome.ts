export const calculateContributionPercentageFunction = [{
    "inputs": [
        {
            "internalType": "uint128",
            "name": "campaignID",
            "type": "uint128"
        },
        {
            "internalType": "address",
            "name": "user",
            "type": "address"
        }
    ],
    "name": "calculateContributionPercentage",
    "outputs": [
        {
            "internalType": "uint256",
            "name": "percentage",
            "type": "uint256"
        }
    ],
    "stateMutability": "view",
    "type": "function"
}] as const;

export const claimRewardsFunction = [{
    "inputs": [
        {
            "internalType": "uint128",
            "name": "campaignID",
            "type": "uint128"
        }
    ],
    "name": "claimRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}] as const;

export const createCampaignFunction = [{
    "inputs": [
        {
            "components": [
                {
                    "internalType": "uint96",
                    "name": "poolSupply",
                    "type": "uint96"
                },
                {
                    "internalType": "uint88",
                    "name": "startTimestamp",
                    "type": "uint88"
                },
                {
                    "internalType": "uint88",
                    "name": "endTimestamp",
                    "type": "uint88"
                },
                {
                    "internalType": "uint88",
                    "name": "unvestingStreamStart",
                    "type": "uint88"
                },
                {
                    "internalType": "uint88",
                    "name": "unvestingStreamEnd",
                    "type": "uint88"
                },
                {
                    "internalType": "uint96",
                    "name": "rewardSupply",
                    "type": "uint96"
                },
                {
                    "internalType": "address",
                    "name": "tokenAddress",
                    "type": "address"
                },
                {
                    "internalType": "string",
                    "name": "campaignURI",
                    "type": "string"
                }
            ],
            "internalType": "struct IHippodromeTypes.CampaignParams",
            "name": "campaignParams",
            "type": "tuple"
        }
    ],
    "name": "createCampaign",
    "outputs": [
        {
            "internalType": "uint128",
            "name": "accountID",
            "type": "uint128"
        }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
}] as const;

export const fundCampaignFunction = [{
    "inputs": [
        {
            "internalType": "uint128",
            "name": "campaignID",
            "type": "uint128"
        },
        {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
        }
    ],
    "name": "fundCampaign",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}] as const;

export const getAvailableUserRewardsFunction = [{
    "inputs": [
        {
            "internalType": "address",
            "name": "user",
            "type": "address"
        },
        {
            "internalType": "uint128",
            "name": "campaignID",
            "type": "uint128"
        }
    ],
    "name": "getAvailableUserRewards",
    "outputs": [
        {
            "internalType": "uint256",
            "name": "rewards",
            "type": "uint256"
        }
    ],
    "stateMutability": "view",
    "type": "function"
}] as const;

export const getUserRewardStatusFunction = [{
    "inputs": [
        {
            "internalType": "uint128",
            "name": "campaignID",
            "type": "uint128"
        },
        {
            "internalType": "address",
            "name": "user",
            "type": "address"
        }
    ],
    "name": "getUserRewardStatus",
    "outputs": [
        {
            "internalType": "uint256",
            "name": "totalRewards",
            "type": "uint256"
        },
        {
            "internalType": "uint256",
            "name": "claimed",
            "type": "uint256"
        }
    ],
    "stateMutability": "view",
    "type": "function"
}] as const;

export const resolveCampaignFunction = [{
    "inputs": [
        {
            "internalType": "uint128",
            "name": "campaignID",
            "type": "uint128"
        }
    ],
    "name": "resolveCampaign",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}] as const;

export const withdrawFundsFunction = [{
    "inputs": [
        {
            "internalType": "uint128",
            "name": "campaignID",
            "type": "uint128"
        },
        {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
        }
    ],
    "name": "withdrawFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}] as const;
