'use client';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Oval } from 'react-loader-spinner';
import { FaFileUpload } from 'react-icons/fa'; // Import file upload icon

export default function Page() {
    const API_BASE_URL = 'http://localhost:8000/api';
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);
    const chatContentRef = useRef(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchChats();
    }, []);

    useEffect(() => {
        if (chatContentRef.current) {
            chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
        }
    }, [messages]);

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
        if (pdfFile) {
            formData.append('pdf', pdfFile);
        }
        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/code-gen-chats/${activeChat}/messages/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data' // Important for file uploads
                },
                withCredentials: true
            });
            setMessages([...messages, response.data.user_message, response.data.bot_response]);
            setInputValue('');
            setPdfFile(null); // Clear the PDF file after sending
        } catch (error) {
            console.error('Error sending message:', error);
        }
        setLoading(false);
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

    const handleFileChange = (e) => {
        setPdfFile(e.target.files[0]);
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-white flex justify-center items-center z-50">
                <Oval
                    color="#00BFFF"
                    height={80}
                    width={80}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-row w-full h-screen bg-gray-50">
            {/* Left Sidebar - Chats */}
            <aside className="w-1/5 border-r border-gray-200 p-4 bg-white shadow-sm">
                <h2 className="font-semibold text-xl mb-4 text-gray-800">Chats</h2>
                <button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none transition duration-200"
                    onClick={handleNewChat}
                >
                    New Chat
                </button>
                <nav className="mt-4 space-y-2">
                    {chats ? (
                        chats.map((chat) => (
                            <button
                                key={chat.id}
                                className={`w-full text-left py-2 px-4 rounded-md hover:bg-gray-100 focus:outline-none transition duration-200 ${activeChat === chat.id ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700'}`}
                                onClick={() => {
                                    setActiveChat(chat.id);
                                    fetchMessages(chat.id);
                                }}
                            >
                                {chat.chat_name}
                            </button>
                        ))
                    ) : (
                        <div className="text-gray-500">No chats available</div>
                    )}
                </nav>
            </aside>

            {/* Main Chat Section */}
            <main className="w-4/5 flex flex-col p-4">
                <div ref={chatContentRef} className="chat-content flex-grow overflow-y-auto mb-4 p-4 bg-white rounded-lg shadow-sm">
                    {messages.map((msg, index) => (
                        <div key={index} className={`my-2 flex ${msg.sender === 'user' ? 'justify-end w-fit' : 'justify-start'}`}>
                            <div className={`p-3 rounded-lg max-w-3/4 break-words ${msg.sender === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex items-center mt-4">
                    {/* Custom File Upload Button */}
                    <label htmlFor="pdf-upload" className="bg-green-500 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md cursor-pointer mr-2 flex items-center">
                        <FaFileUpload className="mr-2" />
                        Upload PDF
                    </label>
                    <input
                        id="pdf-upload"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden" // Hide the default input
                    />
                    {pdfFile && <span className="text-gray-500">{pdfFile.name}</span>} {/* Show filename */}

                    <input
                        type="text"
                        className="flex-grow border border-gray-300 rounded-md px-4 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="Type your message or paste text from PDF..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none transition duration-200"
                        onClick={handleSendMessage}
                    >
                        Send
                    </button>
                </div>
            </main>
        </div>
    );
}