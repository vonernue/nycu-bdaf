async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
  
    // Deploy VToken
    const Lab2Token = await ethers.getContractFactory("Lab2Token");
    const lab2Token = await Lab2Token.deploy();
    console.log("Token contract deployed to:", lab2Token.target);
  
    // Deploy Lab2Option with VToken address
    const Lab2Option = await ethers.getContractFactory("Lab2Option");
    const lab2Option = await Lab2Option.deploy(lab2Token.target);
    console.log("Lab2Option contract deployed to:", lab2Option.target);
}
  
main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});
  