// scripts/run-all.js
const {spawn} = require("child_process");
const path = require("path");
const fs = require("fs-extra");

const rootDir = process.cwd();
const contractsDir = path.join(rootDir, "blockvote-contracts");
const frontendDir = path.join(rootDir, "blockvote-frontend");
const abiSrc = path.join(
    contractsDir,
    "artifacts/contracts/ElectionManager.sol/ElectionManager.json"
);
const abiDest = path.join(frontendDir, "src/abis/ElectionManager.json");
const seederPath = "scripts/seed.js";

// Check for --seed flag
const shouldSeed = process.argv.includes("--seed");

// Helper to run a command and wait for it to finish
function runCommand(cmd, args, cwd) {
    return new Promise((resolve, reject) => {
        const proc = spawn(cmd, args, {cwd, shell: true, stdio: "inherit"});
        proc.on("close", (code) => {
            if (code !== 0) reject(new Error(`${cmd} exited with code ${code}`));
            else resolve();
        });
    });
}

// Helper to run a long-running command in background
function runBackground(cmd, args, cwd) {
    const proc = spawn(cmd, args, {
        cwd,
        shell: true,
        stdio: "inherit",
        detached: false,
    });
    return proc;
}

async function main() {
    try {
        console.log("Compiling contracts...");
        await runCommand("npx", ["hardhat", "compile"], contractsDir);

        console.log("Copying ABI to frontend...");
        await fs.ensureDir(path.dirname(abiDest));
        await fs.copyFile(abiSrc, abiDest);

        console.log("Starting Hardhat node in background...");
        const nodeProcess = runBackground("npx", ["hardhat", "node"], contractsDir);

        // Wait 3 seconds for node to start
        await new Promise((r) => setTimeout(r, 3000));

        console.log("Deploying contracts to localhost...");
        await runCommand(
            "npx",
            ["hardhat", "run", "scripts/deploy.js", "--network", "localhost"],
            contractsDir
        );

        // Run seeder if --seed flag is passed
        if (shouldSeed) {
            console.log("Running seeder...");
            await runCommand("npx", ["hardhat", "run", "--network", "localhost", seederPath], contractsDir);
        }

        console.log("Starting frontend...");
        const frontendProcess = runBackground("npm", ["run", "dev"], frontendDir);

        console.log("All processes started successfully!");
        console.log("- Hardhat node running...");
        if (shouldSeed) console.log("- Seeder executed...");
        console.log("- Frontend running...");
        console.log("Press Ctrl+C to stop both.");

        // Keep the script alive while child processes run
        nodeProcess.on("exit", () => process.exit());
        frontendProcess.on("exit", () => process.exit());
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();
