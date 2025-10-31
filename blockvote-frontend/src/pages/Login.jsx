//src/pages/Login.jsx
import React, {useState} from "react";
import useContract from "../hooks/useContract";
import {useNavigate} from "react-router-dom";
import toast from "react-hot-toast";
import {ArrowLeft} from "lucide-react";
import {handleError} from "../utils/handleError";

export default function Login() {
    const {contract, account, connectWallet, isConnecting} = useContract();
    const [matricNo, setMatricNo] = useState("");
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({type: "", message: ""});
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();
        setAlert({type: "", message: ""});

        if (!contract || !account) {
            setAlert({
                type: "error",
                message: "Please connect your wallet before logging in",
            });
            toast.error("Please connect your wallet first.");
            return;
        }

        if (!matricNo) {
            toast.error("Enter your matric number.");
            return;
        }

        try {
            setLoading(true);
            const voter = await contract.getVoter(account);

            if (!voter.matricNo || voter.matricNo.trim() === "") {
                const msg = "No voter record found for this wallet. Please register.";
                toast.error(msg);
                setAlert({type: "error", message: msg});
            } else if (voter.matricNo.toLowerCase() !== matricNo.toLowerCase().trim()) {
                const msg = "Matric number does not match your wallet record.";
                toast.error(msg);
                setAlert({type: "error", message: msg});
            } else if (!voter.isVerified) {
                const msg = "Your registration has not been verified by the admin yet.";
                toast.error(msg);
                setAlert({type: "error", message: msg});
            } else {
                toast.success("Login successful");
                setAlert({
                    type: "success",
                    message: "Login successful Redirecting...",
                });
                setTimeout(() => navigate("/voting"), 1500);
            }
        } catch (err) {
            console.error(err);
            const errorMsg = handleError(err);
            toast.error(errorMsg);
            setAlert({
                type: "error",
                message: errorMsg || "Login failed",
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
                <h1 className="text-2xl font-bold mb-6 text-center">Voter Login</h1>

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
                        disabled={loading || !account}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90  py-2 rounded disabled:opacity-50"
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
