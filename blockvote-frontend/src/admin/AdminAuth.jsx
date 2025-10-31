// src/admin/AdminAuth.jsx
import React, {createContext, useContext, useEffect, useState} from "react";
import {ethers} from "ethers";
import {toast} from "react-hot-toast";
import ElectionManagerJSON from "../abis/ElectionManager.json";

const CONTRACT_ABI = ElectionManagerJSON.abi;
export const DEFAULT_CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

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
    const [ownerChecked, setOwnerChecked] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                if (window.ethereum) {
                    const p = new ethers.BrowserProvider(window.ethereum);
                    setProvider(p);

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
                    toast("No MetaMask detected, using local RPC...");
                    setProvider(new ethers.JsonRpcProvider("http://127.0.0.1:8545"));
                }
            } catch (err) {
                console.error("Provider init failed:", err);
                toast.error("Failed to initialize provider");
            } finally {
                setLoadingAuth(false);
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (!contractAddress || !provider) return;

        const runner = signer || provider;
        const c = new ethers.Contract(contractAddress, CONTRACT_ABI, runner);
        setContract(c);
    }, [provider, signer, contractAddress]);

    useEffect(() => {
        let cancelled = false;

        const checkOwner = async () => {
            if (!contract || !account) {
                if (!cancelled) {
                    setIsOwner(false);
                    setOwnerChecked(true);
                    setLoadingAuth(false);
                }
                return;
            }

            setLoadingAuth(true);
            try {
                const adminAddr = await contract.admin();
                const match =
                    adminAddr.trim().toLowerCase() === account.trim().toLowerCase();
                if (!cancelled) {
                    setIsOwner(match);
                    setOwnerChecked(true);
                    setLoadingAuth(false);
                    console.log("🔍 Owner check:", {adminAddr, account, match});

                    if (!match) {
                        toast.error("Access denied Only the contract owner can access this dashboard");
                    }
                }
            } catch (err) {
                console.error("Owner check failed:", err);
                if (!cancelled) {
                    setIsOwner(false);
                    setOwnerChecked(true);
                    setLoadingAuth(false);
                }
            }
        };

        checkOwner();

        return () => {
            cancelled = true;
        };
    }, [account, contract]);


    async function connectWallet() {
        if (!window.ethereum) {
            toast.error("MetaMask is required");
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

            const c = new ethers.Contract(contractAddress, CONTRACT_ABI, s);
            setContract(c);

            localStorage.setItem("connectedAccount", addr);
            toast.success("Wallet connected");
        } catch (err) {
            console.error("Wallet connection error:", err);
            if (err.code === 4001) toast.error("Connection rejected by user");
            else if (err.code === -32002) toast("MetaMask request already pending");
            else toast.error("Failed to connect wallet");
        }
    }

    function disconnectWallet() {
        setAccount(null);
        setSigner(null);
        setIsOwner(false);
        setContract(null);
        setProvider(null);
        localStorage.removeItem("connectedAccount");
        toast("Disconnected wallet");
    }

    useEffect(() => {
        if (!window.ethereum) return;

        const handleAccountsChanged = (accounts) => {
            if (accounts.length === 0) disconnectWallet();
            else setAccount(accounts[0]);
        };

        const handleChainChanged = () => {
            toast("🔄 Network changed — reloading...");
            window.location.reload();
        };

        window.ethereum.on("accountsChanged", handleAccountsChanged);
        window.ethereum.on("chainChanged", handleChainChanged);

        return () => {
            window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
            window.ethereum.removeListener("chainChanged", handleChainChanged);
        };
    }, []);

    const value = {
        provider,
        signer,
        account,
        contract,
        contractAddress,
        setContractAddress,
        isOwner,
        loadingAuth,
        ownerChecked,
        connectWallet,
        disconnectWallet,
    };

    return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function AdminProtected({children}) {
    const {isOwner, loadingAuth, account} = useAdmin();

    if (loadingAuth) return <div className="p-6 text-center">Checking admin status...</div>;
    if (!account) {
        return (
            <div className="p-6 bg-white rounded shadow text-center">
                Please connect MetaMask (Admin) to continue.
            </div>
        );
    }

    if (!isOwner) {
        return (
            <div className="p-6 bg-white rounded shadow text-center text-red-500">
                Access denied — connected account is not the contract owner.
            </div>
        );
    }

    return <>{children}</>;
}
