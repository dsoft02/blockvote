//src/components/NavBar.jsx
import {useEffect, useState} from "react";
import {Link, useLocation} from "react-router-dom";
import {Menu, X, Vote, User, LogOut} from "lucide-react";
import useContract from "../hooks/useContract";

export default function NavBar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [voter, setVoter] = useState(null);
    const location = useLocation();
    const {contract, account, disconnectWallet} = useContract();

    const isLoggedIn = Boolean(account);

    useEffect(() => {
        async function loadVoter() {
            if (contract && account) {
                try {
                    const v = await contract.getVoter(account);
                    setVoter({
                        name: v.name || "Voter",
                    });
                } catch (err) {
                    console.error("Failed to load voter:", err);
                }
            }
        }

        loadVoter();
    }, [contract, account]);

    let navLinks = [{path: "/", label: "Home"}];

    if (!isLoggedIn) {
        navLinks.push(
            {path: "/register", label: "Register"},
            {path: "/login", label: "Login"},
        );
    } else {
        navLinks.push(
            {path: "/voting", label: "Vote"},
            {path: "/results", label: "Results"},
            {path: "/explorer", label: "Blockchain Explorer"},
        );
    }

    return (
        <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
            {/*<div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3">*/}
            <div className="container mx-auto flex justify-between items-center px-4 sm:px-6 py-6 lg:px-8">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <div
                        className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary">
                        <Vote className="w-5 h-5 text-primary-foreground"/>
                    </div>
                    <span
                        className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-primary">
            BlockVote
          </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`font-medium transition-colors ${
                                location.pathname === link.path
                                    ? "text-primary"
                                    : "text-gray-600 hover:text-primary"
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}

                    {/* ✅ Voter Name + Logout */}
                    {isLoggedIn && (
                        <div className="flex items-center gap-4 pl-4 border-l">
                            <div className="flex items-center space-x-2">
                                <User className="h-5 w-5 text-gray-500"/>
                                <span className="text-sm font-medium text-gray-700">
                  {voter?.name || "Loading..."}
                </span>
                            </div>

                            <button
                                onClick={disconnectWallet}
                                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <LogOut className="h-4 w-4"/>
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="md:hidden text-gray-700 hover:text-primary transition"
                >
                    {menuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
                </button>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200 shadow-sm pb-3">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setMenuOpen(false)}
                            className={`block px-4 py-2 font-medium transition ${
                                location.pathname === link.path
                                    ? "bg-primary/10 text-primary"
                                    : "text-gray-700 hover:bg-primary/5"
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}

                    {isLoggedIn && (
                        <div className="px-4 pt-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <User className="h-5 w-5 text-gray-500"/>
                                <span className="text-sm font-medium text-gray-700">{voter?.name}</span>
                            </div>

                            <button
                                onClick={() => {
                                    disconnectWallet();
                                    setMenuOpen(false);
                                }}
                                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <LogOut className="h-4 w-4"/>
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}
