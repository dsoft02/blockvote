// src/admin/AdminLogin.jsx
import React from "react";
import { useAdmin } from "./AdminAuth";

export default function AdminLogin() {
    const { connectWallet, account, isOwner, loadingAuth } = useAdmin();

    if (loadingAuth) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-gray-600 text-lg">Checking wallet...</div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full text-center">
                <h1 className="text-2xl font-bold mb-4 text-gray-800">Admin Login</h1>
                <p className="text-sm text-gray-600 mb-6">
                    Connect your MetaMask wallet to continue.
                </p>
                {!account ? (
                    <button
                        onClick={connectWallet}
                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Connect Wallet
                    </button>
                ) : !isOwner ? (
                    <div className="text-red-500 text-sm">
                        Access denied — not the contract owner.
                    </div>
                ) : (
                    <div className="text-green-600 font-medium">
                        Verified owner, redirecting...
                    </div>
                )}
            </div>
        </div>
    );
}
