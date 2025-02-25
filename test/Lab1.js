const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Lab1", function () {
    async function deployContract() {
        [owner, other] = await ethers.getSigners();
        Lab1 = await ethers.getContractFactory("Lab1");
        ethReceiver = await Lab1.deploy();

        return { ethReceiver, owner, other };
    };

    it("should receive ETH and emit an event", async function () {
        const { ethReceiver, other } = await loadFixture(deployContract);
        const amount = ethers.parseEther("1.0");
        await expect(other.sendTransaction({ to: await ethReceiver.getAddress(), value: amount }))
            .to.emit(ethReceiver, "ETHReceived")
            .withArgs(other.address, amount);
    });

    it("should allow only the owner to withdraw funds", async function () {
        const { ethReceiver, other } = await loadFixture(deployContract);
        const amount = ethers.parseEther("1.0");
        await other.sendTransaction({ to: await await ethReceiver.getAddress(), value: amount });

        await expect(ethReceiver.connect(other).withdraw()).to.be.revertedWith("Not owner");
    });

    it("should allow owner to withdraw all funds", async function () {
        const { ethReceiver, other } = await loadFixture(deployContract);
        const amount = ethers.parseEther("2.0");
        await other.sendTransaction({ to: await await ethReceiver.getAddress(), value: amount });
        
        await expect(ethReceiver.withdraw());
    });

    it("should revert if no funds are available to withdraw", async function () {
        await loadFixture(deployContract);
        await expect(ethReceiver.withdraw()).to.be.revertedWith("No funds to withdraw");
    });
});
