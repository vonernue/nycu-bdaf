async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Deploy Factory
    const Lab3Factory = await ethers.getContractFactory("Lab3Factory");
    const lab3factory = await Lab3Factory.deploy();
    console.log("Factory contract deployed to:", lab3factory.target);
}
  
main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});
  