import axios from "axios";

/*
    Axios instance used by the HustleHub+ frontend
    to communicate with the Express backend.
*/
const api = axios.create({
    baseURL: "https://localhost:3000/api",
    headers: {
        "Content-Type": "application/json"
    }
});

/*
    Add the JWT token to protected API requests
    when a user is logged in.
*/
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;