const {ethers} = require("hardhat");
const fs = require("fs-extra");
const path = require('path');
require("dotenv").config();

async function main() {
  const wallet = new ethers.Wallet(process.env.SECRET_KEY);
  const encryptedJsonKey = await wallet.encrypt(process.env.PASSWORD, process.env.SECRET_KEY);

  const keysDir = path.join(__dirname, '..', 'encryptedKeys');

  if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir);
  }

  fs.writeFileSync(
    path.join(keysDir, '.encryptedKey.json'), encryptedJsonKey);
}

main().then(() =>
  process.exit(0).catch(err => {
    console.error(err);
    process.exit(1);
  })
);