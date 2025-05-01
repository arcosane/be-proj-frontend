'use client';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import FileTree from '@/components/FileTree';
import { Oval } from 'react-loader-spinner';

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
    const [pdfContent, setPdfContent] = useState('');
    const [botResponse, setBotResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [isLoadingChats, setIsLoadingChats] = useState(false);
    const [isLoadingRepos, setIsLoadingRepos] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSummarizingRepo, setIsSummarizingRepo] = useState(false);
    const [isLoadingRepoStructure, setIsLoadingRepoStructure] = useState(false);

    const chatContentRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([fetchChats(), fetchRepositories()]);
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (chatContentRef.current) {
            chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchRepositories = async () => {
        setIsLoadingRepos(true);
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
        } finally {
            setIsLoadingRepos(false);
        }
    };

    const fetchChats = async () => {
        setIsLoadingChats(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/chats/`, { withCredentials: true });
            setChats(response.data);
        } catch (error) {
            console.error('Error fetching chats:', error);
        } finally {
            setIsLoadingChats(false);
        }
    };

    const fetchMessages = async (chatId) => {
        setIsLoadingMessages(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/chats/${chatId}/messages/`, { withCredentials: true });
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setIsLoadingMessages(false);
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
        setActiveRepo(repo);
        setIsLoadingRepoStructure(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/repo-structure/${repo.name}/`, { withCredentials: true });
            setRepoStructure(response.data.tree);
        } catch (error) {
            console.error('Error fetching repo structure:', error);
        } finally {
            setIsLoadingRepoStructure(false);
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
                    responseType: 'blob',
                    withCredentials: true,
                }
            );

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'report.pdf');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading PDF:', error);
        }
    };

    const handleSummarizeRepo = async () => {
        if (!activeRepo || !activeChat) return;
        setIsLoading(true);
        setIsSummarizingRepo(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/summarize-repo/`, {
                repo_name: activeRepo.name,
                chat_id: activeChat
            }, { withCredentials: true });
            console.log(response.data.summary);
            setPdfContent(response.data.summary);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error summarizing repo:', error);
        } finally {
            setIsSummarizingRepo(false);
            setIsLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setPdfContent('');
    };

    if (isLoading) {
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
                    disabled={isLoadingChats}
                >
                    {isLoadingChats ? 'Creating...' : 'New Chat'}
                </button>
                <nav className="mt-4 space-y-2">
                    {isLoadingChats ? (
                        <div className="text-gray-500">Loading chats...</div>
                    ) : (
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
                    )}
                </nav>
            </aside>

            {/* Main Chat Section */}
            <main className="flex-grow flex flex-col p-4">
                <div
                    className="chat-content flex-grow overflow-y-auto mb-4 p-4 bg-white rounded-lg shadow-sm"
                    ref={chatContentRef}
                >
                    {isLoadingMessages ? (
                        <div className="text-gray-500">Loading messages...</div>
                    ) : (
                        messages.map((msg, index) => (
                            <div key={index} className="mb-3" style={{maxWidth: '600px'}}>
                                <div className={`rounded-xl py-2 px-3 max-w-3/4 break-words ${msg.sender === 'user' ? 'bg-blue-100 text-blue-800 ml-auto' : 'bg-gray-100 text-gray-800 mr-auto'}`}>
                                    <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                                </div>
                                {msg.sender === 'bot' && !isModalOpen && (
                                    <button
                                        className="bg-green-500 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md mt-2 focus:outline-none transition duration-200"
                                        onClick={() => {
                                            setPdfContent(msg.text);
                                            setIsModalOpen(true);
                                        }}
                                    >
                                        View Summary
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className="flex items-center">
                    <input
                        type="text"
                        className="flex-grow border border-gray-300 rounded-md px-4 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="Type your message..."
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
                    {activeRepo && (
                        <button
                            className="bg-green-500 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md ml-2 focus:outline-none transition duration-200"
                            onClick={handleSummarizeRepo}
                            disabled={isSummarizingRepo}
                        >
                            {isSummarizingRepo ? 'Summarizing...' : 'Summarize Repo'}
                        </button>
                    )}
                </div>
            </main>

            {/* Right Sidebar - Repositories */}
            <aside className="w-1/5 border-l border-gray-200 p-4 bg-white shadow-sm overflow-y-auto">
                <h2 className="font-semibold text-xl mb-4 text-gray-800">Repositories</h2>
                <nav className="space-y-2">
                    {isLoadingRepos ? (
                        <div className="text-gray-500">Loading repositories...</div>
                    ) : (
                        repositories.map((repo) => (
                            <button
                                key={repo.id}
                                className={`w-full text-left py-2 px-4 rounded-md hover:bg-gray-100 focus:outline-none transition duration-200 ${activeRepo?.id === repo.id ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700'}`}
                                onClick={() => handleSelectRepo(repo)}
                            >
                                {repo.name}
                            </button>
                        ))
                    )}
                </nav>
            </aside>

            {/* File Structure Section */}
            <div className="container mx-auto p-4 overflow-y-auto w-1/5">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Project File Structure</h3>
                <div className="bg-white rounded-lg shadow-sm p-4">
                    {isLoadingRepoStructure ? (
                        <div className="text-gray-500">Loading file structure...</div>
                    ) : (
                        repoStructure ? <FileTree tree={repoStructure} /> : <p className="text-gray-600">No repository selected.</p>
                    )}
                </div>
            </div>

            {/* Modal Component */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border shadow-lg rounded-md bg-white" style={{ width: '70%' }}>
                        <h3 className="text-lg font-semibold text-gray-800">Report Preview</h3>
                        <PDFPreview pdfContent={pdfContent} handleDownloadPdf={handleDownloadPdf} />
                        <div className="mt-3 text-right">
                            <button className="bg-red-500 hover:bg-red-700 text-white font-medium py-2 px-4 rounded focus:outline-none transition duration-200" onClick={closeModal}>
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
        <div className="p-4">
            <pre className="overflow-x-auto whitespace-pre-wrap p-3 bg-gray-50 rounded-md">
                <div dangerouslySetInnerHTML={{ __html: pdfContent }} />
            </pre>
            <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md mt-4 focus:outline-none transition duration-200"
                onClick={() => handleDownloadPdf(pdfContent)}
            >
                Download PDF
            </button>
        </div>
    );
};