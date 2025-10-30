// src/admin/components/Sidebar.jsx
import React from "react";
import {NavLink} from "react-router-dom";

export default function Sidebar({open, onClose}) {
    const linkClass = ({isActive}) =>
        `block px-3 py-2 rounded ${isActive ? "bg-indigo-600 text-white" : "text-indigo-100 hover:bg-indigo-500/30"}`;

    return (
        <>
            {/* Overlay for mobile */}
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
                        className="text-white text-2xl md:hidden"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                <nav className="flex-1 space-y-2">
                    <NavLink to="/admin/elections" className={linkClass}>🗳️ Elections</NavLink>
                    <NavLink to="/admin/candidates" className={linkClass}>👥 Candidates</NavLink>
                    <NavLink to="/admin/results" className={linkClass}>📊 Results</NavLink>
                    <NavLink to="/admin/settings" className={linkClass}>⚙️ Settings</NavLink>
                </nav>
            </aside>
        </>
    );
}
