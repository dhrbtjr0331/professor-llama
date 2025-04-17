import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

export const uploadPDF = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await axios.post("http://localhost:8000/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data.file_path;
    } catch (error) {
        console.error("Upload failed:", error?.response?.data || error.message);
        throw error; // re-throw so it hits the alert
    }
};

export const summarizeURL = async (url) => {
    const response = await axios.post(`${BASE_URL}/summarize_url`, {
        url,
    });
    return response.data;
};

export const summarizePDF = async (filePath) => {
    const response = await axios.post(`${BASE_URL}/summarize`, {
        file_path: filePath,
    });
    return response.data;
};

export const chatWithLlama = async (session_id, message) => {
    const response = await axios.post(`${BASE_URL}/chat`, {
        session_id,
        message,
    });
    return response.data;
};
