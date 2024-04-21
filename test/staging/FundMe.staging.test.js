// const { assert } = require("chai")
// const { network, ethers, getNamedAccounts } = require("hardhat")
// const { developmentChains } = require("../../helper-hardhat-config")

// developmentChains.includes(network.name)
    // ? describe.skip
//     : describe("FundMe Staging Tests", function () {
//           let deployer
//           let fundMe
//           const sendValue = "100000000000"
//           beforeEach(async () => {
//             this.timeout(120000);
//             deployer = (await getNamedAccounts()).deployer
//             console.log(`deployer is : ${deployer}`)
//             await deployments.fixture(["all"])
//             const myContract = await deployments.get("FundMe");
//             fundMe = await ethers.getContractAt(
//                 myContract.abi,
//                 myContract.address,
//             );
//           })

//           it("allows people to fund and withdraw", async function () {
//             this.timeout(120000);
//               const fundTxResponse = await fundMe.fund({ value: sendValue })
//               await fundTxResponse.wait(1)
//               const withdrawTxResponse = await fundMe.withdraw()
//               await withdrawTxResponse.wait(1)

//               const endingFundMeBalance = await ethers.provider.getBalance(
                  
//               )
//               console.log(
//                   endingFundMeBalance.toString() +
//                       " should equal 0, running assert equal..."
//               )
//               assert.equal(endingFundMeBalance.toString(), "0")
//           })
//       })





const { assert } = require("chai");
const { network, ethers, getNamedAccounts, deployments } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

// Skipping or running tests based on the network type
developmentChains.includes(network.name)
    ? describe.skip()
    : describe("FundMe Staging Tests", function () {
          this.timeout(120000); // Sets a higher timeout for all tests in this suite
          let deployer;
          let fundMe;
          const sendValue = "510000000000000"

     
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer;
              console.log(`Deployer is: ${deployer}`);
              await deployments.fixture(["all"]);
              const myContract = await deployments.get("FundMe");
              fundMe = await ethers.getContractAt(
                  myContract.abi,
                  myContract.address,
              );
          });

          it("allows people to fund and withdraw", async function (done) {
              try {
                  const fundTxResponse = await fundMe.fund({ value: sendValue });
                  await fundTxResponse.wait(1);

                  const withdrawTxResponse = await fundMe.withdraw();
                  await withdrawTxResponse.wait(1);

                  const endingFundMeBalance = await ethers.provider.getBalance(fundMe.address);
                  console.log(
                      endingFundMeBalance.toString() +
                      " should equal 0, running assert equal..."
                  );
                  assert.equal(endingFundMeBalance.toString(), "0");
                  done(); // Signal Mocha that the test is finished
              } catch (error) {
                  done(error); // Pass any errors to Mocha
              }
          });
      });