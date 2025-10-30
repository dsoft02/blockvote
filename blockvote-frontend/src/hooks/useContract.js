import {useEffect, useState} from "react";
import {ethers} from "ethers";
import ElectionManager from "../abis/ElectionManager.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default function useContract() {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState(null);

    useEffect(() => {
        const init = async () => {
            if (window.ethereum) {
                const p = new ethers.BrowserProvider(window.ethereum);
                setProvider(p);

                const s = await p.getSigner();
                setSigner(s);
                const addr = await s.getAddress();
                setAccount(addr);

                const c = new ethers.Contract(CONTRACT_ADDRESS, ElectionManager.abi, s);
                setContract(c);
            }
        };
        init();
    }, []);

    return {provider, signer, contract, account};
}
