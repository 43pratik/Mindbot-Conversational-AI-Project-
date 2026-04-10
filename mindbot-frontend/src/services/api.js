// src/services/api.js
const API_BASE = "http://127.0.0.1:8000/api";

export const uploadDocument = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
    });
    if (!response.ok) throw new Error("Upload failed");
    return response.json();
};

export const sendChatMessage = async (sessionId, query) => {
    const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, query })
    });
    if (!response.ok) throw new Error("Chat failed");
    return response.json();
};

export const sendVoiceMessage = async (audioBlob, sessionId) => {
    const formData = new FormData();
    // We package the audio blob as a standard mp3 file
    formData.append("file", audioBlob, "recording.mp3");
    formData.append("session_id", sessionId);

    const response = await fetch(`${API_BASE}/voice`, {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) throw new Error("Voice processing failed");
    return response.json();
};
export const sendVisionMessage = async (imageFile, query, sessionId) => {
    const formData = new FormData();
    formData.append("file", imageFile);
    // If user doesn't type a query, provide a default one
    formData.append("query", query || "Describe this image in detail.");
    formData.append("session_id", sessionId);

    const response = await fetch(`${API_BASE}/vision`, {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) throw new Error("Vision processing failed");
    return response.json();
};