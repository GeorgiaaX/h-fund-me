const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
? describe.skip
: describe("FundMe", async function () {
    
    let fundMe
    let mockV3Aggregator
    let deployer
    const sendValue = "1000000000000000000"
    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        console.log(`deployer is : ${deployer}`)
        await deployments.fixture(["all"])
        const myContract = await deployments.get("FundMe");
        fundMe = await ethers.getContractAt(
            myContract.abi,
            myContract.address,

        );
        const mymockV3Aggregator = await deployments.get("MockV3Aggregator");
        mockV3Aggregator = await ethers.getContractAt(
            mymockV3Aggregator.abi,
            mymockV3Aggregator.address
        )
    })

    describe("constructor", function () {
        it("sets the aggregator addresses correctly", async () => {
            const response = await fundMe.getPriceFeed()
            assert.equal(response, mockV3Aggregator.target)
        })
    })

    describe("fund", async function () {
        it("Fails if you don't send enough ETH", async function () {
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })
        it("Updates the amount funded data structure", async () => {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.getAddressToAmountFunded(
                deployer
            )
            assert.equal(response.toString(), sendValue.toString())
        })
        it("Adds funder to arary of funders", async function () {
            await fundMe.fund({ value: sendValue})
            const funder = await fundMe.getFunder(0)
            assert.equal(funder, deployer)
        });
    })
    describe("withdraw", async function () {
        beforeEach(async function () {
            await fundMe.fund({ value: sendValue });
        });

        it("Withdraw ETH from a single founder", async function () {
            // Arrange
            const startingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target,
            );
            const startingDeployerBalance =
            await ethers.provider.getBalance(deployer);

            // Act
            const transactionResponse = await fundMe.withdraw();
            const transactionReceipt = await transactionResponse.wait(1);
            // Get the Gas price used
            const { gasUsed, gasPrice } = transactionReceipt;
            const gasCost = gasUsed * gasPrice;

            const endingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target,
            );
            const endingDeployerBalance =
                await ethers.provider.getBalance(deployer);

            // Assert
            assert.equal(endingFundMeBalance, 0);
            assert.equal(
                startingFundMeBalance + startingDeployerBalance,
                endingDeployerBalance + gasCost,
            );
        });

        // it("is allows us to withdraw with multiple funders", async () => {
        //     // Arrange
        //     const accounts = await ethers.getSigners()
        //     for (i = 1; i < 6; i++) {
        //         const fundMeConnectedContract = await fundMe.connect(
        //             accounts[i]
        //         )
        //         await fundMeConnectedContract.fund({ value: sendValue })
        //     }
        //     const startingFundMeBalance =
        //         await ethers.provider.getBalance(fundMe.target)
        //     const startingDeployerBalance =
        //         await ethers.provider.getBalance(deployer)

        //     // Act
        //     // const transactionResponse = await fundMe.cheaperWithdraw()
        //     // Let's comapre gas costs :)
        //     const transactionResponse = await fundMe.withdraw()
        //     const transactionReceipt = await transactionResponse.wait()
        //     const { gasUsed, gasPrice } = transactionReceipt
        //     const gasCost = gasUsed * gasPrice

        //     const endingFundMeBalance = await ethers.provider.getBalance(
        //         fundMe.target
        //     )
        //     const endingDeployerBalance =
        //         await ethers.provider.getBalance(deployer)
        //     // Assert
        //     assert.equal(
        //         startingFundMeBalance + startingDeployerBalance.toString(),
        //         endingDeployerBalance + gasCost.toString()
        //     )
        //     // Make a getter for storage variables
        //     await expect(fundMe.getFunder(0)).to.be.reverted

        //     for (i = 1; i < 6; i++) {
        //         assert.equal(
        //             await fundMe.getAddressToAmountFunded(
        //                 accounts[i].address
        //             ),
        //             0
        //         )
        //     }
        // })

        it("only allows the owner to withdraw", async function () {
            const accounts = await ethers.getSigners()
            const attacker = accounts[1]
            const attackerConnectedContract = await fundMe.connect(attacker)
            await expect(attackerConnectedContract.withdraw()).to.be.reverted;
        })
    });
})
