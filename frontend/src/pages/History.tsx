// import { useEffect, useState, useMemo } from "react";
// import API from "../api/axios";
// import { AxiosError } from "axios";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import Navbar from "../components/Navbar";
// import { Search } from "lucide-react";

// interface HistoryEntry {
//     prediction_id: number;
//     filename: string;
//     disease_prediction: string;
//     created_at: string;
// }

// function History() {
//     const [history, setHistory] = useState<HistoryEntry[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     // 🔎 search & filter
//     const [search, setSearch] = useState("");
//     const [filterDisease, setFilterDisease] = useState("All");

//     // 📜 pagination
//     const [currentPage, setCurrentPage] = useState(1);
//     const itemsPerPage = 5;

//     useEffect(() => {
//         const fetchHistory = async () => {
//             try {
//                 const response = await API.get<HistoryEntry[]>("/plant/history");
//                 setHistory(response.data);
//             } catch (err: unknown) {
//                 if (err instanceof AxiosError) {
//                     setError(
//                         err.response?.data?.detail ||
//                         err.response?.data?.message ||
//                         "Failed to load history."
//                     );
//                 } else if (err instanceof Error) {
//                     setError(err.message);
//                 } else {
//                     setError("An unknown error occurred.");
//                 }
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchHistory();
//     }, []);

//     const mostFrequentDisease = () => {
//         if (history.length === 0) return "—";
//         const countMap: Record<string, number> = {};
//         history.forEach((h) => {
//             countMap[h.disease_prediction] =
//                 (countMap[h.disease_prediction] || 0) + 1;
//         });
//         return Object.entries(countMap).sort((a, b) => b[1] - a[1])[0][0];
//     };

//     // 🔎 Filter + Search logic
//     const filteredHistory = useMemo(() => {
//         return history.filter((entry) => {
//             const matchesSearch =
//                 entry.filename.toLowerCase().includes(search.toLowerCase()) ||
//                 entry.disease_prediction.toLowerCase().includes(search.toLowerCase());

//             const matchesFilter =
//                 filterDisease === "All" || entry.disease_prediction === filterDisease;

//             return matchesSearch && matchesFilter;
//         });
//     }, [history, search, filterDisease]);

//     // 📜 Pagination logic
//     const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
//     const paginatedHistory = filteredHistory.slice(
//         (currentPage - 1) * itemsPerPage,
//         currentPage * itemsPerPage
//     );

//     const uniqueDiseases = Array.from(
//         new Set(history.map((h) => h.disease_prediction))
//     );

//     const downloadCSV = () => {
//         if (history.length === 0) return;

//         const headers = ["ID", "Filename", "Disease", "Confidence (%)", "Date"];
//         const rows = history.map((entry) => [
//             entry.prediction_id,
//             entry.filename,
//             entry.disease_prediction,
//             entry.confidence.toFixed(2),
//             new Date(entry.created_at).toLocaleString(),
//         ]);

//         const csvContent =
//             [headers, ...rows]
//                 .map((row) => row.map((cell) => `"${cell}"`).join(","))
//                 .join("\n");

//         const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//         const url = URL.createObjectURL(blob);

//         const link = document.createElement("a");
//         link.href = url;
//         link.setAttribute("download", "prediction_history.csv");
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//     };

//     const downloadPDF = () => {
//         if (history.length === 0) return;

//         const doc = new jsPDF();
//         doc.setFontSize(18);
//         doc.text("🌱 Plant Disease Prediction Report", 14, 20);

//         doc.setFontSize(12);
//         doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

//         doc.setFontSize(14);
//         doc.text("Summary:", 14, 45);

//         doc.setFontSize(12);
//         doc.text(`• Total Predictions: ${history.length}`, 14, 55);
//         doc.text(`• Most Frequent Disease: ${mostFrequentDisease()}`, 14, 65);

//         const tableColumn = ["#", "Filename", "Disease", "Confidence (%)", "Date"];
//         const tableRows = history.map((entry, index) => [
//             index + 1,
//             entry.filename,
//             entry.disease_prediction,
//             entry.confidence.toFixed(2),
//             new Date(entry.created_at).toLocaleString(),
//         ]);

//         autoTable(doc, {
//             startY: 75,
//             head: [tableColumn],
//             body: tableRows,
//         });

//         doc.save("prediction_report.pdf");
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
//             <Navbar />

//             <div className="max-w-5xl mx-auto p-6">
//                 {/* Page Header */}
//                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
//                     <h1 className="text-3xl font-bold text-green-700">
//                         📜 Prediction History
//                     </h1>
//                     {history.length > 0 && (
//                         <div className="flex gap-3">
//                             <button
//                                 onClick={downloadCSV}
//                                 className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
//                             >
//                                 ⬇️ Export CSV
//                             </button>
//                             <button
//                                 onClick={downloadPDF}
//                                 className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
//                             >
//                                 📄 Export PDF
//                             </button>
//                         </div>
//                     )}
//                 </div>

