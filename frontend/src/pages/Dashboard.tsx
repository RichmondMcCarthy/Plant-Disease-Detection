import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { AxiosError } from "axios";
import { Activity, Clock, BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

import Navbar from "../components/Navbar"
import logo from "../assets/logo.jpg";

interface Prediction {
    prediction_id: number;
    filename: string;
    disease_prediction: string;
    confidence: number;
    created_at: string;
}

export default function Dashboard() {
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await API.get<Prediction[]>("/plant/history");
                setPredictions(response.data || []);
            } catch (err: unknown) {
                if (err instanceof AxiosError) {
                    setError(
                        err.response?.data?.detail ||
                        err.response?.data?.message ||
                        "Failed to fetch dashboard data."
                    );
                } else if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unknown error occurred.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const mostFrequentDisease = () => {
        if (predictions.length === 0) return "—";
        const countMap: Record<string, number> = {};
        predictions.forEach((p) => {
            countMap[p.disease_prediction] =
                (countMap[p.disease_prediction] || 0) + 1;
        });
        return Object.entries(countMap).sort((a, b) => b[1] - a[1])[0][0];
    };

    // Prepare data for PieChart
    const diseaseData = Object.values(
        predictions.reduce((acc, p) => {
            if (!acc[p.disease_prediction]) {
                acc[p.disease_prediction] = {
                    name: p.disease_prediction,
                    value: 0,
                };
            }
            acc[p.disease_prediction].value += 1;
            return acc;
        }, {} as Record<string, { name: string; value: number }>)
    );

    const COLORS = ["#22c55e", "#3b82f6", "#a855f7", "#f59e0b", "#ef4444"];

    return (
        <div className="min-h-screen bg-green-50">
            {/* ✅ Navbar at the top */}
            <Navbar />

            <div className="max-w-5xl mx-auto p-6">
                {/* Welcome Banner */}
                <div
                    className="relative bg-cover bg-center overflow-hidden rounded-2xl shadow-lg"
                    style={{ backgroundImage: `url(${logo})` }}
                >
                    <div className="p-8 bg-black/40 text-white flex flex-col items-center justify-center min-h-[250px] text-center">
                        <h1 className="text-3xl font-bold">Welcome to Plant DD 🌱</h1>
                        <p className="text-lg mt-3 max-w-xl">
                            Track your predictions and monitor plant health insights.
                        </p>
                        <Link
                            to="/predict"
                            className="mt-6 px-6 py-3 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 transition"
                        >
                            🔍 Make a Prediction
                        </Link>
                    </div>
                </div>

                {loading && (
                    <p className="text-gray-500 text-center mt-6">Loading...</p>
                )}
                {error && <p className="text-red-500 text-center mt-6">{error}</p>}

                {!loading && !error && (
                    <>
                        {/* Stats */}
                        <div className="grid md:grid-cols-3 gap-6 mt-10">
                            {/* Total Predictions */}
                            <div className="bg-white p-6 rounded-2xl shadow-lg text-center transform hover:scale-105 transition">
                                <Activity className="mx-auto w-8 h-8 text-green-600" />
                                <h2 className="text-lg font-semibold text-gray-700 mt-2">
                                    Total Predictions
                                </h2>
                                <p className="text-3xl font-bold text-green-600 mt-2">
                                    {predictions.length}
                                </p>
                            </div>

                            {/* Last Prediction */}
                            <div className="bg-white p-6 rounded-2xl shadow-lg text-center transform hover:scale-105 transition">
                                <Clock className="mx-auto w-8 h-8 text-blue-600" />
                                <h2 className="text-lg font-semibold text-gray-700 mt-2">
                                    Last Prediction
                                </h2>
                                {predictions.length > 0 ? (
                                    <>
                                        <p className="mt-2 text-green-700 font-medium">
                                            {
                                                predictions[predictions.length - 1]
                                                    .disease_prediction
                                            }{" "}
                                            (
                                            {(
                                                predictions[predictions.length - 1]
                                                    .confidence * 100
                                            ).toFixed(2)}
                                            %)
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(
                                                predictions[predictions.length - 1]
                                                    .created_at
                                            ).toLocaleString()}
                                        </p>
                                    </>
                                ) : (
                                    <p className="mt-2 text-gray-500">
                                        No predictions yet
                                    </p>
                                )}
                            </div>

                            {/* Most Frequent Disease */}
                            <div className="bg-white p-6 rounded-2xl shadow-lg text-center transform hover:scale-105 transition">
                                <BarChart3 className="mx-auto w-8 h-8 text-purple-600" />
                                <h2 className="text-lg font-semibold text-gray-700 mt-2">
                                    Most Frequent Disease
                                </h2>
                                <p className="mt-2 text-green-700 font-medium">
                                    {mostFrequentDisease()}
                                </p>
                            </div>
                        </div>

                        {/* Disease Distribution Chart */}
                        {diseaseData.length > 0 && (
                            <div className="bg-white p-6 rounded-2xl shadow-lg mt-10">
                                <h2 className="text-xl font-semibold text-gray-700 text-center mb-4">
                                    📊 Disease Distribution
                                </h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={diseaseData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={120}
                                            dataKey="value"
                                        >
                                            {diseaseData.map((_, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        COLORS[index % COLORS.length]
                                                    }
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Recent Predictions Table */}
                        {predictions.length > 0 && (
                            <div className="bg-white p-6 rounded-2xl shadow-lg mt-10">
                                <h2 className="text-xl font-semibold text-gray-700 text-center mb-4">
                                    📝 Recent Predictions
                                </h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead>
                                            <tr className="bg-green-100 text-gray-700 uppercase text-xs">
                                                <th className="px-4 py-3">Filename</th>
                                                <th className="px-4 py-3">Prediction</th>
                                                <th className="px-4 py-3">Confidence</th>
                                                <th className="px-4 py-3">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {predictions
                                                .slice(-5) // last 5
                                                .reverse()
                                                .map((p) => (
                                                    <tr
                                                        key={p.prediction_id}
                                                        className="border-b last:border-0 hover:bg-green-50"
                                                    >
                                                        <td className="px-4 py-3 font-medium text-gray-800">
                                                            {p.filename}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="px-2 py-1 text-xs font-semibold rounded-lg bg-green-100 text-green-700">
                                                                {p.disease_prediction}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-green-600 h-2 rounded-full"
                                                                    style={{
                                                                        width: `${(
                                                                            p.confidence *
                                                                            100
                                                                        ).toFixed(0)}%`,
                                                                    }}
                                                                ></div>
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {(
                                                                    p.confidence * 100
                                                                ).toFixed(1)}
                                                                %
                                                            </p>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600">
                                                            {new Date(
                                                                p.created_at
                                                            ).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="mt-10 flex justify-center gap-6">
                            <Link
                                to="/predict"
                                className="px-6 py-3 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 transition"
                            >
                                🔍 Make Prediction
                            </Link>
                            <Link
                                to="/history"
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
                            >
                                📜 View History
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}