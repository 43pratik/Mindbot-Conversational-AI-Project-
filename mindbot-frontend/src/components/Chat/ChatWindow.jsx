import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatWindow({ messages, isThinking }) {
  // 1. Create the invisible anchor
  const messagesEndRef = useRef(null);

  // 2. Function to smoothly scroll to the anchor
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 3. Trigger the scroll every time 'messages' or 'isThinking' changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-4 overflow-y-auto flex flex-col gap-6">
      
      {messages.length === 0 ? (
        <div className="text-center opacity-30 mt-20">
          <span className="text-5xl block mb-4">💬</span>
          <p className="text-lg">Upload a document, then say hello!</p>
        </div>
      ) : (
        messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              msg.isUser 
                ? 'bg-primary text-darker rounded-br-sm' 
                : 'bg-secondary text-white rounded-bl-sm border border-gray-700'
            }`}>
              {msg.isUser ? (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              ) : (
                <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-darker prose-pre:border prose-pre:border-gray-700 prose-a:text-primary max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.text}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))
      )}

      {isThinking && (
        <div className="flex justify-start">
          <div className="bg-secondary text-gray-400 p-4 rounded-2xl rounded-bl-sm flex items-center gap-2">
            <span className="animate-bounce">●</span>
            <span className="animate-bounce delay-100">●</span>
            <span className="animate-bounce delay-200">●</span>
          </div>
        </div>
      )}
      
      {/* 4. Place the invisible anchor at the very bottom of the chat */}
      <div ref={messagesEndRef} />
    </div>
  );
}