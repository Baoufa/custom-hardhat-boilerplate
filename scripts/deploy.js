const { ethers, run, network } = require("hardhat");
const fs = require("fs-extra");
const path = require("path");
const prompt = require("prompt");

function loggerReceipt(_contractReceipt) {
    console.log(``);
    console.log(`🌈 - Contract Deployed!`);
    console.log(`👤 - Deployer Address: ${_contractReceipt.from}`);
    console.log(`📍 - Contract Address: ${_contractReceipt.contractAddress}`);

    if (network.name !== "hardhat") {
        console.log(`🤑 - Gaz used: ${_contractReceipt.gasUsed.toString()}`);
    }
    console.log(``);
}

async function verify(contractAddress, args) {
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        });
    } catch (err) {
        if (err.message.toLowerCase().includes("already verified")) {
            console.log(`✅ - ${err.message}`);
        } else {
            console.log(`❌ - Error message: ${err}`);
        }
    }
}

async function decryptKey() {
    const promptSchema = {
        properties: {
            password: {
                message: "Enter your password to decrypt the private key",
                hidden: true,
                required: true,
            },
        },
    };


    const promptResult = await new Promise((resolve, reject) => {
        prompt.start();
        prompt.get(promptSchema, function (err, result) {
            resolve(result);
            reject(err);
        });
    });

    const PASSWORD = promptResult.password;

    try {
        let wallet;
        const keyPath = path.join(
            __dirname,
            "..",
            "encryptedKeys",
            ".encryptedKey.json"
        );
        const encryptedJson = fs.readFileSync(keyPath, "utf8");
        wallet = new ethers.Wallet.fromEncryptedJsonSync(
            encryptedJson,
            PASSWORD
        );
        wallet = wallet.connect(ethers.provider);
        return wallet;
    } catch (err) {
        throw new Error(
            `❌ - Error message: ${err}`
        );
    }
}

async function main() {
    const ContractFactory = await ethers.getContractFactory("FundMe");

    let [wallet] = await ethers.getSigners();

    ///////// USING ENCRYPTED KEYS //////////
     wallet = await decryptKey();
    /////////////// END /////////////////////

    console.log(``);
    console.log(`⌛ - Deploying, please wait...`);
    console.log(``);

    const contract = await ContractFactory.connect(wallet).deploy();

    if (network.name === "goerli") {
        console.log(
            `🌐 - View TX on etherscan: https://goerli.etherscan.io/tx/${contract.deployTransaction.hash}`
        );
    }

    await contract.deployed();
    const txReceipt = await contract.deployTransaction.wait();
    loggerReceipt(txReceipt);

    if (network.name === "goerli" && process.env.ETHERSCAN_API_KEY) {
        console.log(`⌛ - Verifying on Etherscan, please wait...`);
        console.log(``);
        await contract.deployTransaction.wait(6);
        await verify(txReceipt.contractAddress, []);
    }
}

main().then(() => {
    process.exit(0).catch((error) => {
        console.log(error);
        process.exit(1);
    });
});
