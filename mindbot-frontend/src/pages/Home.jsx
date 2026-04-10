import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Home() {
  const [messages, setMessages] = useState([]); 
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false); 
  const [recentChats, setRecentChats] = useState([]); 
  const [availableDocuments, setAvailableDocuments] = useState([]); 
  const [selectedFile, setSelectedFile] = useState(null); 
  const [isUploading, setIsUploading] = useState(false);
  
  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  const [sessionId] = useState(() => "session-" + Math.random().toString(36).substring(2, 9));

  // NEW: Auto-scroll reference
  const messagesEndRef = useRef(null);

  // NEW: Automatically scroll down whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // NEW: Voice Recording Logic (Speech-to-Text)
  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice input. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsRecording(true);
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setInputText(transcript); // Types your voice into the input box live!
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleImagePick = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreviewUrl(URL.createObjectURL(file)); 
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreviewUrl(null);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && !selectedImage) return;

    const currentText = inputText;
    const currentImgUrl = imagePreviewUrl;
    const hasImage = !!selectedImage;

    setMessages(prev => [...prev, { isUser: true, text: currentText, imageUrl: currentImgUrl }]);
    
    setInputText("");
    clearImage();
    
    if (messages.length === 0) {
      const chatSummary = currentText.substring(0, 30) + "..."; 
      setRecentChats(prev => [chatSummary, ...prev]);
    }

    setIsThinking(true);

    try {
      let response;

      if (!hasImage) {
          response = await fetch("http://localhost:8000/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ session_id: sessionId, query: currentText })
          });
      } else {
          const formData = new FormData();
          formData.append("file", selectedImage);
          if (currentText) formData.append("query", currentText);

          response = await fetch("http://localhost:8000/api/vision", {
              method: "POST",
              body: formData
          });
      }

      if (!response.ok) throw new Error(`Backend Error ${response.status}`);

      const data = await response.json();
      setMessages(prev => [...prev, { isUser: false, text: data.response || "No response received." }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { isUser: false, text: `❌ **Connection Error:** ${error.message}` }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:8000/api/upload", {
          method: "POST",
          body: formData
      });

      if (!response.ok) throw new Error("Upload failed");

      setAvailableDocuments(prev => [...prev, selectedFile.name]); 
      setMessages(prev => [...prev, { 
          isUser: false, 
          text: `✅ I have successfully read and processed **${selectedFile.name}**! What specific questions do you have about this document?` 
      }]);
      setSelectedFile(null); 

    } catch (error) {
      console.error("Upload failed", error);
      setMessages(prev => [...prev, { isUser: false, text: "❌ **Upload Error:** Failed to send PDF to backend." }]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a16] text-gray-200 font-sans overflow-hidden bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-[#1f1a3a] via-[#0a0a16] to-[#05050a]">
      
      <aside className="w-87.5 m-4 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col shadow-2xl relative overflow-hidden">
        <div className="p-6 flex flex-col items-center justify-center border-b border-white/5">
          <div className="text-5xl mb-2 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]">🧠</div>
          <h1 className="text-2xl font-bold text-cyan-400 tracking-wider drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">MindBot</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
          <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
            <div className="flex justify-center mb-3"><span className="text-3xl text-gray-400">📄</span></div>
            <h2 className="text-sm font-semibold text-center text-gray-300 mb-4">Learn Document</h2>
            
            <div 
              className="bg-black/40 rounded-lg p-2 mb-3 text-xs text-gray-400 border border-white/5 flex items-center justify-between cursor-pointer hover:bg-black/60 transition"
              onClick={() => document.getElementById('fileUploadInput').click()}
            >
              <span className="bg-gray-700 text-white px-2 py-1 rounded">Choose File</span>
              <span className="truncate pl-2">{selectedFile ? selectedFile.name : "No file selected"}</span>
            </div>
            <input id="fileUploadInput" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />

            <button 
                onClick={handleUploadDocument}
                disabled={isUploading || !selectedFile}
                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] ${
                    isUploading || !selectedFile ? 'bg-gray-700 text-gray-500 cursor-not-allowed shadow-none' : 'bg-cyan-400 hover:bg-cyan-300 text-gray-900'
                }`}
            >
              {isUploading ? "Learning..." : "Upload PDF"}
            </button>
          </div>

          {availableDocuments.length > 0 && (
            <div className="bg-black/20 rounded-2xl p-4 border border-white/5 flex flex-col gap-3">
              <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">Knowledge Sources</h2>
              {availableDocuments.map((docName, index) => (
                 <div key={index} className="flex items-center justify-between bg-black/40 border border-white/5 rounded-lg p-2.5 shadow-sm">
                   <div className="flex items-center gap-2 font-semibold text-gray-300 text-xs">
                     <span className="text-sm">📄</span> {docName}
                   </div>
                   <div className="flex gap-1 pr-1"><span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.6)]"></span></div>
                 </div>
              ))}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-sm font-semibold text-gray-300">Recent Chats</h2>
              <button onClick={() => setMessages([])} className="text-xs text-cyan-400 border border-cyan-400/30 px-2 py-1 rounded-md hover:bg-cyan-400/10 transition">+ New Chat</button>
            </div>
            <div className="flex flex-col gap-1">
              {recentChats.length === 0 ? (
                 <p className="text-center text-xs text-gray-600 italic py-4">No recent chats</p>
              ) : (
                recentChats.map((summary, index) => (
                    <div key={index} className="text-xs text-gray-400 hover:text-gray-200 hover:bg-white/5 px-3 py-2 rounded-lg cursor-pointer transition truncate">💬 {summary}</div>
                ))
              )}
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative my-4 mr-4 rounded-3xl bg-black/20 backdrop-blur-sm border border-white/5 shadow-2xl overflow-hidden">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 shrink-0 bg-white/5">
          <h2 className="text-sm font-bold tracking-wide text-gray-200">Chatting with MindBot</h2>
          <div className="flex items-center gap-4 text-gray-400">
             <button className="hover:text-cyan-400 transition text-lg cursor-pointer">⚙️</button>
             <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">👤</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 pb-40">
          {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center mt-20 text-gray-600 opacity-60">
                 <div className="text-6xl mb-6">🤖</div>
                 <h2 className="text-2xl font-bold mb-3">Welcome to MindBot</h2>
                 <p className="text-sm max-w-md">The chat history is currently empty. Upload a document or ask a general question to get started.</p>
              </div>
          ) : (
             messages.map((msg, index) => (
                <div key={index} className={`flex w-full ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className="flex gap-3 max-w-[80%]">
                    {!msg.isUser && (
                      <div className="w-8 h-8 rounded-full bg-cyan-900/50 border border-cyan-400/30 flex items-center justify-center shrink-0 mt-2">
                        <span className="text-sm drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">🧠</span>
                      </div>
                    )}
                    <div className={`p-4 rounded-2xl flex flex-col gap-2 ${msg.isUser ? 'bg-transparent border-2 border-cyan-400 text-gray-100 rounded-tr-sm' : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-sm'}`}>
                      {msg.imageUrl && (
                        <img src={msg.imageUrl} alt="User upload" className="max-w-50 rounded-lg border border-white/20" />
                      )}
                      {msg.isUser ? (
                        <p className="text-sm">{msg.text}</p>
                      ) : (
                        <div className="prose prose-sm prose-invert max-w-none text-gray-300">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
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

          {isThinking && (
              <div className="flex justify-start">
                  <div className="w-8 h-8 rounded-full bg-cyan-900/50 border border-cyan-400/30 flex items-center justify-center shrink-0 mt-2 mr-3">
                      <span className="text-sm drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">🧠</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 text-gray-300 p-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
                      <span className="animate-bounce">●</span><span className="animate-bounce delay-100">●</span><span className="animate-bounce delay-200">●</span>
                  </div>
              </div>
          )}
          
          {/* NEW: The invisible div that forces the auto-scroll to the bottom */}
          <div ref={messagesEndRef} />
        </div>

        <div className="absolute bottom-0 w-full bg-linear-to-t from-[#0a0a16] via-[#0a0a16]/90 to-transparent pt-20 pb-8 px-8 z-10">
          <div className="max-w-4xl mx-auto flex flex-col gap-2">
            
            {imagePreviewUrl && (
              <div className="relative w-16 h-16 ml-2 group">
                <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover rounded-xl border-2 border-cyan-400/50" />
                <button 
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center shadow-lg hover:bg-red-400 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-2 shadow-2xl flex items-center gap-2 transition-all hover:border-cyan-400/50">
              <div className="flex gap-1 pl-2 items-center">
                
                {/* NEW: Animated Sound Wave Mic Button */}
                <button 
                  onClick={toggleRecording} 
                  className={`w-10 h-10 flex items-center justify-center transition cursor-pointer rounded-full ${isRecording ? 'bg-red-400/10 shadow-[0_0_15px_rgba(248,113,113,0.3)]' : 'hover:bg-white/5'}`}
                >
                  {isRecording ? (
                    <div className="flex items-center gap-0.75">
                      <span className="w-1 h-2 bg-red-400 rounded-full animate-bounce"></span>
                      <span className="w-1 h-4 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-1 h-3 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    </div>
                  ) : (
                    <span className="text-gray-400 hover:text-cyan-400 text-lg">🎙️</span>
                  )}
                </button>

                <button onClick={() => document.getElementById('imageUploadInput').click()} className="text-gray-400 hover:text-cyan-400 p-2 transition cursor-pointer text-lg">🖼️</button>
                <input id="imageUploadInput" type="file" accept="image/*" onChange={handleImagePick} className="hidden" />
              </div>

              <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') handleSendMessage(); }} placeholder={isRecording ? "Listening..." : "Ask MindBot something..."} className="flex-1 bg-transparent border-none text-gray-200 px-4 py-2 focus:outline-none placeholder-gray-500 text-sm" />
              
              <button onClick={handleSendMessage} disabled={(!inputText.trim() && !selectedImage) || isThinking} className={`text-gray-900 px-6 py-2.5 rounded-2xl text-sm font-bold transition-all mr-1 cursor-pointer ${(!inputText.trim() && !selectedImage) || isThinking ? 'bg-gray-700 text-gray-500 cursor-not-allowed shadow-none' : 'bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.4)]'}`}>
                Send
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}