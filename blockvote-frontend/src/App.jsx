import {Routes, Route, useLocation} from "react-router-dom";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import VotingPage from "@/pages/VotingPage";
import ResultPage from "@/pages/ResultPage";
import BlockchainExplorer from "@/pages/BlockchainExplorer";
import AdminDashboard from "@/admin/AdminDashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

const App = () => {
    const location = useLocation();

    const showNavbar = ["/", "/voting", "/results", "/blockchain"].includes(location.pathname);

    return (
        <div className="min-h-screen flex flex-col">
            {showNavbar && <Navbar/>}

            <main className="flex-1">
                <Routes>
                    {/* Public/User Pages */}
                    <Route path="/" element={<Home/>}/>
                    <Route path="/voting" element={<VotingPage/>}/>
                    <Route path="/results" element={<ResultPage/>}/>
                    <Route path="/blockchain" element={<BlockchainExplorer/>}/>

                    {/* Auth Pages */}
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>

                    {/* Admin Section */}
                    <Route path="/admin/*" element={<AdminDashboard/>}/>
                </Routes>
            </main>
        </div>
    );
};

export default App;
