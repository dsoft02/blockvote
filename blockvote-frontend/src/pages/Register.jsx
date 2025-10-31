import React, {useState} from "react";
import useContract from "../hooks/useContract";
import toast from "react-hot-toast";
import {ArrowLeft} from "lucide-react";
import { handleError } from "../utils/handleError";

export default function Register() {
    const {contract, account, connectWallet, isConnecting} = useContract();
    const [name, setName] = useState("");
    const [matricNo, setMatricNo] = useState("");
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({type: "", message: ""});

    async function handleRegister(e) {
        e.preventDefault();
        setAlert({type: "", message: ""});

        if (!contract || !account) {
            setAlert({
                type: "error",
                message: "Please connect your wallet before registering",
            });
            toast.error("Please connect your wallet first.");
            return;
        }

        if (!name || !matricNo) {
            toast.error("Please fill all fields.");
            return;
        }

        try {
            setLoading(true);
            const tx = await contract.registerVoter(name, matricNo);
            await tx.wait();
            toast.success("Registration submitted. Waiting for admin verification");
            setAlert({
                type: "success",
                message: "Registration successful! Waiting for admin verification",
            });

            setName("");
            setMatricNo("");
        } catch (err) {
            console.error(err);
            const errorMsg = handleError(err);
            toast.error(errorMsg);
            setAlert({
                type: "error",
                message: errorMsg || "Something went wrong during registration",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4">
            <div className="w-full max-w-md mb-4 text-left">
                <a
                    href="/"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                    <ArrowLeft size={16} strokeWidth={2} className="h-4 w-4 mr-2"/>
                    Back to Home
                </a>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Voter Registration</h1>

                {!account && (
                    <div className="mb-4 p-3 rounded-md text-sm bg-yellow-50 text-yellow-700 border border-yellow-200">
                        Wallet not connected.
                        <button
                            onClick={connectWallet}
                            disabled={isConnecting}
                            className="ml-2 px-2 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700 disabled:opacity-50"
                        >
                            {isConnecting ? "Connecting..." : "Connect Wallet"}
                        </button>
                    </div>
                )}

                {alert.message && (
                    <div
                        className={`mb-4 p-3 rounded-md text-sm font-medium ${
                            alert.type === "success"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                    >
                        {alert.message}
                    </div>
                )}

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
                        disabled={loading || !account}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90  py-2 rounded disabled:opacity-50"
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
