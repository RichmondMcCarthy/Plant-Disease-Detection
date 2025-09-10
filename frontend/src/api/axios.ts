import axios, { AxiosError } from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000",
    withCredentials: true,
});

// Request interceptor → attach access token
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Flag to avoid infinite loops
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Helper: run all subscribers when token is refreshed
const onRefreshed = (token: string) => {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
};

// Response interceptor → auto refresh token
API.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config;

        // If 401 (Unauthorized) and not already retrying
        if (error.response?.status === 401 && originalRequest && !isRefreshing) {
            isRefreshing = true;

            try {
                const { data } = await axios.post(
                    "http://127.0.0.1:8000/refresh",
                    {},
                    { withCredentials: true }
                );

                const newToken = data.result.access_token;
                localStorage.setItem("token", newToken);

                isRefreshing = false;
                onRefreshed(newToken);

                if (originalRequest.headers) {
                    originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                }

                return API(originalRequest); // retry request
            } catch (refreshError) {
                isRefreshing = false;
                localStorage.removeItem("token");
                window.location.href = "/login"; // redirect to login
                return Promise.reject(refreshError);
            }
        }

        // If already refreshing → queue requests until done
        if (error.response?.status === 401 && isRefreshing) {
            return new Promise((resolve) => {
                refreshSubscribers.push((token: string) => {
                    if (originalRequest?.headers) {
                        originalRequest.headers["Authorization"] = `Bearer ${token}`;
                    }
                    resolve(API(originalRequest!));
                });
            });
        }

        return Promise.reject(error);
    }
);

export default API;






// import axios from "axios";

// const API = axios.create({
//     baseURL: "http://127.0.0.1:8000",
// });

// // Attach token automatically if available
// API.interceptors.request.use((config) => {
//     const token = localStorage.getItem("token");
//     if (token && config.headers) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
// });

// export default API;
