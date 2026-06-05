const steps = [
  { id: 0, label: 'Analyzing', description: 'Understanding your requirements' },
  { id: 1, label: 'Scaffolding', description: 'Building project structure' },
  { id: 2, label: 'Dockerizing', description: 'Creating container configs' },
  { id: 3, label: 'Ready', description: 'Project is ready to deploy' },
];

const ProcessingPipeline = ({ currentStep, isProcessing }) => {
  return (
    <div className="bg-[#f0f2f5] rounded-xl shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] p-3 flex-1">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Processing Pipeline</h2>
      <div className="space-y-2">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <div key={step.id} className="flex items-start gap-2">
              <div className={`w-7 h-7 flex items-center justify-center flex-shrink-0 rounded-lg text-sm font-bold transition-all ${
                isCompleted ? 'bg-[#f0f2f5] text-[#34c759] shadow-[inset_1.5px_1.5px_4px_#cbd5e1,inset_-1.5px_-1.5px_4px_#ffffff]' :
                isActive ? 'bg-[#f0f2f5] text-[#007aff] shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] animate-pulse' :
                'bg-[#f0f2f5] text-gray-400 shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff]'
              }`}>
                {isCompleted ? '✓' : index + 1}
              </div>
              <div className="flex-1">
                <h3 className={`text-xs font-semibold ${
                  isCompleted || isActive ? 'text-gray-800' : 'text-gray-400'
                }`}>
                  {step.label}
                </h3>
                <p className="text-[10px] text-gray-500">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessingPipeline;
