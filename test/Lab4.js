// Filename: contracts/test_Lab4.sol
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DonationVault", function () {
    let DonationVault, donationVault, vaultAddress, MockERC20, mockERC20, tokenAddress, owner, depositUser1, depositUser2;

    beforeEach(async function () {
        [owner, depositUser1, depositUser2, donationUser, vaultOwner] = await ethers.getSigners();

        // Deploy a mock ERC20 token
        MockERC20 = await ethers.getContractFactory("Lab4Token");
        mockERC20 = await MockERC20.deploy();
        tokenAddress = mockERC20.target;

        // Mint some tokens to depositUser1 and depositUser2
        await mockERC20.transfer(depositUser1.address, ethers.parseEther("1000"));
        await mockERC20.transfer(depositUser2.address, ethers.parseEther("1000"));
        await mockERC20.transfer(donationUser.address, ethers.parseEther("1000"));

        // Deploy the DonationVault contract
        DonationVault = await ethers.getContractFactory("DonationVault");
        donationVault = await DonationVault.deploy(vaultOwner.address, tokenAddress);
        vaultAddress = donationVault.target;
    });

    it("Should deploy correctly with initial parameters", async function () {
        expect(await donationVault.underlyingToken()).to.equal(tokenAddress);
        expect(await donationVault.sharePrice()).to.equal(ethers.parseEther("1"));
    });

    it("Should allow deposits and mint shares", async function () {
        const depositAmount = ethers.parseEther("100");

        // Approve and deposit tokens
        await mockERC20.connect(depositUser1).approve(vaultAddress, depositAmount);
        await donationVault.connect(depositUser1).deposit(depositAmount);

        // Check shares and vault balance
        const shares = await donationVault.balanceOf(depositUser1.address);
        expect(shares).to.equal(depositAmount);

        const vaultBalance = await mockERC20.balanceOf(vaultAddress);
        expect(vaultBalance).to.equal(depositAmount);
    });

    it("Should allow withdrawals and burn shares", async function () {
        const depositAmount = ethers.parseEther("100");

        // Deposit tokens
        await mockERC20.connect(depositUser1).approve(vaultAddress, depositAmount);
        await donationVault.connect(depositUser1).deposit(depositAmount);

        // Withdraw shares
        await donationVault.connect(depositUser1).withdraw(depositAmount);

        // Check balances
        const shares = await donationVault.balanceOf(depositUser1.address);
        expect(shares).to.equal(0);

        const depositUser1Balance = await mockERC20.balanceOf(depositUser1.address);
        expect(depositUser1Balance).to.equal(ethers.parseEther("1000"));

        const vaultBalance = await mockERC20.balanceOf(vaultAddress);
        expect(vaultBalance).to.equal(0);
    });

    it("Should withdraw correct amount when a donation happen", async function () {
        let depositUserAmount = await mockERC20.balanceOf(depositUser1.address);
        const depositAmount = ethers.parseEther("100");
        const withdrawAmount = ethers.parseEther("50");
        const donationAmount = ethers.parseEther("50");

        // Deposit tokens
        await mockERC20.connect(depositUser1).approve(vaultAddress, depositAmount);
        await donationVault.connect(depositUser1).deposit(depositAmount);
        depositUserAmount -= depositAmount;

        // Check initial share price
        let sharePrice = await donationVault.sharePrice();
        expect(sharePrice).to.equal(ethers.parseEther("1"));

        // DonationUser directly transfers tokens to the vault
        await mockERC20.connect(donationUser).transfer(vaultAddress, donationAmount);

        // Withdraw to update share price
        await donationVault.connect(depositUser1).withdraw(withdrawAmount);
        sharePrice = await donationVault.sharePrice();
        // Check share price
        expect(sharePrice).to.equal(ethers.parseEther("1.5"));
        // Check withdrawed Amount
        expect(await mockERC20.balanceOf(depositUser1.address)).to.equal(depositUserAmount + (BigInt(50) * sharePrice));
        
    });

    it("Should allow the owner to take fees", async function () {
        const depositAmount = ethers.parseEther("100");
        const feeAmount = ethers.parseEther("10");

        // Deposit tokens
        await mockERC20.connect(depositUser1).approve(vaultAddress, depositAmount);
        await donationVault.connect(depositUser1).deposit(depositAmount);

        // Take fee as owner
        await donationVault.connect(vaultOwner).takeFeeAsOwner(feeAmount);

        // Check balances
        const ownerBalance = await mockERC20.balanceOf(vaultOwner.address);
        expect(ownerBalance).to.equal(feeAmount);

        const vaultBalance = await mockERC20.balanceOf(vaultAddress);
        expect(vaultBalance).to.equal(depositAmount - feeAmount);
    });

    it("Should update share price correctly", async function () {
        const depositAmount = ethers.parseEther("100");

        // Deposit tokens
        await mockERC20.connect(depositUser1).approve(vaultAddress, depositAmount);
        await donationVault.connect(depositUser1).deposit(depositAmount);

        // Check initial share price
        let sharePrice = await donationVault.sharePrice();
        expect(sharePrice).to.equal(ethers.parseEther("1"));

        // Owner takes a fee
        const feeAmount = ethers.parseEther("10");
        await donationVault.connect(vaultOwner).takeFeeAsOwner(feeAmount);

        // Check updated share price
        sharePrice = await donationVault.sharePrice();
        expect(sharePrice).to.be.closeTo(ethers.parseEther("0.9"), ethers.parseEther("0.0001"));
    });
});