//                 {/* Search & Filter */}
//                 <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
//                     <div className="relative w-full md:w-1/2">
//                         <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
//                         <input
//                             type="text"
//                             placeholder="Search by filename or disease..."
//                             value={search}
//                             onChange={(e) => setSearch(e.target.value)}
//                             className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500"
//                         />
//                     </div>

//                     <label className="sr-only" htmlFor="disease-filter">
//                         Filter by disease
//                     </label>
//                     <select
//                         id="disease-filter"
//                         value={filterDisease}
//                         onChange={(e) => setFilterDisease(e.target.value)}
//                         className="px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500"
//                     >
//                         <option value="All">All Diseases</option>
//                         {uniqueDiseases.map((disease) => (
//                             <option key={disease} value={disease}>
//                                 {disease}
//                             </option>
//                         ))}
//                     </select>

//                 </div>

//                 {loading && <p className="text-gray-500 text-center">Loading...</p>}
//                 {error && <p className="text-red-500 text-center">{error}</p>}

//                 {!loading && !error && filteredHistory.length === 0 && (
//                     <p className="text-gray-500 text-center">
//                         No predictions match your search/filter.
//                     </p>
//                 )}

//                 {!loading && !error && filteredHistory.length > 0 && (
//                     <>
//                         {/* Table */}
//                         <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
//                             <table className="w-full text-sm text-left border-collapse">
//                                 <thead>
//                                     <tr className="bg-green-100 text-gray-700 uppercase text-xs">
//                                         <th className="px-4 py-3">#</th>
//                                         <th className="px-4 py-3">Filename</th>
//                                         <th className="px-4 py-3">Disease</th>
//                                         <th className="px-4 py-3">Confidence</th>
//                                         <th className="px-4 py-3">Date</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {paginatedHistory.map((entry, index) => (
//                                         <tr
//                                             key={entry.prediction_id}
//                                             className="border-b last:border-0 hover:bg-green-50"
//                                         >
//                                             <td className="px-4 py-3">
//                                                 {(currentPage - 1) * itemsPerPage + index + 1}
//                                             </td>
//                                             <td className="px-4 py-3 font-medium text-gray-800">
//                                                 {entry.filename}
//                                             </td>
//                                             <td className="px-4 py-3">
//                                                 <span className="px-2 py-1 text-xs font-semibold rounded-lg bg-green-100 text-green-700">
//                                                     {entry.disease_prediction}
//                                                 </span>
//                                             </td>
//                                             <td className="px-4 py-3">
//                                                 <div className="w-full bg-gray-200 rounded-full h-2">
//                                                     <div
//                                                         className="bg-green-600 h-2 rounded-full"
//                                                         style={{
//                                                             width: `${(entry.confidence * 100).toFixed(0)}%`,
//                                                         }}
//                                                     ></div>
//                                                 </div>
//                                                 <p className="text-xs text-gray-500 mt-1">
//                                                     {(entry.confidence * 100).toFixed(1)}%
//                                                 </p>
//                                             </td>
//                                             <td className="px-4 py-3 text-gray-600">
//                                                 {new Date(entry.created_at).toLocaleString()}
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>

//                         {/* Pagination */}
//                         <div className="flex justify-center items-center gap-4 mt-6">
//                             <button
//                                 disabled={currentPage === 1}
//                                 onClick={() => setCurrentPage((p) => p - 1)}
//                                 className="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50"
//                             >
//                                 ⬅ Prev
//                             </button>
//                             <span className="text-gray-700 font-medium">
//                                 Page {currentPage} of {totalPages}
//                             </span>
//                             <button
//                                 disabled={currentPage === totalPages}
//                                 onClick={() => setCurrentPage((p) => p + 1)}
//                                 className="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50"
//                             >
//                                 Next ➡
//                             </button>
//                         </div>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default History;





import { useEffect, useState } from "react";
import API from "../api/axios";
import { AxiosError } from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Navbar from "../components/Navbar";
import { Activity, BarChart3, Search as SearchIcon } from "lucide-react";

interface HistoryEntry {
    prediction_id: number;
    filename: string;
    disease_prediction: string;
    confidence: number;
    created_at: string;
}

