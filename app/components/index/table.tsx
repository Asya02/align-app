import React from 'react';
import type { Eval } from '@/app/lib/definitions';

interface TableProps {
  data: Eval[];
  handleCellEdit: (id: number, key: string, value: string) => void;
  handleCellUpdate: () => void;
  editingCell: { id: number, key: string } | null;
  editableRef: React.RefObject<HTMLDivElement>;
}

interface LabelButtonsProps {
  id: number;
  currentValue: string;
  onUpdate: (id: number, key: string, value: string) => void;
}

const LabelButtons = ({ id, currentValue, onUpdate }: LabelButtonsProps) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex gap-2">
        <button
          onClick={() => onUpdate(id, 'label', '0')}
          className={`px-2 py-1 text-sm rounded ${
            currentValue === '0'
              ? 'bg-green-500 text-white' 
              : 'bg-gray-100 hover:bg-green-100'
          }`}
        >
          Pass
        </button>
        <button
          onClick={() => onUpdate(id, 'label', '1')}
          className={`px-2 py-1 text-sm rounded ${
            currentValue === '1'
              ? 'bg-red-500 text-white' 
              : 'bg-gray-100 hover:bg-red-100'
          }`}
        >
          Fail
        </button>
      </div>
      {currentValue && (  // Only show Clear button if there's a value
        <button
          onClick={() => onUpdate(id, 'label', '')}
          className="px-2 py-1 text-sm rounded w-full bg-gray-100 hover:bg-gray-200"
        >
          Clear
        </button>
      )}
    </div>
  );
};

const PredictionDisplay = ({ value }: { value: string | number }) => {
  const predictionValue = String(value).trim();
  
  if (predictionValue === '0') {
    return (
      <div className="flex justify-center">
        <span className="px-2 py-1 text-sm rounded bg-green-500 text-white">
          Pass
        </span>
      </div>
    );
  } else if (predictionValue === '1') {
    return (
      <div className="flex justify-center">
        <span className="px-2 py-1 text-sm rounded bg-red-500 text-white">
          Fail
        </span>
      </div>
    );
  }
  return <span className="flex justify-center">{'\u00A0'}</span>; // Centered empty space
};

export const Table = ({ data, handleCellEdit, handleCellUpdate, editingCell, editableRef }: TableProps) => {
  const getCellBackgroundColor = (row: { prediction: string | number; label: string | number }, key: string) => {
    if (key === 'prediction') {
      const prediction = String(row.prediction).trim();
      const label = String(row.label).trim();
      if (prediction === '' || label === '') {
        return 'bg-gray-300'; // Grey if either is empty
      } else if (prediction === label) {
        return 'bg-green-200'; // Light green if they match
      } else {
        return 'bg-red-200'; // Light red if they don't match
      }
    }
    return ''; // Default background for other columns
  };

  return (
    <div className="overflow-x-auto bg-white">
      {data.length > 0 ? (
        <table className="w-full border border-gray-300 border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {Object.keys(data[0]).map((key) => (
                <th key={key} className="border-2 border-gray-300 p-2 text-left text-gray-900">{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                {Object.entries(row).map(([key, value], cellIndex) => (
                  <td 
                    key={cellIndex} 
                    className={`border-2 border-gray-300 p-2 text-gray-900 ${getCellBackgroundColor(row, key)}`}
                  >
                    {key === 'label' ? (
                      <LabelButtons
                        id={row.id}
                        currentValue={String(value)}
                        onUpdate={handleCellEdit}
                      />
                    ) : key === 'prediction' ? (
                      <PredictionDisplay value={value} />
                    ) : editingCell?.id === row.id && editingCell?.key === key ? (
                      <div
                        ref={editableRef}
                        contentEditable
                        onBlur={handleCellUpdate}
                        className="outline-none border-b border-blue-500"
                      />
                    ) : (
                      <div onClick={() => handleCellEdit(row.id, key, String(value))}>
                        {value || '\u00A0'}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
       <br />
      )}
    </div>
  );
};
