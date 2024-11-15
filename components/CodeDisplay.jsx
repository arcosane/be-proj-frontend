import React, { useState, useEffect } from 'react';
import { FiCopy } from 'lucide-react';

const CodeDisplay = ({ code }) => {
  const [copySuccess, setCopySuccess] = useState('');

  // Function to detect and format code blocks
  const formatCode = (text) => {
    if (!text) return null;
    
    // Check if the text contains code block markers
    const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
    const matches = text.match(codeBlockRegex);
    
    if (!matches) return text;

    // Process each code block
    return text.split(codeBlockRegex).map((part, index) => {
      if (index % 3 === 0) {
        // Regular text outside code blocks
        return part ? <span key={index}>{part}</span> : null;
      } else if (index % 3 === 1) {
        // Language identifier (unused for now)
        return null;
      } else {
        // Code block content
        return (
          <div key={index} className="relative bg-gray-900 rounded-lg my-4">
            <div className="flex justify-between items-center px-4 py-2 bg-gray-800 rounded-t-lg">
              <span className="text-gray-400 text-sm">Code</span>
              <button
                onClick={() => handleCopy(part.trim())}
                className="text-gray-400 hover:text-white transition-colors"
                title="Copy code"
              >
                <FiCopy className="w-4 h-4" />
              </button>
            </div>
            <pre className="p-4 overflow-x-auto">
              <code className="text-gray-100 font-mono text-sm whitespace-pre">
                {part.trim()}
              </code>
            </pre>
          </div>
        );
      }
    }).filter(Boolean);
  };

  const handleCopy = async (textToCopy) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setCopySuccess('Failed to copy');
    }
  };

  return (
    <div className="w-full">
      {formatCode(code)}
      {copySuccess && (
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">
            {copySuccess}
          </span>
        </div>
      )}
    </div>
  );
};

export default CodeDisplay;