import {useState} from "react";
import {Link, useLocation} from "react-router-dom";
import {Menu, X, Vote} from "lucide-react";
// import { useAuth } from "@/hooks/useAuth"; // Uncomment once auth is ready

export default function NavBar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    // const { user } = useAuth(); // Uncomment this once your auth context is working
    const user = true; // ✅ Temporary mock user (set to false to test logged-out view)

    const navLinks = [
        {path: "/", label: "Home"},
        {path: "/register", label: "Register"},
        {path: "/login", label: "Login"},
    ];

    // Show "Vote" only if user is logged in
    if (user) navLinks.push({path: "/voting", label: "Vote"});

    return (
        <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center px-4 py-3">
                {/* ✅ App Icon + Name */}
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

                {/* ✅ Desktop Navigation */}
                <div className="hidden md:flex gap-6">
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
                </div>

                {/* ✅ Mobile Menu Toggle */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="md:hidden text-gray-700 hover:text-primary transition"
                >
                    {menuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
                </button>
            </div>

            {/* ✅ Mobile Dropdown */}
            {menuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200 shadow-sm">
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
                </div>
            )}
        </nav>
    );
}
