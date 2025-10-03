// This line gets the base URL for your API from an environment variable if it exists,
// otherwise it falls back to your local development server URL.
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default API_URL;