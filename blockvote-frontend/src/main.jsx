import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App.jsx";
import AdminDashboard from "./admin/AdminDashboard.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <Router>
            <Routes>
                <Route path="/*" element={<App/>}/>
                <Route path="/admin/*" element={<AdminDashboard/>}/>
            </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { fontSize: "0.9rem" },
        }}
      />
        </Router>
    </StrictMode>
);
