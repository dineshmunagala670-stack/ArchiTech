import { useState } from 'react';

const FileExplorer = ({ tree = [], openFiles = [], activeFile = null, onFileSelect }) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  const toggleFolder = (name) => {
    if (!name) return;
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(name)) {
      newExpanded.delete(name);
    } else {
      newExpanded.add(name);
    }
    setExpandedFolders(newExpanded);
  };

  const renderTree = (items = [], depth = 0) => {
    if (!items || !Array.isArray(items)) return null;
    
    return items.map((item, index) => {
      if (!item) return null;
      
      if (item.type === 'folder') {
        const isExpanded = expandedFolders.has(item.name);
        return (
          <div key={`${item.name || `folder-${index}`}-${index}-${depth}`}>
            <div
              className="tree-item folder"
              onClick={() => toggleFolder(item.name)}
              style={{ paddingLeft: `${depth * 16}px` }}
            >
              <span className="tree-icon">{isExpanded ? '📂' : '📁'}</span>
              <span className="tree-name">{item.name || 'Unnamed Folder'}</span>
            </div>
            {isExpanded && item.children && renderTree(item.children, depth + 1)}
          </div>
        );
      } else if (item.type === 'file') {
        const isActive = item.path === activeFile;
        const isOpen = openFiles.includes(item.path);
        return (
          <div
            key={`${item.path || `file-${index}`}-${depth}`}
            className={`tree-item file ${isActive ? 'active' : ''} ${isOpen ? 'open' : ''}`}
            onClick={() => item.path && onFileSelect(item.path)}
            style={{ paddingLeft: `${depth * 16}px` }}
          >
            <span className="tree-icon">{getFileIcon(item.name)}</span>
            <span className="tree-name">{item.name || 'Unnamed File'}</span>
          </div>
        );
      }
      return null;
    });
  };

  const getFileIcon = (name = '') => {
    if (name.endsWith('.js') || name.endsWith('.jsx')) return '📜';
    if (name.endsWith('.ts') || name.endsWith('.tsx')) return '📘';
    if (name.endsWith('.py')) return '🐍';
    if (name.endsWith('.rs')) return '🦀';
    if (name.endsWith('.cpp') || name.endsWith('.h')) return '⚙️';
    if (name.endsWith('.cs')) return '💎';
    if (name.endsWith('.json')) return '📋';
    if (name.endsWith('.md')) return '📝';
    if (name === 'Dockerfile' || name.endsWith('.yml') || name.endsWith('.yaml')) return '🐳';
    return '📄';
  };

  return (
    <div className="file-explorer">
      <div className="explorer-header">
        <span>📁 Files</span>
      </div>
      <div className="explorer-tree">
        {renderTree(tree)}
      </div>
    </div>
  );
};

export default FileExplorer;
