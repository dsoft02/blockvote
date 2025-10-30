import React, { useState } from "react";
import useContract from "../hooks/useContract";
import toast from "react-hot-toast";

export default function Register() {
    const { contract, account } = useContract();
    const [name, setName] = useState("");
    const [matricNo, setMatricNo] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleRegister(e) {
        e.preventDefault();
        if (!contract) return toast.error("Contract not connected.");
        if (!account) return toast.error("Connect your wallet first.");
        if (!name || !matricNo) return toast.error("Please fill all fields.");

        try {
            setLoading(true);
            const tx = await contract.registerVoter(name, matricNo);
            await tx.wait();
            toast.success("Registration submitted. Waiting for admin verification ✅");
            setName("");
            setMatricNo("");
        } catch (err) {
            console.error(err);
            toast.error(err.reason || err.message);
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Voter Registration</h1>
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Full Name</label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded mt-1"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Matric Number</label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded mt-1"
                            placeholder="e.g., FPA/CS/23/3-0123"
                            value={matricNo}
                            onChange={(e) => setMatricNo(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>

                <p className="text-center text-sm mt-4 text-gray-500">
                    Already registered?{" "}
                    <a href="/login" className="text-indigo-600 hover:underline">
                        Go to Login
                    </a>
                </p>

                <div className="mt-4 text-xs text-gray-400 text-center">
                    Connected Wallet: {account || "Not connected"}
                </div>
            </div>
        </div>
    );
}
