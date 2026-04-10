import React, { useState, useRef } from 'react';

export default function ChatInput({ onSendMessage, onSendVoice, onSendVision, isThinking }) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const fileInputRef = useRef(null); // Reference for the hidden file input

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isThinking) return;

    if (selectedImage) {
      // If an image is attached, trigger the Vision function
      onSendVision(selectedImage, text);
      setSelectedImage(null); // Clear image after sending
      setText('');
    } else if (text.trim()) {
      // Otherwise, just a normal text message
      onSendMessage(text);
      setText('');
    }
  };

  // --- Voice Logic (Same as before) ---
  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder.current = new MediaRecorder(stream);
        audioChunks.current = [];

        mediaRecorder.current.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunks.current.push(e.data);
        };

        mediaRecorder.current.onstop = () => {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/mp3' });
          onSendVoice(audioBlob);
          stream.getTracks().forEach(track => track.stop()); 
        };

        mediaRecorder.current.start();
        setIsRecording(true);
      } catch (err) {
        alert("Microphone access denied.");
      }
    }
  };

  // --- Vision Logic ---
  const handleImageSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-2">
      
      {/* 🖼️ Image Preview Box (Only shows if an image is attached) */}
      {selectedImage && (
        <div className="bg-secondary p-2 rounded-lg flex items-center justify-between border border-primary/50">
          <span className="text-sm text-primary truncate pl-2">
            📎 Attached: {selectedImage.name}
          </span>
          <button 
            onClick={() => setSelectedImage(null)} 
            className="text-gray-400 hover:text-red-400 px-2 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-3 p-2 bg-dark rounded-xl border border-secondary focus-within:border-primary transition-colors">
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleImageSelect} 
          className="hidden" 
        />

        {/* 🖼️ Image Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          disabled={isThinking || isRecording}
          className="p-3 rounded-lg flex items-center justify-center transition-all bg-secondary text-gray-400 hover:text-primary hover:bg-darker disabled:opacity-50"
          title="Attach an Image"
        >
          🖼️
        </button>

        {/* 🎤 Voice Button */}
        <button
          type="button"
          onClick={toggleRecording}
          disabled={isThinking || selectedImage}
          className={`p-3 rounded-lg flex items-center justify-center transition-all ${
            isRecording 
              ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
              : 'bg-secondary text-gray-400 hover:text-primary hover:bg-darker disabled:opacity-50'
          }`}
          title="Record Voice"
        >
          {isRecording ? '⏹️' : '🎙️'}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={isRecording ? "Listening..." : text}
          onChange={(e) => setText(e.target.value)}
          disabled={isThinking || isRecording}
          placeholder={selectedImage ? "Ask something about this image..." : "Ask MindBot something..."}
          className="flex-1 bg-transparent border-none text-white px-4 py-2 focus:outline-none disabled:opacity-50"
        />
        
        {/* Send Button */}
        <button
          type="submit"
          disabled={isThinking || (!text.trim() && !selectedImage) || isRecording}
          className={`px-6 py-2 rounded-lg font-bold transition-all ${
            isThinking || (!text.trim() && !selectedImage) || isRecording
              ? 'bg-secondary text-gray-500 cursor-not-allowed'
              : 'bg-primary text-darker hover:bg-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.3)]'
          }`}
        >
          Send
        </button>
      </form>
    </div>
  );
}