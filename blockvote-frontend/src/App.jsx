import {Routes, Route} from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import VotePage from "./pages/VotePage";
import {Toaster} from "react-hot-toast";

export default function App() {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <Toaster position="top-right"/>

            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/vote" element={<VotePage/>}/>
            </Routes>
        </div>
    );
}
