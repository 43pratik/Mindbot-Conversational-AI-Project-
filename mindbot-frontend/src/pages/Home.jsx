import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// 🌟 MOCK API FUNCTIONS (We will replace these with real API calls later!)
// These just mimic a real backend so we can build the frontend logic today.
const mockApiUpload = async (file) => {
    // Mimic 1.5 seconds of processing time
    await new Promise(res => setTimeout(res, 1500)); 
    return { success: true, message: `Vector DB updated with: ${file.name}`, filename: file.name };
};

export default function Home() {
  // 1. CHAT LOGIC STATE
  const [messages, setMessages] = useState([]); // Wiped all hard-coded messages.
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false); // Bouncing dots when bot thinks

  // 2. RECENT CHAT STATE
  const [recentChats, setRecentChats] = useState([]); // Wiped hard-coded chats.

  // 3. DOCUMENT MANAGEMENT STATE
  const [availableDocuments, setAvailableDocuments] = useState([]); // Wiped "No learned doc"
  const [selectedFile, setSelectedFile] = useState(null); // File user picked from computer
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });

  // Handle Send Message (Chat logic)
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // 1. Add User Message to screen immediately
    const userMsg = { isUser: true, text: inputText };
    setMessages(prev => [...prev, userMsg]);
    
    // 2. Clear input
    setInputText("");

    // 3. Create a recent chat entry if this is the first message of a session
    if (messages.length === 0) {
      const chatSummary = inputText.substring(0, 30) + "..."; // First 30 chars
      setRecentChats(prev => [chatSummary, ...prev]);
    }

    // 4. Mimic bot thinking (replace this with a real API call later!)
    setIsThinking(true);
    await new Promise(res => setTimeout(res, 1200)); 
    
    // 5. Add Bot Response
    const botResponseText = `🤖 You just asked me about "${inputText}". If you upload a PDF, I can use that to provide a real answer! (This is a placeholder response).`;
    setMessages(prev => [...prev, { isUser: false, text: botResponseText }]);
    setIsThinking(false);
  };

  // Handle File Input Selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadStatus({ type: '', message: '' }); // Clear old messages
    }
  };

  // Handle Document Upload (RAG logic)
  const handleUploadDocument = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadStatus({ type: 'info', message: 'Learning document...' });

    try {
      // 🌟 Real upload call (will replace mock later)
      const data = await mockApiUpload(selectedFile); 
      
      // 1. Turn status message green on success
      setUploadStatus({ type: 'success', message: `✅ Learning successful: ${data.filename}` });
      
      // 2. Dynamically add the new PDF to the list on the left!
      setAvailableDocuments(prev => [...prev, data.filename]); 
      
      // 3. Reset the file picker
      setSelectedFile(null); 
    } catch (error) {
      // Turn status message red on failure
      setUploadStatus({ type: 'error', message: '❌ Upload failed. Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    // Same deep dark background
    <div className="flex h-screen w-full bg-[#0a0a16] text-gray-200 font-sans overflow-hidden bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-[#1f1a3a] via-[#0a0a16] to-[#05050a]">
      
      {/* ⬅️ LEFT SIDEBAR (Context Console) */}
      <aside className="w-87.5 m-4 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="p-6 flex flex-col items-center justify-center border-b border-white/5">
          <div className="text-5xl mb-2 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]">🧠</div>
          <h1 className="text-2xl font-bold text-cyan-400 tracking-wider drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">MindBot</h1>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
          
          {/* Document Upload Area (Making this functional) */}
          <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
            <div className="flex justify-center mb-3">
              <span className="text-3xl text-gray-400">📄</span>
            </div>
            <h2 className="text-sm font-semibold text-center text-gray-300 mb-4">Learn Document</h2>
            
            {/* Functional File Picker */}
            <div 
              className="bg-black/40 rounded-lg p-2 mb-3 text-xs text-gray-400 border border-white/5 flex items-center justify-between cursor-pointer hover:bg-black/60 transition"
              onClick={() => document.getElementById('fileUploadInput').click()}
            >
              <span className="bg-gray-700 text-white px-2 py-1 rounded">Choose File</span>
              <span className="truncate pl-2">
                {selectedFile ? selectedFile.name : "No file selected"}
              </span>
            </div>
            {/* Hidden Input File Element */}
            <input 
                id="fileUploadInput" 
                type="file" 
                accept=".pdf" 
                onChange={handleFileChange} 
                className="hidden" 
            />

            <button 
                onClick={handleUploadDocument}
                disabled={isUploading || !selectedFile}
                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] ${
                    isUploading || !selectedFile 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed shadow-none' 
                    : 'bg-cyan-400 hover:bg-cyan-300 text-gray-900'
                }`}
            >
              {isUploading ? "Learning..." : "Upload PDF"}
            </button>

            {/* Functional Upload Status Message */}
            {uploadStatus.message && (
                <p className={`text-center text-xs mt-3 font-medium ${
                    uploadStatus.type === 'success' ? 'text-green-400' : 
                    uploadStatus.type === 'error' ? 'text-red-400' : 'text-primary'
                }`}>
                  {uploadStatus.message}
                </p>
            )}
          </div>

          {/* New Dynamically Generated Learned PDFs List! */}
          {availableDocuments.length > 0 && (
            <div className="bg-black/20 rounded-2xl p-4 border border-white/5 flex flex-col gap-3">
              <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">Knowledge Sources</h2>
              {availableDocuments.map((docName, index) => (
                 <div key={index} className="flex items-center justify-between bg-black/40 border border-white/5 rounded-lg p-2.5 shadow-sm">
                   <div className="flex items-center gap-2 font-semibold text-gray-300 text-xs">
                     <span className="text-sm">📄</span> {docName}
                   </div>
                   <div className="flex gap-1 pr-1">
                     <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.6)]"></span>
                   </div>
                 </div>
              ))}
            </div>
          )}

          {/* Recent Chats (Wiping hard-coded chats) */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-sm font-semibold text-gray-300">Recent Chats</h2>
              <button 
                onClick={() => setMessages([])} // Clear screen on New Chat
                className="text-xs text-cyan-400 border border-cyan-400/30 px-2 py-1 rounded-md hover:bg-cyan-400/10 transition"
              >
                 + New Chat
              </button>
            </div>
            
            {/* New Dynamically Generated Chat Sessions List! */}
            <div className="flex flex-col gap-1">
              {recentChats.length === 0 ? (
                 <p className="text-center text-xs text-gray-600 italic py-4">No recent chats</p>
              ) : (
                recentChats.map((summary, index) => (
                    <div key={index} className="text-xs text-gray-400 hover:text-gray-200 hover:bg-white/5 px-3 py-2 rounded-lg cursor-pointer transition truncate">
                       💬 {summary}
                    </div>
                ))
              )}
            </div>
          </div>

        </div>
      </aside>

      {/* ➡️ RIGHT ARENA (Main Chat) */}
      <main className="flex-1 flex flex-col relative my-4 mr-4 rounded-3xl bg-black/20 backdrop-blur-sm border border-white/5 shadow-2xl overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 shrink-0 bg-white/5">
          <h2 className="text-sm font-bold tracking-wide text-gray-200">Chatting with MindBot</h2>
          <div className="flex items-center gap-4 text-gray-400">
             <button className="hover:text-cyan-400 transition text-lg">⚙️</button>
             <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">👤</div>
          </div>
        </header>

        {/* Chat Messages Area (Now Dynamic with Empty State!) */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 pb-40">
          
          {messages.length === 0 ? (
              // 🌟 ELEGAN EMPTY CHAT STATE
              <div className="flex-1 flex flex-col items-center justify-center text-center mt-20 text-gray-600 opacity-60">
                 <div className="text-6xl mb-6">🤖</div>
                 <h2 className="text-2xl font-bold mb-3">Welcome to MindBot</h2>
                 <p className="text-sm max-w-md">The chat history is currently empty. Upload a document or ask a general question to get started.</p>
              </div>
          ) : (
             // Render the dynamic message list
             messages.map((msg, index) => (
                <div key={index} className={`flex w-full ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className="flex gap-3 max-w-[80%]">
                    {!msg.isUser && (
                      <div className="w-8 h-8 rounded-full bg-cyan-900/50 border border-cyan-400/30 flex items-center justify-center shrink-0 mt-2">
                        <span className="text-sm drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">🧠</span>
                      </div>
                    )}
                    <div className={`p-4 rounded-2xl ${msg.isUser ? 'bg-transparent border-2 border-cyan-400 text-gray-100 rounded-tr-sm' : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-sm'}`}>
                      {msg.isUser ? (
                        <p className="text-sm">{msg.text}</p>
                      ) : (
                        <div className="prose prose-sm prose-invert max-w-none text-gray-300">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                    {msg.isUser && (
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0 mt-2">👤</div>
                    )}
                  </div>
                </div>
              ))
          )}

          {/* Thinking Indicator */}
          {isThinking && (
              <div className="flex justify-start">
                  <div className="w-8 h-8 rounded-full bg-cyan-900/50 border border-cyan-400/30 flex items-center justify-center shrink-0 mt-2 mr-3">
                      <span className="text-sm drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">🧠</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 text-gray-300 p-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
                      <span className="animate-bounce">●</span>
                      <span className="animate-bounce delay-100">●</span>
                      <span className="animate-bounce delay-200">●</span>
                  </div>
              </div>
          )}
        </div>

        {/* Floating Input Area (Fixing Icons as requested) */}
        <div className="absolute bottom-0 w-full bg-linear-to-t from-[#0a0a16] via-[#0a0a16]/90 to-transparent pt-20 pb-8 px-8 z-10">
          <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-2 shadow-2xl flex items-center gap-2 transition-all hover:border-cyan-400/50">
            
            <div className="flex gap-1 pl-2">
              {/* Corrected Icons 1: Microphone */}
              <button className="text-gray-400 hover:text-cyan-400 p-2 transition">🎙️</button>
              {/* Corrected Icons 2: Image Upload */}
              <button className="text-gray-400 hover:text-cyan-400 p-2 transition">🖼️</button>
            </div>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') handleSendMessage(); }} // Send on enter
              placeholder="Ask MindBot something..."
              className="flex-1 bg-transparent border-none text-gray-200 px-4 py-2 focus:outline-none placeholder-gray-500 text-sm"
            />
            
            <button 
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isThinking}
                className={`text-gray-900 px-6 py-2.5 rounded-2xl text-sm font-bold transition-all mr-1 ${
                    !inputText.trim() || isThinking 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed shadow-none' 
                    : 'bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                }`}
            >
              Send
            </button>
          </div>
        </div>

      </main>
      
    </div>
  );
}