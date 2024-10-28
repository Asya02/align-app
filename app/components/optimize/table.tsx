import React from 'react';
import { OptimizationResult } from '@/app/lib/definitions';

interface OptimizationTableProps {
  results: OptimizationResult[];
}

export const OptimizationTable = ({ results }: OptimizationTableProps) => {
  if (results.length === 0) {
    return (
      <p className="text-center py-8 text-red-600 text-xl font-bold">No optimization results available yet.</p>
    );
  }

  const truncateText = (text: string, firstNWords: number = 10, lastNWords: number = 3) => {
    const words = text.trim().split(/\s+/);
    if (words.length <= (firstNWords + lastNWords)) {
      return text;
    }
    
    const startWords = words.slice(0, firstNWords);
    const endWords = words.slice(-lastNWords);
    
    return `${startWords.join(' ')} ... ${endWords.join(' ')}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <table className="w-full border border-gray-300 border-collapse">
      <thead>
        <tr className="bg-gray-100">
          <th className="border-2 border-gray-300 p-2 text-left text-gray-900">Trial</th>
          <th className="border-2 border-gray-300 p-2 text-left text-gray-900">Split</th>
          <th className="border-2 border-gray-300 p-2 text-left text-gray-900">Fields</th>
          <th className="border-2 border-gray-300 p-2 text-left text-gray-900">Model</th>
          <th className="border-2 border-gray-300 p-2 text-left text-gray-900">Prompt</th>
          <th className="border-2 border-gray-300 p-2 text-left text-gray-900">Precision</th>
          <th className="border-2 border-gray-300 p-2 text-left text-gray-900">Recall</th>
          <th className="border-2 border-gray-300 p-2 text-left text-gray-900">F1</th>
          <th className="border-2 border-gray-300 p-2 text-left text-gray-900">Cohen&apos;s κ</th>
        </tr>
      </thead>
      <tbody>
        {results.map((row, index) => (
          <tr key={row.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
            <td className="border-2 border-gray-300 p-2 text-gray-900">{row.run_number}</td>
            <td className="border-2 border-gray-300 p-2 text-gray-900">{row.split_type}</td>
            <td className="border-2 border-gray-300 p-2 text-gray-900">
              <div className="max-h-20 overflow-y-auto">{row.evaluation_fields}</div>
            </td>
            <td className="border-2 border-gray-300 p-2 text-gray-900">{row.evaluation_model}</td>
            <td className="border-2 border-gray-300 p-2 text-gray-900">
              <div className="flex items-center gap-2">
                <div className="max-h-20 overflow-y-auto flex-grow" title={row.prompt}>
                  {truncateText(row.prompt, 6, 3)}
                </div>
                <button
                  onClick={() => copyToClipboard(row.prompt)}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                  title="Copy full prompt"
                >
                  Copy
                </button>
              </div>
            </td>
            <td className="border-2 border-gray-300 p-2 text-gray-900">{row.precision.toFixed(3)}</td>
            <td className="border-2 border-gray-300 p-2 text-gray-900">{row.recall.toFixed(3)}</td>
            <td className="border-2 border-gray-300 p-2 text-gray-900">{row.f1.toFixed(3)}</td>
            <td className="border-2 border-gray-300 p-2 text-gray-900">{row.cohens_kappa.toFixed(3)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
