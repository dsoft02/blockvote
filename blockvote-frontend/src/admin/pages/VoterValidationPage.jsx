// src/admin/pages/VoterValidationPage.jsx
import React, { useEffect, useState, useContext } from "react";
import { AdminContext } from "../AdminAuth";
import { toast } from "react-hot-toast";
import { handleError } from "../../utils/handleError";

export default function VoterValidationPage() {
    const { contract, account } = useContext(AdminContext);
    const [pendingVoters, setPendingVoters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);

    // 🔍 Fetch pending voters
    const fetchPendingVoters = async () => {
        try {
            if (!contract) return;
            setLoading(true);
            const voters = await contract.getPendingVoters(); // 🧠 assumes contract has this view function
            setPendingVoters(voters);
        } catch (err) {
            console.error(err);
            toast.error(handleError(err));
        } finally {
            setLoading(false);
        }
    };

    // ✅ Validate voter
    const validateVoter = async (voterAddr) => {
        if (!contract) return;
        try {
            setProcessing(voterAddr);
            const tx = await contract.validateVoter(voterAddr); // assumes contract method
            await tx.wait();
            toast.success(`Voter ${voterAddr.slice(0, 6)}... validated ✅`);
            fetchPendingVoters(); // refresh list
        } catch (err) {
            console.error(err);
            toast.error(handleError(err));
        } finally {
            setProcessing(null);
        }
    };

    useEffect(() => {
        fetchPendingVoters();
    }, [contract]);

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Voter Validation</h2>

            {loading ? (
                <p className="text-gray-500">Loading pending voters...</p>
            ) : pendingVoters.length === 0 ? (
                <p className="text-gray-600">No pending voters found 🎉</p>
            ) : (
                <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 text-left">Address</th>
                        <th className="px-4 py-2 text-left">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {pendingVoters.map((addr) => (
                        <tr key={addr} className="border-t">
                            <td className="px-4 py-2 font-mono text-sm">{addr}</td>
                            <td className="px-4 py-2">
                                <button
                                    onClick={() => validateVoter(addr)}
                                    disabled={processing === addr}
                                    className={`px-4 py-1.5 rounded text-white ${
                                        processing === addr
                                            ? "bg-gray-400"
                                            : "bg-indigo-600 hover:bg-indigo-700"
                                    }`}
                                >
                                    {processing === addr ? "Validating..." : "Validate"}
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
