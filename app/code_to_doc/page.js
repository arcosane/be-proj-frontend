'use client'
import React, { useState } from 'react';

export default function Page() {
  const [messages, setMessages] = useState([
    { sender: 'user', text: 'Hello!' },
    { sender: 'bot', text: 'Hi! How can I assist you today?' }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [chats, setChats] = useState([{ chatId: 1, chatName: 'Chat User 1' }]);
  const [activeChat, setActiveChat] = useState(1); // Tracks the active chat

  // Handle message sending
  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    setMessages([...messages, { sender: 'user', text: inputValue }]);
    setInputValue('');
  };

  // Handle new chat creation
  const handleNewChat = () => {
    const newChatId = chats.length + 1;
    const newChat = { chatId: newChatId, chatName: `Chat User ${newChatId}` };
    setChats([...chats, newChat]);
    setActiveChat(newChatId);
    setMessages([]); // Clear the messages for the new chat
  };

  return (
    <div className='flex flex-row w-full h-screen'>
      {/* Left Sidebar - Chats */}
      <div className='w-1/5 border-r border-gray-300 p-4'>
        <div className='font-bold text-lg mb-4'>Chats</div>
        <div>
          <button 
            className='bg-blue-500 text-white px-6 py-2 rounded-md' 
            onClick={handleNewChat}
          >
            New Chat
          </button>
        </div>
        <p className='my-2 font-bold text-xl'>Your Chats</p>
        <div className='flex flex-col'>
          {chats.map(chat => (
            <div 
              key={chat.chatId} 
              className={`py-2 my-2 px-6 rounded-md text-black bg-slate-300 cursor-pointer ${activeChat === chat.chatId ? 'bg-blue-200' : ''}`}
              onClick={() => {
                setActiveChat(chat.chatId);
                setMessages([]); // Clear messages for a new chat
              }}
            >
              {chat.chatName}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Section */}
      <div className='w-3/5 flex flex-col px-14'>
        <div className='profile-container flex my-6 px-4 py-2 border border-gray-400 rounded-md w-fit'>
          <div className='profile-image mx-1 my-1 border rounded-full px-4 py-2'>P</div>
          <div className='username text-center mt-auto mb-auto mx-1 my-1'>Username</div>
        </div>

        <div className='chat-content flex flex-col flex-grow overflow-y-auto mb-4'>
          {messages.map((msg, index) => (
            <div key={index} className={`my-2 flex p-3 rounded-lg w-fit ${msg.sender === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-200'}`}>
              {msg.text}
            </div>
          ))}
        </div>

        <div className='flex items-center border-t border-gray-300 p-2'>
          <input
            type='text'
            className='flex-grow border border-gray-300 rounded-md px-4 py-2 mr-2'
            placeholder='Type your message...'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button
            className='bg-blue-500 text-white px-4 py-2 rounded-md'
            onClick={handleSendMessage}
          >
            Send
          </button>
        </div>
      </div>

      {/* Right Sidebar - Repository (placeholder for now) */}
      <div className='w-1/5 border-l border-gray-300 p-4'>
        <div className='font-bold text-lg mb-4'>Repository</div>
      </div>
    </div>
  );
}
