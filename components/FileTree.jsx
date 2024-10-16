import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FileText } from 'lucide-react';

const FileTreeNode = ({ node, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isFolder = node.type === 'tree';

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className="select-none">
      <div
        className={`flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer`}
        style={{ paddingLeft: `${level * 20}px` }}
        onClick={isFolder ? toggleOpen : undefined}
      >
        {isFolder && (
          <span className="mr-1">
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        )}
        <span className="mr-2">
          {isFolder ? <Folder size={16} /> : <FileText size={16} />}
        </span>
        <span className={isFolder ? "font-semibold" : ""}>{node.path}</span>
      </div>
      {isFolder && isOpen && node.children && (
        <div>
          {node.children.map((childNode) => (
            <FileTreeNode key={childNode.path} node={childNode} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const FileTree = ({ tree }) => {
  return (
    <div className="font-mono text-sm border rounded shadow-sm">
      {tree.map((node) => (
        <FileTreeNode key={node.path} node={node} />
      ))}
    </div>
  );
};

export default FileTree;