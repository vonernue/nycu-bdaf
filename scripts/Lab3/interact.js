const hre = require("hardhat");
const { ethers, abicoder } = hre;

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);

    const ERC20_ADDRESS = "0xd998677F134a09DdBB981132Ef3B902ab14f45a8";  // 🔄 Replace with your deployed token
    const OWNER_ADDRESS = deployer.address;
    const SALT = ethers.id("my-unique-salt");

    // 1️⃣ Deploy Factory
    const Factory = await ethers.getContractFactory("Lab3Factory");
    const factory = await Factory.deploy();
    const tx = await factory.deploymentTransaction();
    console.log("Factory deployed at:", factory.target, "via tx:", tx.hash);

    // 2️⃣ Precompute Withdrawer Address
    const Withdrawer = await ethers.getContractFactory("Lab3Withdrawer");
    const bytecode = Withdrawer.bytecode;
    const encodedArgs = ethers.AbiCoder.defaultAbiCoder().encode(["address"], [OWNER_ADDRESS]);
    const deployBytecode = bytecode + encodedArgs.slice(2);

    const computedAddress = ethers.getCreate2Address(
        factory.target,
        SALT,
        ethers.keccak256(deployBytecode)
    );
    console.log("Precomputed Withdrawer address:", computedAddress);

    // 3️⃣ Send tokens to precomputed Withdrawer address
    const erc20 = await ethers.getContractAt("IERC20", ERC20_ADDRESS);
    const amountToSend = ethers.parseUnits("100", 18); // send 100 tokens (adjust decimals)
    const transferTx = await erc20.transfer(computedAddress, amountToSend);
    console.log(`Sent ${amountToSend.toString()} tokens to ${computedAddress} via tx: ${transferTx.hash}`);

    // 4️⃣ Deploy Withdrawer via Factory (CREATE2)
    const deployTx = await factory.deployWithdrawer(OWNER_ADDRESS, SALT);
    // const receipt = await deployTx.send();
    console.log("Withdrawer deployed at:", computedAddress, "via tx:", deployTx.hash);

    // 5️⃣ Withdraw tokens back to the OWNER
    const withdrawer = await ethers.getContractAt("Lab3Withdrawer", computedAddress);
    const withdrawTx = await withdrawer.withdraw(ERC20_ADDRESS);
    console.log("Tokens withdrawn back to owner:", OWNER_ADDRESS, "via tx: ", withdrawTx.hash);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
