// src/admin/AdminAuth.jsx
import React, {createContext, useContext, useEffect, useState} from "react";
import {ethers} from "ethers";
import ElectionManagerJSON from "../abis/ElectionManager.json";

const CONTRACT_ABI = ElectionManagerJSON.abi;

// Default contract address (can be changed in Settings)
export const DEFAULT_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// ✅ Exported context for global access
export const AdminContext = createContext();

export function useAdmin() {
    return useContext(AdminContext);
}

export function AdminProvider({children}) {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [account, setAccount] = useState(null);
    const [contractAddress, setContractAddress] = useState(DEFAULT_CONTRACT_ADDRESS);
    const [contract, setContract] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [loadingAuth, setLoadingAuth] = useState(true);

    // 🧩 Initialize provider on mount
    useEffect(() => {
        const init = async () => {
            if (window.ethereum) {
                const p = new ethers.BrowserProvider(window.ethereum);
                setProvider(p);

                // Auto-reconnect if previously connected
                const savedAccount = localStorage.getItem("connectedAccount");
                if (savedAccount) {
                    try {
                        const s = await p.getSigner();
                        const addr = await s.getAddress();
                        if (addr.toLowerCase() === savedAccount.toLowerCase()) {
                            setSigner(s);
                            setAccount(addr);
                        }
                    } catch {
                        console.warn("Auto reconnect failed.");
                    }
                }
            } else {
                // fallback provider (local hardhat node)
                setProvider(new ethers.JsonRpcProvider("http://127.0.0.1:8545"));
            }
            setLoadingAuth(false);
        };
        init();
    }, []);

    // 🧠 Create contract instance
    useEffect(() => {
        if (!contractAddress || !provider) return;

        const runner = signer || provider;
        const c = new ethers.Contract(contractAddress, CONTRACT_ABI, runner);
        setContract(c);
    }, [provider, signer, contractAddress]);

    // 🔐 Verify if connected account is contract owner
    useEffect(() => {
        const checkOwner = async () => {
            if (!contract || !account) {
                setIsOwner(false);
                return;
            }
            try {
                const adminAddr = await contract.admin();
                setIsOwner(adminAddr.toLowerCase() === account.toLowerCase());
            } catch (err) {
                console.error("Admin check failed", err);
                setIsOwner(false);
            }
        };
        checkOwner();
    }, [contract, account]);

    // 🔗 Connect wallet
    async function connectWallet() {
        if (!window.ethereum) {
            alert("MetaMask is required.");
            return;
        }
        try {
            await window.ethereum.request({method: "eth_requestAccounts"});
            const p = new ethers.BrowserProvider(window.ethereum);
            const s = await p.getSigner();
            const addr = await s.getAddress();
            setProvider(p);
            setSigner(s);
            setAccount(addr);
            // connect contract with signer
            const c = new ethers.Contract(contractAddress, CONTRACT_ABI, s);
            setContract(c);

            // save session for auto-reconnect
            localStorage.setItem("connectedAccount", addr);
        } catch (err) {
            console.error(err);
        }
    }

    function changeContractAddress(addr) {
        setContractAddress(addr);
    }

    // 🧹 Disconnect wallet (local only)
    function disconnectWallet() {
        setAccount(null);
        setSigner(null);
        setIsOwner(false);
        setContract(null);
        setProvider(null);
        localStorage.removeItem("connectedAccount");

        // optional: full reload ensures fresh UI state
        window.location.reload();
    }

    // ✅ Context value
    const value = {
        provider,
        signer,
        account,
        contract,
        contractAddress,
        setContractAddress: changeContractAddress,
        isOwner,
        connectWallet,
        disconnectWallet,
        loadingAuth,
    };

    return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

// 🧭 Protect admin routes
export function AdminProtected({children}) {
    const {isOwner, loadingAuth, account} = useAdmin();

    if (loadingAuth) {
        return <div className="p-6 text-center">Checking admin status...</div>;
    }

    if (!account) {
        return (
            <div className="p-6 bg-white rounded shadow text-center">
                Please connect MetaMask (Admin) to continue.
            </div>
        );
    }

    if (!isOwner) {
        return (
            <div className="p-6 bg-white rounded shadow text-center">
                ❌ Access denied — connected account is not the contract owner.
            </div>
        );
    }

    return <>{children}</>;
}