function History() {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 🔍 Search + Filter state
    const [search, setSearch] = useState("");
    const [filterDisease, setFilterDisease] = useState("All");

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await API.get<HistoryEntry[]>("/plant/history");
                setHistory(response.data);
            } catch (err: unknown) {
                if (err instanceof AxiosError) {
                    setError(
                        err.response?.data?.detail ||
                        err.response?.data?.message ||
                        "Failed to load history."
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
        if (history.length === 0) return "—";
        const countMap: Record<string, number> = {};
        history.forEach((h) => {
            countMap[h.disease_prediction] =
                (countMap[h.disease_prediction] || 0) + 1;
        });
        return Object.entries(countMap).sort((a, b) => b[1] - a[1])[0][0];
    };

    // Unique diseases for dropdown
    const uniqueDiseases = Array.from(
        new Set(history.map((h) => h.disease_prediction))
    );

    // Filtered results
    const filteredHistory = history.filter((entry) => {
        const matchesSearch =
            entry.filename.toLowerCase().includes(search.toLowerCase()) ||
            entry.disease_prediction.toLowerCase().includes(search.toLowerCase());
        const matchesFilter =
            filterDisease === "All" || entry.disease_prediction === filterDisease;
        return matchesSearch && matchesFilter;
    });

    // CSV Export
    const downloadCSV = () => {
        if (history.length === 0) return;

        const headers = ["ID", "Filename", "Disease", "Confidence (%)", "Date"];
        const rows = history.map((entry) => [
            entry.prediction_id,
            entry.filename,
            entry.disease_prediction,
            entry.confidence.toFixed(2),
            new Date(entry.created_at).toLocaleString(),
        ]);

        const csvContent =
            [headers, ...rows]
                .map((row) => row.map((cell) => `"${cell}"`).join(","))
                .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "prediction_history.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // PDF Export
    const downloadPDF = () => {
        if (history.length === 0) return;

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("🌱 Plant Disease Prediction Report", 14, 20);

        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

        doc.setFontSize(14);
        doc.text("Summary:", 14, 45);

        doc.setFontSize(12);
        doc.text(`• Total Predictions: ${history.length}`, 14, 55);
        doc.text(`• Most Frequent Disease: ${mostFrequentDisease()}`, 14, 65);

        const tableColumn = ["#", "Filename", "Disease", "Confidence (%)", "Date"];
        const tableRows = history.map((entry, index) => [
            index + 1,
            entry.filename,
            entry.disease_prediction,
            entry.confidence.toFixed(2),
            new Date(entry.created_at).toLocaleString(),
        ]);

        autoTable(doc, {
            startY: 75,
            head: [tableColumn],
            body: tableRows,
        });

        doc.save("prediction_report.pdf");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
            <Navbar />

            <div className="max-w-5xl mx-auto p-6">
                {/* Page Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-green-700">
                        📜 Prediction History
                    </h1>
                    {history.length > 0 && (
                        <div className="flex gap-3">
                            <button
                                onClick={downloadCSV}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
                            >
                                ⬇️ Export CSV
                            </button>
                            <button
                                onClick={downloadPDF}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                            >
                                📄 Export PDF
                            </button>
                        </div>
                    )}
                </div>

                {loading && <p className="text-gray-500 text-center">Loading...</p>}
                {error && <p className="text-red-500 text-center">{error}</p>}

                {!loading && !error && history.length === 0 && (
                    <p className="text-gray-500 text-center">
                        No predictions yet. Try uploading an image on{" "}
                        <span className="text-green-600 font-semibold">Predict</span> page.
                    </p>
                )}

                {!loading && !error && history.length > 0 && (
                    <>
                        {/* 🔍 Search & Filter */}
                        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                            <div className="relative w-full md:w-1/2">
                                <SearchIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <label htmlFor="search" className="sr-only">
                                    Search predictions
                                </label>
                                <input
                                    id="search"
                                    type="text"
                                    placeholder="Search by filename or disease..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div className="w-full md:w-1/3">
                                <label htmlFor="disease-filter" className="sr-only">
                                    Filter by disease
                                </label>
                                <select
                                    id="disease-filter"
                                    value={filterDisease}
                                    onChange={(e) => setFilterDisease(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="All">All Diseases</option>
                                    {uniqueDiseases.map((disease) => (
                                        <option key={disease} value={disease}>
                                            {disease}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                                <Activity className="mx-auto w-8 h-8 text-green-600" />
                                <h2 className="text-lg font-semibold text-gray-700 mt-2">
                                    Total Predictions
                                </h2>
                                <p className="text-3xl font-bold text-green-600 mt-2">
                                    {filteredHistory.length}
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                                <BarChart3 className="mx-auto w-8 h-8 text-purple-600" />
                                <h2 className="text-lg font-semibold text-gray-700 mt-2">
                                    Most Frequent Disease
                                </h2>
                                <p className="mt-2 text-green-700 font-medium">
                                    {mostFrequentDisease()}
                                </p>
                            </div>
                        </div>

                        {/* History Table */}
                        <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead>
                                    <tr className="bg-green-100 text-gray-700 uppercase text-xs">
                                        <th className="px-4 py-3">#</th>
                                        <th className="px-4 py-3">Filename</th>
                                        <th className="px-4 py-3">Disease</th>
                                        <th className="px-4 py-3">Confidence</th>
                                        <th className="px-4 py-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredHistory.map((entry, index) => (
                                        <tr
                                            key={entry.prediction_id}
                                            className="border-b last:border-0 hover:bg-green-50"
                                        >
                                            <td className="px-4 py-3">{index + 1}</td>
                                            <td className="px-4 py-3 font-medium text-gray-800">
                                                {entry.filename}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 text-xs font-semibold rounded-lg bg-green-100 text-green-700">
                                                    {entry.disease_prediction}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-green-600 h-2 rounded-full"
                                                        style={{
                                                            width: `${(entry.confidence * 100).toFixed(0)}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {(entry.confidence * 100).toFixed(1)}%
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {new Date(entry.created_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default History;
