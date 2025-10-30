import React, { useState } from "react";
import useContract from "../hooks/useContract";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
    const { contract, account } = useContract();
    const [matricNo, setMatricNo] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();
        if (!contract) return toast.error("Contract not connected.");
        if (!account) return toast.error("Please connect your wallet.");
        if (!matricNo) return toast.error("Enter your matric number.");

        try {
            setLoading(true);
            const voter = await contract.getVoter(account);

            // Check if voter exists
            if (!voter.matricNo || voter.matricNo.trim() === "") {
                toast.error("No voter record found for this wallet. Please register.");
            } else if (voter.matricNo.toLowerCase() !== matricNo.toLowerCase()) {
                toast.error("Matric number does not match your wallet record.");
            } else if (!voter.isVerified) {
                toast.error("Your registration has not been verified by the admin yet.");
            } else {
                toast.success("Login successful ✅");
                navigate("/vote");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.reason || err.message);
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Voter Login</h1>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Matric Number</label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded mt-1"
                            placeholder="Enter your matric number"
                            value={matricNo}
                            onChange={(e) => setMatricNo(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                        {loading ? "Validating..." : "Login"}
                    </button>
                </form>

                <p className="text-center text-sm mt-4 text-gray-500">
                    Not registered yet?{" "}
                    <a href="/register" className="text-indigo-600 hover:underline">
                        Register now
                    </a>
                </p>

                <div className="mt-4 text-xs text-gray-400 text-center">
                    Connected Wallet: {account || "Not connected"}
                </div>
            </div>
        </div>
    );
}
