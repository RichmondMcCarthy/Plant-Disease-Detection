import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import type { AxiosError } from "axios";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { motion } from "framer-motion";

const Register = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }
        if (!firstName || !lastName) {
            setError("First and last name are required");
            return;
        }

        try {
            await API.post("/signup", {
                first_name: firstName,
                last_name: lastName,
                email,
                password,
            });
            navigate("/login");
        } catch (err: unknown) {
            const axiosErr = err as AxiosError<{ detail?: string }>;
            setError(
                axiosErr.response?.data?.detail || "Failed to register. Try again."
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
                <UserPlus className="w-20 h-20 mb-6" />
                <h1 className="text-5xl font-bold mb-4">Welcome!</h1>
                <p className="text-xl opacity-90 text-center max-w-xs">
                    Create your account to predict plant diseases and track your history effortlessly.
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
                        Create Account
                    </h2>
                    <p className="text-gray-500 text-center mb-6">
                        Sign up to start predicting plant diseases
                    </p>

                    <ErrorMessage message={error} onClose={() => setError("")} />

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                required
                            />
                        </div>

                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                            required
                        />

                        {/* Password */}
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
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Confirm Password */}
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 pr-12 transition-all"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition shadow-lg"
                        >
                            Register
                        </button>
                    </form>

                    <p className="text-sm text-gray-600 text-center mt-6">
                        Already have an account?{" "}
                        <span
                            onClick={() => navigate("/login")}
                            className="text-green-600 cursor-pointer hover:underline font-medium"
                        >
                            Login here
                        </span>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
