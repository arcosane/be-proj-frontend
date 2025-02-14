'use client';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import FileTree from '@/components/FileTree';

export default function Page() {
    const API_BASE_URL = 'http://localhost:8000/api';
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [repositories, setRepositories] = useState([]);
    const [activeRepo, setActiveRepo] = useState(null);
    const [repoStructure, setRepoStructure] = useState(null);
    const [repoSummary, setRepoSummary] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pdfContent, setPdfContent] = useState('');// Store the PDF report content
    const [botResponse, setBotResponse] = useState(null);

    // Create a ref for the chat content container
    const chatContentRef = useRef(null);

    useEffect(() => {
        fetchChats();
        fetchRepositories();
    }, []);

    useEffect(() => {
        // Scroll to the bottom of the chat content whenever messages change
        if (chatContentRef.current) {
            chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
        }
    }, [messages]); // Run this effect whenever the messages state changes

    const fetchRepositories = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/github-repos/`, {
                method: 'GET',
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch repositories');
            }
            const data = await response.json();
            setRepositories(data);
        } catch (error) {
            console.error('Error fetching repositories:', error);
        }
    };

    const fetchChats = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/chats/`, { withCredentials: true });
            setChats(response.data);
        } catch (error) {
            console.error('Error fetching chats:', error);
        }
    };

    const fetchMessages = async (chatId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/chats/${chatId}/messages/`, { withCredentials: true });
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async () => {
        if (inputValue.trim() === '' || !activeChat) return;
        try {
            const response = await axios.post(`${API_BASE_URL}/chats/${activeChat}/messages/`, {
                text: inputValue,
            }, { withCredentials: true });
            setMessages([...messages, response.data.user_message, response.data.bot_response]);
            setInputValue('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleNewChat = async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/chats/`, {
                chat_name: `Chat ${chats.length + 1}`,
            }, { withCredentials: true });
            setChats([...chats, response.data]);
            setActiveChat(response.data.id);
            setMessages([]);
        } catch (error) {
            console.error('Error creating new chat:', error);
        }
    };

    const handleSelectRepo = async (repo) => {
        console.log(repo, "Selected Repository");
        setActiveRepo(repo);
        try {
            const response = await axios.get(`${API_BASE_URL}/repo-structure/${repo.name}/`, { withCredentials: true });
            setRepoStructure(response.data.tree);
        } catch (error) {
            console.error('Error fetching repo structure:', error);
        }
    };

    const handleDownloadPdf = async (api_response) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/download-pdf/`,
                {
                    api_response: api_response,
                },
                {
                    responseType: 'blob', // Important for handling binary data
                    withCredentials: true,
                }
            );

            // Create a Blob from the PDF stream
            const blob = new Blob([response.data], { type: 'application/pdf' });

            // Create a URL for the Blob
            const url = window.URL.createObjectURL(blob);

            // Create a link element
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'report.pdf'); // Set the filename

            // Append the link to the body, click it, and remove it
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up by revoking the URL object
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading PDF:', error);
        }
    };


    const handleSummarizeRepo = async () => {
        if (!activeRepo || !activeChat) return;
        try {
            const response = await axios.post(`${API_BASE_URL}/summarize-repo/`, {
                repo_name: activeRepo.name,
                chat_id: activeChat
            }, { withCredentials: true });
            console.log(response.data.summary);
            setPdfContent(response.data.summary); // Store the summary as PDF content
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error summarizing repo:', error);
        }
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setPdfContent('');  // Clear the report content when closing the modal
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
                        <>
                            {chats.map((chat) => (
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
                            ))}
                        </>
                    ) : (
                        <></>
                    )}
                </div>
            </div>

            {/* Main Chat Section */}
            <div className="w-full flex flex-col p-4">
                <div
                    className="chat-content flex-grow overflow-y-auto mb-4"
                    ref={chatContentRef} // Attach the ref to the container
                >
                    {messages.map((msg, index) => (
                        <div key={index}>
                            <div className={`my-2 p-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-200'} overflow-x-auto overflow-y-auto`} dangerouslySetInnerHTML={{ __html: msg.text }} />

                            {msg.sender === 'bot' && !isModalOpen && (
                                <button
                                    className="bg-red-500 text-white px-4 py-2 rounded-md mt-4"
                                    onClick={() => {
                                        setPdfContent(msg.text);
                                        setIsModalOpen(true);
                                    }}
                                >
                                    View Summary
                                </button>
                            )}

                        </div>
                    ))}
                </div>
                <div className="flex items-center">
                    <input
                        type="text"
                        className="flex-grow border border-gray-300 rounded-md px-4 py-2 mr-2"
                        placeholder="Type your message..."
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
                    {activeRepo && (
                        <button
                            className="bg-green-500 text-white px-4 py-2 rounded-md mt-4"
                            onClick={handleSummarizeRepo}
                        >
                            Summarize Repo
                        </button>
                    )}
                </div>
            </div>

            {/* Right Sidebar - Repositories */}
            <div className="w-full border-l border-gray-300 p-4 overflow-y-auto">
                <div className="font-bold text-lg mb-4">Repositories</div>
                <div className="flex flex-col">
                    {repositories.map((repo) => (
                        <div
                            key={repo.id}
                            className={`py-2 px-4 rounded-md cursor-pointer ${activeRepo?.id === repo.id ? 'bg-blue-200' : ''}`}
                            onClick={() => handleSelectRepo(repo)}
                        >
                            {repo.name}{console.log(repo.name)}
                        </div>
                    ))}
                </div>

            </div>
            <div className="container mx-auto p-4 overflow-y-auto w-full">
                <h1 className="text-2xl font-bold">Project File Structure</h1>
                {repoStructure ? <FileTree tree={repoStructure} /> : <p>Loading...</p>}
            </div>
            {/* Modal Component */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div className="relative top-20 mx-auto p-5 border shadow-lg rounded-md bg-white" style={{ width: '70%' }}>
                        <h3 className="text-lg font-semibold text-gray-800">Report Preview</h3>
                        <PDFPreview pdfContent={pdfContent} handleDownloadPdf={handleDownloadPdf} />
                        <div className="mt-3 text-right">
                            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={closeModal}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const PDFPreview = ({ pdfContent, handleDownloadPdf }) => {
    return (
        <>
            <pre className="overflow-x-auto whitespace-pre-wrap">
                <div dangerouslySetInnerHTML={{ __html: pdfContent }} />
            </pre>
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                onClick={() => handleDownloadPdf(pdfContent)}
            >
                Download PDF
            </button>
        </>
    );
};