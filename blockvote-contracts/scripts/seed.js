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

  const electionsToSeed = [
    {
      title: "Departmental President",
      description: "Election for the Departmental President 2025",
      candidates: ["Alice Johnson", "Bob Smith", "Charlie Brown"],
    },
    {
      title: "Departmental Secretary",
      description: "Election for Departmental Secretary 2025",
      candidates: ["Grace Adams", "John Doe", "Mary Smith"],
    },
    {
      title: "Class Representative",
      description: "Election for Class Representative of Computer Science 2025",
      candidates: ["David Okoro", "Emma Williams", "Femi Adeyemi"],
    },
    {
      title: "Social/Events Coordinator",
      description: "Election for Social and Events Coordinator 2025",
      candidates: ["Helen Brown", "Ibrahim Musa", "Joyce Nwankwo"],
    },
  ];

  for (const e of electionsToSeed) {
    console.log(`Creating election: ${e.title}...`);
    let tx = await election.createElection(e.title, e.description, now, now + day);
    await tx.wait();

    const electionCount = (await election.electionCount()).toNumber();
    console.log(`Adding candidates to ${e.title}...`);
    for (const name of e.candidates) {
      tx = await election.addCandidate(electionCount, name);
    await tx.wait();
    }
  }

    console.log("Seeding completed successfully!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
