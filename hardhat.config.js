const crypto = require("crypto");

require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Create Placeholder Private Key if .env not present
if (!process.env.PRIVATE_KEY) {
  process.env.PRIVATE_KEY = crypto.randomBytes(32).toString("hex"); 
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      evmVersion: "cancun",
    }
  },
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`, // Use Infura or Alchemy RPC
      accounts: [`${process.env.PRIVATE_KEY}`], // Your wallet private key
    },
    zircuit: {
      url: "https://zircuit-mainnet.drpc.org",
      accounts: [`${process.env.PRIVATE_KEY}`]
    },
    zircuitGarfield: {
      url: "https://zircuit-garfield-testnet.drpc.org",
      accounts: [`${process.env.PRIVATE_KEY}`]
    }
  },
  etherscan: {
    apiKey: `${process.env.ETHERSCAN_API_KEY}`
  },
};
