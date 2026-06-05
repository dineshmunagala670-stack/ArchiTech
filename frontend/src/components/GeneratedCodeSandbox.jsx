const GeneratedCodeSandbox = ({ fileContent }) => {
  return (
    <div className="bg-[#f0f2f5] p-3 rounded-xl shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] flex flex-col h-full">
      <div className="font-semibold text-slate-700 mb-2 flex items-center gap-1 text-xs">
        📄 Generated Code Sandbox
      </div>
      <textarea
        value={fileContent}
        readOnly
        className="w-full flex-1 p-3 bg-[#f0f2f5] text-slate-800 font-mono text-[11px] rounded-lg shadow-[inset_2px_2px_5px_#cbd5e1,inset_-2px_-2px_5px_#ffffff] overflow-auto border-none resize-none"
        placeholder="Your generated code files will appear here after project generation..."
      />
    </div>
  );
};

export default GeneratedCodeSandbox;
