const Terminal = ({ logs }) => {
  return (
    <div className="bg-[#f0f2f5] rounded-xl shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] flex flex-col h-full">
      <div className="bg-[#f0f2f5] shadow-[inset_1.5px_1.5px_3px_#cbd5e1,inset_-1.5px_-1.5px_3px_#ffffff] px-3 py-2 flex items-center gap-2 rounded-t-xl">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-400"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
        </div>
        <span className="ml-2 text-[10px] font-semibold text-gray-500">architech.log</span>
      </div>
      <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px]">
        {logs.length === 0 ? (
          <div className="text-gray-400">
            <p className="text-[#007aff]">$</p> Waiting for commands...
            <p className="mt-1.5 text-[10px] text-gray-400">Your project logs will appear here</p>
          </div>
        ) : (
          logs.map((log, index) => (
            <p key={index} className="mb-1 text-gray-700">
              <span className="text-[#007aff]">$</span> {log}
            </p>
          ))
        )}
      </div>
    </div>
  );
};

export default Terminal;
