'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileTree from '@/components/FileTree';

export default function Page() {
  const API_BASE_URL = 'http://localhost:8000/api';
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };
  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/code-gen-chats/`, { withCredentials: true });
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/code-gen-chats/${chatId}/messages/`, { withCredentials: true });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || !activeChat) return;
    let formData = new FormData();
    formData.append('text', inputValue);
    if(pdfFile){
      formData.append('pdf', pdfFile);
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/code-gen-chats/${activeChat}/messages/`,formData, {
        headers: {
          'Content-Type': 'multipart/form-data' // Important for file uploads
        },
        withCredentials: true
      });
      setMessages([...messages, response.data.user_message, response.data.bot_response]);
      setInputValue('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleNewChat = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/code-gen-chats/`, {
        chat_name: `Chat ${chats.length + 1}`,
      }, { withCredentials: true });
      setChats([...chats, response.data]);
      setActiveChat(response.data.id);
      setMessages([]);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  return (
    <div className="flex flex-row w-full h-screen">
      {/* Left Sidebar - Chats */}
      <div className="w-1/5 border-r border-gray-300 p-4">
        <div className="font-bold text-lg mb-4">Chats</div>
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded-md"
          onClick={handleNewChat}
        >
          New Chat
        </button>
        <div className="flex flex-col mt-4">
          {chats ? (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`py-2 px-4 rounded-md cursor-pointer ${activeChat === chat.id ? 'bg-blue-200' : ''}`}
                onClick={() => {
                  setActiveChat(chat.id);
                  fetchMessages(chat.id);
                }}
              >
                {chat.chat_name}
              </div>
            ))
          ) : (
            <div>No chats available</div>
          )}
        </div>
      </div>

      {/* Main Chat Section */}
      <div className="w-4/5 flex flex-col p-4 h-full">
        <div className="chat-content flex-grow overflow-y-auto mb-4">
          {messages.map((msg, index) => (
            <div key={index} className={`my-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`p-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-200'} overflow-x-auto overflow-y-auto`}>
                {/* Render HTML content (including <pre><code> for code formatting) */}
                <div dangerouslySetInnerHTML={{ __html: msg.text }} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center mt-4">
        <input
          type="file"
          accept=".pdf" // Accept only PDF files
          onChange={handleFileChange}
          className="mr-2"
        />
        <input
          type="text"
          className="flex-grow border border-gray-300 rounded-md px-4 py-2 mr-2"
          placeholder="Type your message or paste text from PDF..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={handleSendMessage}
        >
          Send
        </button>
        </div>
      </div>
    </div>
  );
}
