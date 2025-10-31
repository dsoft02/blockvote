//src/hooks/useContract.js
import {useEffect, useState, useCallback} from "react";
import {ethers} from "ethers";
import toast from "react-hot-toast";
import ElectionManager from "../abis/ElectionManager.json";
import {handleError} from "../utils/handleError";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

let currentAccount = null;
let isConnectingGlobal = false;

export default function useContract() {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [account, setAccount] = useState(currentAccount);
    const [contract, setContract] = useState(null);
    const [isConnecting, setIsConnecting] = useState(isConnectingGlobal);

    const connectWallet = useCallback(async () => {
        if (!window.ethereum) {
            toast.error("🦊 MetaMask not detected. Please install it to continue.");
            return;
        }

        try {
            setIsConnecting(true);
            isConnectingGlobal = true;
            toast.loading("Connecting wallet...");

            const p = new ethers.BrowserProvider(window.ethereum);
            const accounts = await p.send("eth_requestAccounts", []);
            const selectedAccount = accounts[0];

            const s = await p.getSigner();
            const c = new ethers.Contract(CONTRACT_ADDRESS, ElectionManager.abi, s);

            setProvider(p);
            setSigner(s);
            setContract(c);
            setAccount(selectedAccount);

            currentAccount = selectedAccount;

            toast.dismiss();
            toast.success(`Wallet connected: ${selectedAccount.slice(0, 6)}...${selectedAccount.slice(-4)}`);
        } catch (err) {
            toast.dismiss();

            if (err.code === -32002) {
                toast.error("MetaMask connection request already pending. Please open MetaMask.");
            } else {
                toast.error(handleError(err));
            }

            console.error("Wallet connection error:", err);
        } finally {
            setIsConnecting(false);
            isConnectingGlobal = false;
        }
    }, []);

    const disconnectWallet = useCallback(() => {
        setAccount(null);
        setSigner(null);
        setProvider(null);
        setContract(null);

        currentAccount = null;
        toast("Wallet disconnected. To fully disconnect, remove this site from MetaMask connections.");
    }, []);

    useEffect(() => {
        if (!window.ethereum) return;

        const initialize = async () => {
            const p = new ethers.BrowserProvider(window.ethereum);
            const accs = await p.listAccounts();

            if (accs.length > 0) {
                const s = await p.getSigner();
                const c = new ethers.Contract(CONTRACT_ADDRESS, ElectionManager.abi, s);
                setProvider(p);
                setSigner(s);
                setContract(c);
                setAccount(accs[0].address);

                if (currentAccount !== accs[0].address) {
                    toast.success(`🔗 Reconnected: ${accs[0].address.slice(0, 6)}...${accs[0].address.slice(-4)}`);
                    currentAccount = accs[0].address;
                }
            }
        };

        initialize();

        const handleAccountsChanged = (accounts) => {
            if (accounts.length === 0) {
                setAccount(null);
                setSigner(null);
                setContract(null);
                currentAccount = null;
                toast("Wallet disconnected. To fully disconnect, remove this site from MetaMask connections.");

            } else {
                const newAccount = accounts[0];
                setAccount(newAccount);

                if (currentAccount !== newAccount) {
                    toast.success(`🔗 Reconnected: ${newAccount.slice(0, 6)}...${newAccount.slice(-4)}`);
                    currentAccount = newAccount;
                }
            }
        };

        window.ethereum.on("accountsChanged", handleAccountsChanged);
        return () => window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    }, []);

    return {provider, signer, contract, account, connectWallet, disconnectWallet, isConnecting};
}
