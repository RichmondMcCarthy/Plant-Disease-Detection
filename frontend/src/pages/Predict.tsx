// import { useState } from "react";
// import API from "../api/axios";
// import { AxiosError } from "axios";
// import Navbar from "../components/Navbar";

// interface PredictionResult {
//     prediction_id: number;
//     disease_prediction: string;
//     confidence: string;
//     note?: string;
// }

// interface ApiResponse<T> {
//     code: string;
//     status: string;
//     message: string;
//     result: T;
// }

// function Predict() {
//     const [file, setFile] = useState<File | null>(null);
//     const [preview, setPreview] = useState<string | null>(null);
//     const [loading, setLoading] = useState(false);
//     const [result, setResult] = useState<PredictionResult | null>(null);
//     const [error, setError] = useState<string | null>(null);

//     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         if (e.target.files && e.target.files[0]) {
//             const selectedFile = e.target.files[0];
//             setFile(selectedFile);
//             setPreview(URL.createObjectURL(selectedFile));
//             setResult(null);
//             setError(null);
//         }
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!file) {
//             setError("Please upload an image first.");
//             return;
//         }

//         setLoading(true);
//         setError(null);

//         try {
//             const formData = new FormData();
//             formData.append("file", file);

//             const response = await API.post<ApiResponse<PredictionResult>>(
//                 "/plant/predict",
//                 formData,
//                 {
//                     headers: { "Content-Type": "multipart/form-data" },
//                 }
//             );

//             setResult(response.data.result || response.data);
//         } catch (err: unknown) {
//             if (err instanceof AxiosError) {
//                 setError(
//                     err.response?.data?.detail ||
//                     err.response?.data?.message ||
//                     "Prediction failed."
//                 );
//             } else if (err instanceof Error) {
//                 setError(err.message);
//             } else {
//                 setError("An unknown error occurred.");
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-green-50">
//             <Navbar />

//             <div className="flex flex-col items-center justify-center px-4 py-10">
//                 {/* Hero Section */}
//                 <div className="text-center mb-8">
//                     <h1 className="text-3xl font-bold text-green-700">
//                         🌱 Plant Disease Detection
//                     </h1>
//                     <p className="text-gray-600 mt-2">
//                         Upload a plant leaf image to detect possible diseases with AI.
//                     </p>
//                 </div>

//                 {/* Upload Form */}
//                 <form
//                     onSubmit={handleSubmit}
//                     className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-lg text-center"
//                 >
//                     <label
//                         htmlFor="plant-image"
//                         className="block mb-3 text-lg font-semibold text-gray-700"
//                     >
//                         Upload Plant Image
//                     </label>

//                     <div
//                         className="border-2 border-dashed border-green-400 rounded-lg p-6 cursor-pointer hover:bg-green-50 transition"
//                         onClick={() => document.getElementById("plant-image")?.click()}
//                     >
//                         {preview ? (
//                             <img
//                                 src={preview}
//                                 alt="Preview"
//                                 className="w-full h-64 object-cover rounded-lg"
//                             />
//                         ) : (
//                             <p className="text-gray-500">Drag & Drop or Click to Upload</p>
//                         )}
//                     </div>

//                     <input
//                         id="plant-image"
//                         type="file"
//                         accept="image/*"
//                         onChange={handleFileChange}
//                         className="hidden"
//                     />

//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="mt-6 w-full bg-green-600 text-white py-3 px-4 rounded-xl shadow hover:bg-green-700 disabled:opacity-50 flex justify-center items-center gap-2"
//                     >
//                         {loading && (
//                             <span className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></span>
//                         )}
//                         {loading ? "Analyzing..." : "🌱 Upload & Predict"}
//                     </button>
//                 </form>

//                 {/* Error Message */}
//                 {error && (
//                     <div className="mt-6 text-red-600 font-semibold bg-red-50 px-4 py-2 rounded-lg shadow">
//                         {error}
//                     </div>
//                 )}

//                 {/* Prediction Result */}
//                 {result && (
//                     <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg w-full max-w-lg animate-fade-in">
//                         <h2 className="text-xl font-bold mb-4 text-center text-green-700">
//                             ✅ Prediction Result
//                         </h2>
//                         <p className="mb-2">
//                             <strong>Disease:</strong>{" "}
//                             <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg font-medium">
//                                 {result.disease_prediction}
//                             </span>
//                         </p>
//                         <p className="mb-2">
//                             <strong>Confidence:</strong>{" "}
//                             {(parseFloat(result.confidence) * 100).toFixed(1)}%
//                         </p>
//                         <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
//                             <div
//                                 className="bg-green-600 h-2 rounded-full"
//                                 style={{
//                                     width: `${(parseFloat(result.confidence) * 100).toFixed(0)}%`,
//                                 }}
//                             />
//                         </div>
//                         <p className="mt-3 text-sm text-gray-600">
//                             <strong>Note:</strong> {result.note || "No additional notes."}
//                         </p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default Predict;




import { useState } from "react";
import API from "../api/axios";
import { AxiosError } from "axios";
import Navbar from "../components/Navbar";

interface PredictionResult {
    prediction_id: number;
    disease_prediction: string;
    confidence: string;
    note?: string;
}

interface ApiResponse<T> {
    code: string;
    status: string;
    message: string;
    result: T;
}

function Predict() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PredictionResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setResult(null);
            setError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError("Please upload an image first.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await API.post<ApiResponse<PredictionResult>>(
                "/plant/predict",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            setResult(response.data.result || response.data);
        } catch (err: unknown) {
            if (err instanceof AxiosError) {
                setError(
                    err.response?.data?.detail ||
                    err.response?.data?.message ||
                    "Prediction failed."
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

    return (
        <div className="min-h-screen bg-green-50">
            <Navbar />

            <div className="flex flex-col items-center justify-center px-4 py-10">
                {/* Hero Section */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-green-700">
                        🌱 Plant Disease Detection
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Upload a plant leaf image to detect possible diseases with AI.
                    </p>
                </div>

                {/* Upload Form */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-lg text-center"
                >
                    <label
                        htmlFor="plant-image"
                        className="block mb-3 text-lg font-semibold text-gray-700"
                    >
                        Upload Plant Image
                    </label>

                    <div
                        className="border-2 border-dashed border-green-400 rounded-lg p-6 cursor-pointer hover:bg-green-50 transition"
                        onClick={() => document.getElementById("plant-image")?.click()}
                    >
                        {preview ? (
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-64 object-cover rounded-lg transition-transform duration-300 hover:scale-105"
                            />
                        ) : (
                            <p className="text-gray-500">Drag & Drop or Click to Upload</p>
                        )}
                    </div>

                    <input
                        id="plant-image"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-6 w-full bg-green-600 text-white py-3 px-4 rounded-xl shadow hover:bg-green-700 disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {loading && (
                            <span className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></span>
                        )}
                        {loading ? "Analyzing..." : "🌱 Upload & Predict"}
                    </button>
                </form>

                {/* Error Message */}
                {error && (
                    <div className="mt-6 text-red-600 font-semibold bg-red-50 px-4 py-2 rounded-lg shadow">
                        {error}
                    </div>
                )}

                {/* Prediction Result */}
                {result && (
                    <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg w-full max-w-lg 
                          transform transition duration-500 ease-out scale-95 opacity-0
                          animate-result-fade-in">
                        <h2 className="text-xl font-bold mb-4 text-center text-green-700">
                            ✅ Prediction Result
                        </h2>
                        <p className="mb-2">
                            <strong>Disease:</strong>{" "}
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg font-medium">
                                {result.disease_prediction}
                            </span>
                        </p>
                        <p className="mb-2">
                            <strong>Confidence:</strong>{" "}
                            {(parseFloat(result.confidence) * 100).toFixed(1)}%
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{
                                    width: `${(parseFloat(result.confidence) * 100).toFixed(0)}%`,
                                }}
                            />
                        </div>
                        <p className="mt-3 text-sm text-gray-600">
                            <strong>Note:</strong> {result.note || "No additional notes."}
                        </p>
                    </div>
                )}
            </div>

            {/* Tailwind Keyframes for fade-in + pop */}
            <style>
                {`
          @keyframes resultFadeIn {
            0% { opacity: 0; transform: scale(0.95); }
            100% { opacity: 1; transform: scale(1); }
          }
          .animate-result-fade-in {
            animation: resultFadeIn 0.5s forwards;
          }
        `}
            </style>
        </div>
    );
}

export default Predict;
