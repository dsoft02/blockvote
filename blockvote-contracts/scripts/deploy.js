const {ethers} = require("hardhat");

async function main() {
    const ElectionManager = await ethers.getContractFactory("ElectionManager");
    const electionManager = await ElectionManager.deploy();

    await electionManager.deployed();

    console.log("ElectionManager deployed to:", electionManager.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
