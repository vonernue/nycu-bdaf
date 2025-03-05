const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Lab2", function () {
    async function deployContract() {
        const [owner, alice, bob] = await ethers.getSigners();
        const Token = await ethers.getContractFactory("Lab2Token");
        const token = await Token.deploy();
        const TimeLock = await ethers.getContractFactory("Lab2Option");
        const timelock = await TimeLock.deploy(token.target);
        await token.transfer(timelock.target, ethers.parseEther("50000000"));
        return { token, timelock, owner, alice, bob };
    }

    describe("Deployment", function () {
        it("Should deploy contracts and set initial balances", async function () {
            const { token, timelock, owner } = await loadFixture(deployContract);
            expect(await token.balanceOf(timelock.target)).to.equal(ethers.parseEther("50000000"));
        });
    });

    describe("Locking Funds", function () {
        it("Should not allow locking before time is set", async function () {
            const { timelock, alice } = await loadFixture(deployContract);
            await expect(timelock.connect(alice).lock({ value: ethers.parseEther("1") })).to.be.revertedWith("Lock time not set");
        });

        it("Should not allow locking after end time", async function () {
            const { timelock, owner, alice } = await loadFixture(deployContract);
            const startTime = (await time.latest()) + 100;
            const endTime = (await time.latest()) + 200;
            await timelock.connect(owner).setStartTime(startTime);
            await timelock.connect(owner).setEndTime(endTime);
            await time.increaseTo(endTime + 1);
            await expect(timelock.connect(alice).lock({ value: ethers.parseEther("1") })).to.be.revertedWith("Locking period has ended");
        });

        it("Should allow locking after time is set", async function () {
            const { timelock, owner, alice } = await loadFixture(deployContract);
            const startTime = (await time.latest()) + 100;
            const endTime = (await time.latest()) + 200;
            await timelock.connect(owner).setStartTime(startTime);
            await timelock.connect(owner).setEndTime(endTime);
            await timelock.connect(alice).lock({ value: ethers.parseEther("1") });
            expect(await timelock.balances(alice.address)).to.equal(ethers.parseEther("1"));
            expect(await timelock.reward(alice.address)).to.equal(ethers.parseEther("1000"));
        });
    });

    describe("Unlocking Funds", function () {
        it("Should not allow unlocking before end time", async function () {
            const { timelock, owner, alice } = await loadFixture(deployContract);
            const startTime = (await time.latest()) + 100;
            const endTime = (await time.latest()) + 200;
            await timelock.connect(owner).setStartTime(startTime);
            await timelock.connect(owner).setEndTime(endTime);
            await timelock.connect(alice).lock({ value: ethers.parseEther("1") });
            await expect(timelock.connect(alice).unlock()).to.be.revertedWith("Unlocking period not started");
        });

        it("Should allow unlocking after end time with correct rewards (no trade)", async function () {
            const { token, timelock, owner, alice } = await loadFixture(deployContract);
            
            const startTime = (await time.latest()) + 100;
            const endTime = startTime + 200;
            await timelock.connect(owner).setStartTime(startTime);
            await timelock.connect(owner).setEndTime(endTime);
            const initialBalance = await ethers.provider.getBalance(alice.address);
            await timelock.connect(alice).lock({ value: ethers.parseEther("1") });
            expect(await timelock.balances(alice.address)).to.equal(ethers.parseEther("1"));
            await time.increaseTo(endTime);
            await timelock.connect(alice).unlock();
            
            expect(await token.balanceOf(alice.address)).to.equal(ethers.parseEther("1000"));
            expect(await ethers.provider.getBalance(alice.address)).to.closeTo(initialBalance, ethers.parseEther("0.001"));
        });

        it("Should allow unlocking after end time with correct rewards (trade)", async function () {
            const { token, timelock, owner, alice } = await loadFixture(deployContract);
            
            const startTime = (await time.latest()) + 100;
            const endTime = startTime + 200;
            await timelock.connect(owner).setStartTime(startTime);
            await timelock.connect(owner).setEndTime(endTime);
            const initialBalance = await ethers.provider.getBalance(alice.address);
            await timelock.connect(alice).lock({ value: ethers.parseEther("1") });
            await timelock.connect(owner).tradeUserFunds(alice.address);
            await time.increaseTo(endTime);
            await timelock.connect(alice).unlock();
            
            expect(await token.balanceOf(alice.address)).to.equal(ethers.parseEther("3500"));
            expect(await ethers.provider.getBalance(alice.address)).to.closeTo(initialBalance - ethers.parseEther("1"), ethers.parseEther("0.001"));
        });
    });

    describe("Owner Functions", function () {
        it("Should allow owner to trade user funds", async function () {
            const { timelock, owner, alice } = await loadFixture(deployContract);
            const startTime = (await time.latest()) + 100;
            const endTime = (await time.latest()) + 200;
            await timelock.connect(owner).setStartTime(startTime);
            await timelock.connect(owner).setEndTime(endTime);
            await timelock.connect(alice).lock({ value: ethers.parseEther("1") });
            await timelock.connect(owner).tradeUserFunds(alice.address);
        });

        it("Should allow owner to withdraw ETH up to traded amount", async function () {
            const { timelock, owner, alice } = await loadFixture(deployContract);
            const startTime = (await time.latest()) + 100;
            const endTime = (await time.latest()) + 200;
            await timelock.connect(owner).setStartTime(startTime);
            await timelock.connect(owner).setEndTime(endTime);
            await timelock.connect(alice).lock({ value: ethers.parseEther("1") });
            await timelock.connect(owner).tradeUserFunds(alice.address);
            await expect(timelock.connect(owner).getETH()).to.changeEtherBalances([timelock, owner], [ethers.parseEther("-1"), ethers.parseEther("1")]);
        });
    });
});