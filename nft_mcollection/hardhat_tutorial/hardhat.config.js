require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });

// if error, in shell: npm install --save-dev @nomicfoundation/hardhat-toolbox 

const QUICKNODE_HTTP_URL = process.env.QUICKNODE_HTTP_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: "0.8.4",
  networks: {
    goerli: {
      url: QUICKNODE_HTTP_URL,
      accounts: [PRIVATE_KEY],
    },
  },
};