import React from 'react';

interface PromptTextAreaProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
}

export const PromptTextArea = ({ prompt, setPrompt }: PromptTextAreaProps) => (
  <>
    <label htmlFor="prompt" className="block mb-2 font-semibold text-gray-700">Evaluation Prompt:</label>
    <textarea
      id="prompt"
      value={prompt}
      onChange={(e) => setPrompt(e.target.value)}
      placeholder="Enter evaluation prompt"
      className="w-full border-2 border-blue-500 rounded-lg p-3 text-gray-900 resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm"
      rows={4}
    />
  </>
);

interface EvaluationFieldsDropdownProps {
  evaluationFields: 'inputAndOutput' | 'outputOnly';
  setEvaluationFields: (fields: 'inputAndOutput' | 'outputOnly') => void;
}

interface ModelFieldsDropdownProps {
  model: 'claude-3-haiku-20240307' | 'gpt-4o-mini';
  setModel: (model: 'claude-3-haiku-20240307' | 'gpt-4o-mini') => void;
}

export const ModelFieldsDropdown = ({ model, setModel }: ModelFieldsDropdownProps) => (
  <select
    value={model}
    onChange={(e) => setModel(e.target.value as 'claude-3-haiku-20240307' | 'gpt-4o-mini')}
    className="border-2 border-blue-500 rounded-lg p-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm"
  >
    <option value="claude-3-haiku-20240307">claude-3-haiku</option>
    <option value="gpt-4o-mini">gpt-4o-mini</option>
  </select>
);

export const EvaluationFieldsDropdown = ({ evaluationFields, setEvaluationFields }: EvaluationFieldsDropdownProps) => (
  <select
    value={evaluationFields}
    onChange={(e) => setEvaluationFields(e.target.value as 'inputAndOutput' | 'outputOnly')}
    className="border-2 border-blue-500 rounded-lg p-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm"
  >
    <option value="inputAndOutput">Input and Output</option>
    <option value="outputOnly">Output Only</option>
  </select>
);

interface EvaluateButtonProps {
  isEvaluating: boolean;
  onClick: () => void;
}

export const EvaluateButton = ({ isEvaluating, onClick }: EvaluateButtonProps) => (
  <button 
    onClick={onClick}
    className={`${isEvaluating ? 'bg-gray-400 hover:bg-red-400' : 'bg-green-500 hover:bg-green-600'} text-white px-6 py-2 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105`}
  >
    {isEvaluating ? 'Stop Evaluation' : 'Evaluate'}
  </button>
);

interface ClearEvaluationsButtonProps {
  onClick: () => void;
}

export const ClearEvaluationsButton = ({ onClick }: ClearEvaluationsButtonProps) => (
  <button 
    onClick={onClick}
    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
  >
    Clear Evaluations
  </button>
);

interface OptimizeButtonProps {
  onClick: () => void;
}

export const OptimizeButton = ({ onClick }: OptimizeButtonProps) => (
  <button 
    onClick={onClick}
    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 animate-pulse relative overflow-hidden"
  >
    <span className="relative z-10">Optimize!</span>
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 animate-pulse"></div>
  </button>
);
