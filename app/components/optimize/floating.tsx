// Add console.log to debug HPO_SAMPLES value
const HPO_SAMPLES = Number(process.env.NEXT_PUBLIC_HPO_SAMPLES);

interface ProgressBarProps {
  current: number | null;
  message: string;
}

const ProgressBar = ({ current, message }: ProgressBarProps) => {
  
  let percentage = 0;
  if (current) {
    percentage = Math.min((current / HPO_SAMPLES) * 100, 100);
  }

  const optimizationCompleted = message.toLowerCase().includes('optimization completed') || message.toLowerCase().includes('evaluating on test')
  const barColor = optimizationCompleted ? 'bg-blue-500' : 'bg-green-500';
  const textColor = optimizationCompleted ? 'text-blue-700' : 'text-green-700';
  
  return (
    <div className="w-full">
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
        <div 
          className={`h-full ${barColor} transition-all duration-500 ease-in-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className={`text-xs ${textColor} font-semibold`}>
        Processed {current || 0} of {HPO_SAMPLES} rows
      </p>
    </div>
  );
};

interface FloatingMessageProps {
  message: string;
  rowCount: number | 0;
}

export const FloatingMessage = ({ message, rowCount }: FloatingMessageProps) => {
  
  const getMessageColor = (message: string): string => {
    if (message.toLowerCase().includes('starting')) return 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700';
    if (message.toLowerCase().includes('completed') || message.toLowerCase().includes('ran')) return 'bg-blue-100 border-l-4 border-blue-500 text-blue-700';
    if (message.toLowerCase().includes('running')) return 'bg-green-100 border-l-4 border-green-500 text-green-700';
    return 'bg-gray-100 border-l-4 border-gray-500 text-gray-700'; // default color
  };

  return (
    <div className={`fixed top-4 right-4 p-3 rounded-lg shadow-md z-10 min-w-[400px] max-w-[500px] w-[400px] ${getMessageColor(message)}`}>
      <p className="mb-2">{message}</p>
      {(rowCount !== null || message.toLowerCase().includes('optimization completed')) && (
        <ProgressBar current={rowCount} message={message} />
      )}
    </div>
  );
};
