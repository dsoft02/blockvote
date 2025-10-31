// src/admin/pages/VotersPage.jsx
import React, {useEffect, useState, useContext} from "react";
import {AdminContext} from "../AdminAuth";
import {toast} from "react-hot-toast";
import {handleError} from "../../utils/handleError";

export default function VotersPage() {
    const {contract} = useContext(AdminContext);
    const [voters, setVoters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [processing, setProcessing] = useState(null);

    const fetchVoters = async () => {
        try {
            if (!contract) return;
            setLoading(true);
            const allVoters = await contract.getAllVoters();
            const formatted = allVoters.map((v) => ({
                name: v.name,
                matricNo: v.matricNo,
                wallet: v.wallet,
                isVerified: v.isVerified,
                hasVoted: v.hasVoted,
            }));
            setVoters(formatted);
        } catch (err) {
            console.error(err);
            toast.error(handleError(err));
        } finally {
            setLoading(false);
        }
    };

    const verifyVoter = async (wallet) => {
        try {
            if (!contract) return;
            setProcessing(wallet);
            const tx = await contract.verifyVoter(wallet);
            await tx.wait();
            toast.success(`Voter ${wallet.slice(0, 6)}... verified ✅`);
            fetchVoters();
        } catch (err) {
            console.error(err);
            toast.error(handleError(err));
        } finally {
            setProcessing(null);
        }
    };

    const filteredVoters = voters.filter((v) => {
        if (filter === "pending") return !v.isVerified;
        if (filter === "validated") return v.isVerified;
        return true;
    });

    useEffect(() => {
        fetchVoters();
    }, [contract]);

    const shortAddr = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
                <h2 className="text-2xl font-bold">Voters Management</h2>

                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border rounded px-3 py-2 text-gray-700"
                >
                    <option value="all">All Voters</option>
                    <option value="pending">Pending Validation</option>
                    <option value="validated">Validated</option>
                </select>
            </div>

            {loading ? (
                <p className="text-gray-500">Loading voters...</p>
            ) : filteredVoters.length === 0 ? (
                <p className="text-gray-600">No voters found for this filter.</p>
            ) : (
                <div className="relative w-full overflow-auto">
                    <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Matric No</th>
                            <th className="px-4 py-2 text-left">Wallet</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredVoters.map((v, idx) => (
                            <tr key={idx} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-2">{v.name}</td>
                                <td className="px-4 py-2">{v.matricNo}</td>
                                <td className="px-4 py-2 font-mono text-sm">{shortAddr(v.wallet)}</td>
                                <td className="px-4 py-2">
                                    {v.isVerified ? (
                                        <span className="text-green-600 font-medium">✅ Verified</span>
                                    ) : (
                                        <span className="text-yellow-600 font-medium">⏳ Pending</span>
                                    )}
                                </td>
                                <td className="px-4 py-2">
                                    {!v.isVerified && (
                                        <button
                                            onClick={() => verifyVoter(v.wallet)}
                                            disabled={processing === v.wallet}
                                            className={`px-4 py-1.5 rounded text-white ${
                                                processing === v.wallet
                                                    ? "bg-gray-400"
                                                    : "bg-indigo-600 hover:bg-indigo-700"
                                            }`}
                                        >
                                            {processing === v.wallet ? "Verifying..." : "Verify"}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
