import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import type { AxiosError } from "axios";
import { Eye, EyeOff, Leaf } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const response = await API.post("/signin", { email, password });
            localStorage.setItem("token", response.data.result.access_token);
            navigate("/dashboard");
        } catch (err: unknown) {
            const axiosErr = err as AxiosError<{ detail?: string }>;
            setError(
                axiosErr.response?.data?.detail || "Invalid email or password"
            );
        }
    };

    const ErrorMessage = ({ message, onClose }: { message: string; onClose: () => void }) => {
        if (!message) return null;
        return (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4"
            >
                <span className="block sm:inline">{message}</span>
                <span
                    className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
                    onClick={onClose}
                >
                    ✖
                </span>
            </motion.div>
        );
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-green-50 to-green-100 font-sans">
            {/* Left Branding */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="hidden lg:flex flex-col w-1/2 bg-green-700 text-white items-center justify-center p-16 rounded-r-3xl"
            >
                <Leaf className="w-20 h-20 mb-6" />
                <h1 className="text-5xl font-bold mb-4">Welcome Back!</h1>
                <p className="text-xl opacity-90 text-center max-w-xs">
                    Login to continue predicting plant diseases and managing your insights.
                </p>
            </motion.div>

            {/* Right Form */}
            <div className="flex flex-1 items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="w-full max-w-md bg-white p-10 rounded-3xl shadow-2xl border border-gray-100"
                >
                    <h2 className="text-3xl font-bold text-green-700 text-center mb-2">
                        Sign In
                    </h2>
                    <p className="text-gray-500 text-center mb-6">
                        Enter your credentials to access your dashboard
                    </p>

                    <ErrorMessage message={error} onClose={() => setError("")} />

                    <form onSubmit={handleLogin} className="space-y-5">
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                            required
                        />

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 pr-12 transition-all"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition shadow-lg"
                        >
                            Login
                        </button>
                    </form>

                    <p className="text-sm text-gray-600 text-center mt-6">
                        Don&apos;t have an account?{" "}
                        <span
                            onClick={() => navigate("/register")}
                            className="text-green-600 cursor-pointer hover:underline font-medium"
                        >
                            Register here
                        </span>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
