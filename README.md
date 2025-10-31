# 🗳️ BlockVote — Blockchain Voting System

A Final Year Project by **BOLU OMOLOLA (FPA/CS/23/3-0123)**  
A decentralized voting system built with **Ethereum**, **Hardhat**, **React**, and **Tailwind CSS**.

![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.0-blue)
![Hardhat](https://img.shields.io/badge/Hardhat-Dev-yellow)
![React](https://img.shields.io/badge/React-18.x-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🧭 Overview

**BlockVote** is a decentralized voting platform that leverages **Ethereum smart contracts** to ensure transparent, tamper-proof, and verifiable elections.  
Administrators can create and manage elections, while voters securely cast their votes through **MetaMask**, interacting directly with the blockchain.  

Built with **Hardhat** for contract development and **React + Tailwind CSS** for the frontend, BlockVote demonstrates real-world blockchain integration for academic and demo use.

---

## 📑 Table of Contents

1. [Prerequisites](#prerequisites)  
2. [Clone the Repository](#clone-the-repository)  
3. [Install Dependencies](#install-dependencies)  
4. [Compile, Deploy & Run](#compile-deploy--run)  
5. [Run Seeder (Optional)](#run-seeder-optional)  
6. [Frontend Setup](#frontend-setup)  
7. [MetaMask Setup](#metamask-setup)  
8. [Import Hardhat Accounts](#import-hardhat-accounts)  
9. [Admin Dashboard](#admin-dashboard)  
10. [Project Structure](#project-structure)  
11. [Scripts](#scripts)  
12. [Environment Variables](#environment-variables)  
13. [Testing](#testing)  
14. [Security Notice](#security-notice)  
15. [License](#license)

---

## ⚙️ Prerequisites

- **Node.js ≥ 20.x**  
- **npm ≥ 9.x**  
- **MetaMask** browser extension  
- **Git**

---

## 📦 Clone the Repository

```bash
git clone https://github.com/dsoft02/blockvote.git
cd blockvote
````

---

## 🧩 Install Dependencies

Install dependencies for **contracts** and **frontend**:

```bash
# Contracts
cd blockvote-contracts
npm install

# Frontend
cd ../blockvote-frontend
npm install
```

---

## 🚀 Compile, Deploy & Run

You can run all setup steps automatically using the **run-all.js** script:

```bash
node scripts/run-all.js
```

This will:

1. Compile smart contracts (`ElectionManager.sol`)
2. Copy ABI to frontend (`src/abis/ElectionManager.json`)
3. Start a local Hardhat node
4. Deploy contracts to the blockchain
5. Launch the React frontend

**Optional:** Add `--seed` to populate sample elections and candidates:

```bash
node scripts/run-all.js --seed
```

> Ensure **port 8545** is free before running.
> Kill any existing Hardhat node if necessary.

---

## 🌱 Run Seeder (Optional)

To seed additional elections manually:

```bash
cd blockvote-contracts
npx hardhat run scripts/seed.js --network localhost
```

---

## 💻 Frontend Setup

Start the frontend manually (if not using `run-all.js`):

```bash
cd blockvote-frontend
npm run dev
```

Frontend will open at:

```
http://localhost:5173
```

---

## 🦊 MetaMask Setup

1. Open MetaMask → **Add Network → Add a Network Manually**
2. Use the following settings:

```
Network Name: Hardhat Localhost
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency Symbol: ETH
Block Explorer URL: (optional)
```

3. Save and connect MetaMask to this network.

---

## 🔑 Import Hardhat Accounts

After running `npx hardhat node`, Hardhat will display accounts and private keys:

```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

To import an account into MetaMask:

1. Open MetaMask → **Import Account**
2. Paste the **private key**
3. Click **Import**

> 🧠 **Account #0** is the **Admin/Owner account** —
> it has exclusive access to the **Admin Dashboard** for managing elections and candidates.
> Other accounts (e.g., #1, #2) can be used for voter testing.

---

## 🧭 Admin Dashboard

Accessible **only by the owner account**.

### Features:

* Create, update, and delete elections
* Add, update, and remove candidates
* Verify or remove voters
* End elections manually
* View election results in real time

---

## 🗂️ Project Structure

```
blockvote/
├── blockvote-contracts/       # Hardhat project (Solidity contracts, deploy & seed scripts)
│   ├── contracts/
│   ├── scripts/
│   ├── hardhat.config.js
│   └── package.json
├── blockvote-frontend/        # React + Tailwind frontend
│   ├── src/
│   ├── vite.config.js
│   └── package.json
└── scripts/
    └── run-all.js             # Orchestrates compilation, deployment, and frontend launch
```

---

## ⚙️ Scripts

| Command                                                 | Description                                           |
| ------------------------------------------------------- | ----------------------------------------------------- |
| `node scripts/run-all.js`                               | Compile, deploy, start Hardhat node, and run frontend |
| `node scripts/run-all.js --seed`                        | Same as above + seed sample elections/candidates      |
| `npx hardhat compile`                                   | Compile contracts only                                |
| `npx hardhat run scripts/deploy.js --network localhost` | Deploy contracts manually                             |
| `npx hardhat run scripts/seed.js --network localhost`   | Seed additional data                                  |

---

## 🔧 Environment Variables

Create a `.env` file in **blockvote-frontend**:

```
VITE_CONTRACT_ADDRESS=<deployed_contract_address>
VITE_NETWORK=localhost
```

---

## 🧪 Testing

To run contract tests:

```bash
cd blockvote-contracts
npx hardhat test
```

---

## 🔐 Security Notice

This system is intended for **academic and demonstration purposes** only.
Do **not** use it in production without:

* A formal smart contract audit
* Proper voter authentication mechanisms
* Secure key management and backend verification

All blockchain data is **local and reset** when you restart the Hardhat node.

---

## 🪪 License

This project is licensed under the **MIT License**.
See the [LICENSE](LICENSE) file for details.

---

> 🚧 **Status:** Under active academic development
> 🧩 Built with 💡 Hardhat × React × Tailwind × Ethereum
