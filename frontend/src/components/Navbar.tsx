import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut } from "lucide-react";
import logo from "../assets/pdd-bg.jpg";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const isDashboard = location.pathname === "/dashboard";

    return (
        <nav className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 flex justify-between items-center shadow-lg backdrop-blur-md">
            {/* Left side: Logo + Title */}
            <div
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-3 cursor-pointer"
            >
                <img
                    src={logo}
                    alt="Plant Logo"
                    className="w-10 h-10 object-cover rounded-full border-2 border-white shadow-md"
                />
                <div>
                    <h1 className="text-lg font-bold leading-tight">Plant DD</h1>
                    <p className="text-xs text-green-100">AI Plant Health</p>
                </div>
            </div>

            {/* Center: Back button (only if not dashboard) */}
            {!isDashboard && (
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 bg-white/90 text-green-700 px-4 py-2 rounded-full shadow hover:bg-white transition"
                >
                    <ArrowLeft size={18} /> Back
                </button>
            )}

            {/* Right side: Dashboard → Logout, Others → placeholder */}
            {isDashboard ? (
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-red-500 px-4 py-2 rounded-full shadow hover:bg-red-600 transition"
                >
                    <LogOut size={18} /> Logout
                </button>
            ) : (
                <div className="w-[90px]" /> // keeps spacing consistent
            )}
        </nav>
    );
}

export default Navbar;
