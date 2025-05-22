const CONTRACT_NAME = "TokenSwap";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
  
    // Deploy FlashLoan contract
    const contract = await ethers.getContractFactory(CONTRACT_NAME);
    const Contract = await contract.deploy(
        "0x0CB70e82cDA48ac413d15dDb5782130F57ef8844",
        "0x54E73fD8A779A335CDcEc7194a382F1F97bD4BA7"
    );
    console.log("Contract deployed to:", Contract.target);
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});