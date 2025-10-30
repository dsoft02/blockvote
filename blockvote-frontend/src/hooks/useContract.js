//src/hooks/useContract.js
import {useEffect, useState, useCallback} from "react";
import {ethers} from "ethers";
import toast from "react-hot-toast";
import ElectionManager from "../abis/ElectionManager.json";
import {handleError} from "../utils/handleError";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default function useContract() {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);

    // --- Connect Wallet on Button Click ---
    const connectWallet = useCallback(async () => {
        if (!window.ethereum) {
            toast.error("🦊 MetaMask not detected. Please install it to continue.");
            return;
        }

        try {
            setIsConnecting(true);
            toast.loading("Connecting wallet...");

            const p = new ethers.BrowserProvider(window.ethereum);

            // Request wallet connection (prompts MetaMask)
            const accounts = await p.send("eth_requestAccounts", []);
            const selectedAccount = accounts[0];

            const s = await p.getSigner();
            const c = new ethers.Contract(CONTRACT_ADDRESS, ElectionManager.abi, s);

            setProvider(p);
            setSigner(s);
            setContract(c);
            setAccount(selectedAccount);

            toast.dismiss();
            toast.success(`✅ Wallet connected: ${selectedAccount.slice(0, 6)}...${selectedAccount.slice(-4)}`);
        } catch (err) {
            toast.dismiss();

            if (err.code === -32002) {
                toast.error("⚠️ MetaMask connection request already pending. Please open MetaMask.");
            } else {
                const errorMsg = handleError(err);
                toast.error(errorMsg);
            }

            console.error("Wallet connection error:", err);
        } finally {
            setIsConnecting(false);
        }
    }, []);

    // --- Auto-detect if already connected ---
    useEffect(() => {
        async function checkAlreadyConnected() {
            if (window.ethereum) {
                const p = new ethers.BrowserProvider(window.ethereum);
                const accs = await p.listAccounts();

                if (accs.length > 0) {
                    const s = await p.getSigner();
                    const c = new ethers.Contract(CONTRACT_ADDRESS, ElectionManager.abi, s);
                    setProvider(p);
                    setSigner(s);
                    setContract(c);
                    setAccount(accs[0].address);

                    toast.success(`🔗 Reconnected: ${accs[0].address.slice(0, 6)}...${accs[0].address.slice(-4)}`);
                }
            }
        }

        checkAlreadyConnected();

        // Listen for account changes
        if (window.ethereum) {
            const handleAccountsChanged = (accounts) => {
                if (accounts.length === 0) {
                    setAccount(null);
                    setSigner(null);
                    setContract(null);
                    toast("Wallet disconnected 🔌");
                } else {
                    connectWallet();
                }
            };

            window.ethereum.on("accountsChanged", handleAccountsChanged);

            return () => {
                window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
            };
        }
    }, [connectWallet]);

    return {provider, signer, contract, account, connectWallet, isConnecting};
}
