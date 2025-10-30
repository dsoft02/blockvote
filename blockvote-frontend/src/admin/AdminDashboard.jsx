// src/admin/AdminDashboard.jsx
import React, {useContext, useEffect, useState} from "react";
import {Routes, Route, Navigate} from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import ElectionsPage from "./pages/ElectionsPage";
import CandidatesPage from "./pages/CandidatesPage";
import ResultsPage from "./pages/ResultsPage";
import SettingsPage from "./pages/SettingsPage";
import VotersPage from "./pages/VotersPage";
import {AdminProvider, AdminProtected, AdminContext} from "./AdminAuth";
import AdminLogin from "./AdminLogin";
import {toast} from "react-hot-toast";
import {handleError} from "../utils/handleError.js";

function Topbar({onToggleSidebar}) {
    const {account, connectWallet, disconnectWallet, isOwner, contract} = useContext(AdminContext);
    const [adminAddr, setAdminAddr] = useState("");

    useEffect(() => {
        const fetchAdmin = async () => {
            try {
                if (contract) {
                    const addr = await contract.admin();
                    setAdminAddr(addr);
                }
            } catch (err) {
                console.error("Failed to fetch admin:", err);
            }
        };
        fetchAdmin();
    }, [contract]);

    return (
        <header
            className="bg-white shadow p-3 md:p-4 rounded-lg mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center justify-between w-full md:w-auto">
                <div className="flex items-center gap-2">
                    <button onClick={onToggleSidebar} className="md:hidden text-indigo-600 text-2xl">
                        ☰
                    </button>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                        Admin Dashboard
                    </h1>
                </div>

                {account && (
                    <button
                        onClick={() => disconnectWallet()}
                        className="md:hidden px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                    >
                        Logout
                    </button>
                )}
            </div>

            {!account ? (
                <div className="flex justify-end">
                    <button
                        onClick={async () => {
                            try {
                                await connectWallet();
                            } catch (err) {
                                toast.error(handleError(err));
                            }
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm md:text-base"
                    >
                        Connect Wallet
                    </button>
                </div>
            ) : (
                <div className="flex flex-col md:flex-row md:items-center md:gap-4 text-sm text-gray-700">
                    <div className="truncate max-w-[180px] md:max-w-none">
                        {isOwner ? (
                            <span className="text-green-600 font-medium">
                ✅ {account.slice(0, 6)}...{account.slice(-4)} (Owner)
              </span>
                        ) : (
                            <span className="text-red-500 font-medium">
                ⚠️ {account.slice(0, 6)}...{account.slice(-4)} (Not Owner)
              </span>
                        )}
                    </div>

                    {adminAddr && (
                        <span className="text-gray-500 text-xs md:text-sm italic">
              Contract Admin: {adminAddr.slice(0, 6)}...{adminAddr.slice(-4)}
            </span>
                    )}

                    <button
                        onClick={disconnectWallet}
                        className="hidden md:inline px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                        Logout
                    </button>
                </div>
            )}
        </header>
    );
}

export default function AdminDashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <AdminProvider>
            <DashboardWrapper sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
        </AdminProvider>
    );
}

function DashboardWrapper({sidebarOpen, setSidebarOpen}) {
    const {account, isOwner, loadingAuth, ownerChecked} = useContext(AdminContext);

    if (loadingAuth || !ownerChecked) {
        return (
            <div className="flex items-center justify-center h-screen text-gray-600">
                Checking admin privileges...
            </div>
        );
    }

    if (!account) return <AdminLogin/>;
    if (!isOwner) return <AdminLogin/>;

    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)}/>

            <main className="flex-1 p-4 md:p-6 bg-gray-100">
                <Topbar onToggleSidebar={() => setSidebarOpen(true)}/>
                <Routes>
                    <Route path="/" element={<Navigate to="elections" replace/>}/>
                    <Route
                        path="elections"
                        element={
                            <AdminProtected>
                                <ElectionsPage/>
                            </AdminProtected>
                        }
                    />
                    <Route
                        path="candidates"
                        element={
                            <AdminProtected>
                                <CandidatesPage/>
                            </AdminProtected>
                        }
                    />
                    <Route
                        path="voters"
                        element={
                            <AdminProtected>
                                <VotersPage/>
                            </AdminProtected>
                        }
                    />
                    <Route
                        path="results"
                        element={
                            <AdminProtected>
                                <ResultsPage/>
                            </AdminProtected>
                        }
                    />
                    <Route
                        path="settings"
                        element={
                            <AdminProtected>
                                <SettingsPage/>
                            </AdminProtected>
                        }
                    />
                </Routes>
            </main>
        </div>
    );
}
