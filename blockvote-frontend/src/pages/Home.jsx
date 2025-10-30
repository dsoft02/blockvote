import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <header className="bg-indigo-700 text-white p-4 text-center text-2xl font-semibold">
                Blockchain-Based E-Voting System
            </header>

            <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-10">
                <h1 className="text-4xl font-bold mb-4">Secure, Transparent, and Trustless Voting</h1>
                <p className="text-gray-600 max-w-lg mb-8">
                    Cast your vote with confidence. Every vote is securely recorded on the blockchain and verified in real time.
                </p>

                <div className="flex gap-4">
                    <Link
                        to="/register"
                        className="px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                        Register to Vote
                    </Link>
                    <Link
                        to="/login"
                        className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50"
                    >
                        Login
                    </Link>
                </div>

                <section className="mt-16 max-w-4xl text-left">
                    <h2 className="text-2xl font-semibold mb-4">Features</h2>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                        <li>Blockchain-backed integrity and transparency</li>
                        <li>Voter verification and admin approval</li>
                        <li>Real-time election tracking and result viewing</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">How It Works</h2>
                    <ol className="list-decimal list-inside text-gray-700 space-y-2">
                        <li>Register with your name, matric number, and wallet address</li>
                        <li>Admin verifies your registration</li>
                        <li>Login and participate in active elections</li>
                        <li>Your vote is securely recorded on the blockchain</li>
                    </ol>
                </section>
            </main>

            <footer className="bg-indigo-700 text-white p-4 text-center text-sm">
                © {new Date().getFullYear()} Unity Hill Blockchain Voting | Built with ❤️ by Bolu Omolola
            </footer>
        </div>
    );
}
