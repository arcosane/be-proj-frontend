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
  const [repositories, setRepositories] = useState([]);
  const [activeRepo, setActiveRepo] = useState(null);
  const [repoStructure, setRepoStructure] = useState(null);
  const [repoSummary, setRepoSummary] = useState('');
  useEffect(() => {
    fetchChats();
    fetchRepositories();
  }, []);

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

  const handleDownloadPdf = async (message) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/download-pdf/`, {
        api_response: message,
      }, {
        responseType: 'blob',
        withCredentials: true,
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'response.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };


  const handleSummarizeRepo = async () => {
    if (!activeRepo) return;
    try {
      const response = await axios.post(`${API_BASE_URL}/summarize-repo/`, {
        repo_name: activeRepo.name
      }, { withCredentials: true });
      console.log(response.data.summary)
      setRepoSummary(response.data.summary);
      
      // Add the summary to the chat messages
      const summaryMessage = {
        sender: 'bot',
        text: `Here's a summary of the repository "${activeRepo.name}":\n\n${response.data.summary}`
      };
      setMessages(prevMessages => [...prevMessages, summaryMessage]);
    } catch (error) {
      console.error('Error summarizing repo:', error);
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
        <div className="chat-content flex-grow overflow-y-auto mb-4">
          {messages.map((msg, index) => (
            <div key={index}>
              <div className={`my-2 p-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-200'}`}>
                {msg.text}
              </div>
              {msg.sender === 'bot' && (
                <div>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded-md mt-4"
                    onClick={() => handleDownloadPdf(msg.text)}
                  >
                    Download PDF
                  </button>
                </div>
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
      <div className="w-1/5 border-l border-gray-300 p-4">
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
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">Project File Structure</h1>
        {repoStructure ? <FileTree tree={repoStructure} /> : <p>Loading...</p>}
      </div>
    </div>
  );
}
