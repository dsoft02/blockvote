// scripts/seed.js
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`👷 Seeding data with deployer: ${deployer.address}`);

    const election = await ethers.getContractAt(
        "ElectionManager",
        "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    );

    const now = Math.floor(Date.now() / 1000);
    const day = 24 * 60 * 60;

    console.log("🗳️ Creating Departmental President election...");
    let tx = await election.createElection(
        "Departmental President",
        "Election for the Departmental President 2025",
        now,
        now + day
    );
    await tx.wait();

    console.log("🧑‍💼 Adding candidates to Departmental President...");
    await (await election.addCandidate(1, "Alice Johnson")).wait();
    await (await election.addCandidate(1, "Bob Smith")).wait();
    await (await election.addCandidate(1, "Charlie Brown")).wait();

    console.log("🗳️ Creating Departmental Secretary election...");
    tx = await election.createElection(
        "Departmental Secretary",
        "Election for Departmental Secretary 2025",
        now,
        now + day
    );
    await tx.wait();

    console.log("🧑‍💼 Adding candidates to Departmental Secretary...");
    await (await election.addCandidate(2, "Grace Adams")).wait();
    await (await election.addCandidate(2, "John Doe")).wait();
    await (await election.addCandidate(2, "Mary Smith")).wait();

    console.log("Seeding completed successfully!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
