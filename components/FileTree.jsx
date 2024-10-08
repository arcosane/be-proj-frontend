// components/FileTree.js
import React from 'react';

// Recursive component to display files and folders
const FileTree = ({ tree }) => {
  return (
    <ul className="pl-4 list-disc">
      {tree.map((node) => (
        <li key={node.sha} className="text-sm">
          {node.type === 'tree' ? (
            <div>
              <span className="font-bold">{node.path}</span>
              {node.children && <FileTree tree={node.children} />}
            </div>
          ) : (
            <span>{node.path}</span>
          )}
        </li>
      ))}
    </ul>
  );
};

export default FileTree;
