// src/admin/pages/SettingsPage.jsx
import React, {useState} from "react";
import {useAdmin, DEFAULT_CONTRACT_ADDRESS} from "../AdminAuth";

export default function SettingsPage() {
    const {contractAddress, setContractAddress, account} = useAdmin();
    const [addr, setAddr] = useState(contractAddress || DEFAULT_CONTRACT_ADDRESS);
    const [status, setStatus] = useState("");

    async function handleSave(e) {
        e.preventDefault();
        if (!addr || addr.length < 10) return setStatus("⚠️ Enter a valid address");
        setContractAddress(addr);
        setStatus("✅ Contract address updated successfully.");
    }

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Settings</h2>

            <div className="bg-white p-6 rounded-lg shadow max-w-xl">
                <label className="text-sm text-gray-600">Contract Address</label>
                <input
                    className="w-full p-2 border rounded mt-2 mb-3"
                    value={addr}
                    onChange={(e) => setAddr(e.target.value)}
                    placeholder="0x..."
                />

                <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                    Save
                </button>

                <div className="mt-4 text-sm text-gray-600">
                    <strong>Connected account:</strong>{" "}
                    {account ? (
                        <span className="font-mono text-green-700">
                            {account.slice(0, 6)}...{account.slice(-4)}
                        </span>
                    ) : (
                        <span className="text-gray-400">Not connected</span>
                    )}
                </div>

                {status && <div className="mt-3 text-sm text-gray-700">{status}</div>}
            </div>
        </div>
    );
}
