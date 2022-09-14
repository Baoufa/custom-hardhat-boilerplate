require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

require('./tasks/accounts');
require('./tasks/block-number');

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "https://eth-goerli";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key";
const CMC_API_KEY = process.env.CMC_API_KEY || "key";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.9",
    defaultNetwork: "hardhat",
    networks: {
        goerli: {
            url: GOERLI_RPC_URL,
            chainId: 5,
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337,
        }
    },
    etherscan: {
        apiKey: {
            goerli: ETHERSCAN_API_KEY,
        },
    },
    gasReporter : {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: 'EUR',
        // coinmarketcap: CMC_API_KEY,
        // token: 'MATIC',
    }
};
