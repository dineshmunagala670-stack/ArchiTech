const CodeSandbox = ({ fileContents = {}, openFiles = [], activeFile = null, onFileSelect, onFileClose }) => {
  return (
    <div className="code-sandbox">
      <div className="sandbox-tabs">
        {openFiles && Array.isArray(openFiles) && openFiles.map((filePath) => (
          <div
            key={filePath || `tab-${Math.random()}`}
            className={`sandbox-tab ${activeFile === filePath ? 'active' : ''}`}
            onClick={() => filePath && onFileSelect(filePath)}
          >
            <span className="tab-name">{filePath ? filePath.split('/').pop() : 'Unnamed File'}</span>
            <button
              className="tab-close"
              onClick={(e) => {
                e.stopPropagation();
                filePath && onFileClose(filePath);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="sandbox-content">
        {activeFile && fileContents && fileContents[activeFile] ? (
          <pre className="code-preview">
            <code>{fileContents[activeFile]}</code>
          </pre>
        ) : (
          <div className="sandbox-empty">Select a file to view</div>
        )}
      </div>
    </div>
  );
};

export default CodeSandbox;
