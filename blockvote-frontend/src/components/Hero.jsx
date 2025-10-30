import { Shield, Lock, ArrowRight, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
    // 🔐 Mock login status (replace with your auth or contract logic)
    const isLoggedIn = false; // change to true to simulate a logged-in voter

    return (
        <section className="flex flex-col items-center text-center px-6 py-20">
            <div className="flex items-center justify-center mb-4 px-4 py-1.5 border rounded-full text-sm text-gray-600">
                <Shield className="w-4 h-4 mr-2 text-blue-600" />
                Secured by Blockchain Technology
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">
                Blockchain <span className="text-blue-600">Voting System</span>
            </h1>

            <p className="text-gray-600 max-w-2xl text-base md:text-lg mb-6">
                A Final Year Project by{" "}
                <span className="font-semibold text-gray-800">BOLU OMOLOLA</span> (FPA/CS/23/3-0123)
                <br />
                Department of Computer Science, Federal Polytechnic, Ado-Ekiti.
            </p>

            <div className="flex space-x-4 mt-4">
                {isLoggedIn ? (
                    // ✅ Show "Cast Vote" if logged in
                <Link
                        to="/voting"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold flex items-center hover:bg-blue-700"
                >
                    Cast Your Vote <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
                ) : (
                    // 🔄 Show "Register" if not logged in
                    <Link
                        to="/register"
                        className="px-6 rounded-lg py-3 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                    >
                        <UserPlus className="mr-2 w-4 h-4" />
                        Register to Vote
                    </Link>
                )}

                <Link
                    to="/login"
                    className="px-6 py-3 bg-gray-100 text-gray-800 rounded-lg font-semibold border hover:bg-gray-200 flex items-center space-x-2"
                >
                    <Lock size={18} />
                    <span>Login</span>
                </Link>
            </div>
        </section>
    );
};

export default Hero;
