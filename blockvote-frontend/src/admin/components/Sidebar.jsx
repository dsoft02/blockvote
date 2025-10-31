// src/admin/components/Sidebar.jsx
import React from "react";
import {NavLink} from "react-router-dom";
import {
    SquareCheckBig,
    Users,
    UserCheck,
    BarChart3,
    Settings,
    X
} from "lucide-react";

export default function Sidebar({open, onClose}) {
    const linkClass = ({isActive}) =>
        `flex items-center gap-3 px-3 py-2 rounded transition ${
            isActive
                ? "bg-indigo-600 text-white"
                : "text-indigo-100 hover:bg-indigo-500/30"
        }`;

    return (
        <>
            {/* Mobile Overlay */}
            {open && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                ></div>
            )}

            <aside
                className={`fixed md:static z-50 transform ${
                    open ? "translate-x-0" : "-translate-x-full"
                } md:translate-x-0 transition-transform duration-300 w-64 bg-indigo-700 min-h-screen p-6 flex flex-col`}
            >
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-white text-2xl font-bold">Admin Panel</h1>
                    <button
                        className="text-white md:hidden"
                        onClick={onClose}
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <nav className="flex-1 space-y-2">
                    <NavLink to="/admin/elections" className={linkClass}>
                        <SquareCheckBig className="h-5 w-5" />
                        Elections
                    </NavLink>

                    <NavLink to="/admin/candidates" className={linkClass}>
                        <Users className="h-5 w-5" />
                        Candidates
                    </NavLink>

                    <NavLink to="/admin/voters" className={linkClass}>
                        <UserCheck className="h-5 w-5" />
                        Voters
                    </NavLink>

                    <NavLink to="/admin/results" className={linkClass}>
                        <BarChart3 className="h-5 w-5" />
                        Results
                    </NavLink>

                    <NavLink to="/admin/settings" className={linkClass}>
                        <Settings className="h-5 w-5" />
                        Settings
                    </NavLink>
                </nav>
            </aside>
        </>
    );
}
