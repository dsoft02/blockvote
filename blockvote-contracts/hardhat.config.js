require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {},
    // sepolia: {
    //   url: "https://sepolia.infura.io/v3/YOUR_INFURA_ID",
    //   accounts: ["0xYOUR_PRIVATE_KEY"],
    // },
  },
};
