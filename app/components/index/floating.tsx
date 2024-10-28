const MIN_LABELS_FOR_EVALUATION = Number(process.env.NEXT_PUBLIC_MIN_LABELS_FOR_EVALUATION);
const MIN_LABELS_FOR_OPTIMIZATION = Number(process.env.NEXT_PUBLIC_MIN_LABELS_FOR_OPTIMIZATION);

interface ProgressBarProps {
  current: number;
}

export const ProgressBar = ({ current }: ProgressBarProps) => {
  const percentage = Math.min((current / MIN_LABELS_FOR_OPTIMIZATION) * 100, 100);
  const midOptimizationPoint = Math.floor((MIN_LABELS_FOR_EVALUATION + MIN_LABELS_FOR_OPTIMIZATION) / 2);
  
  let barColor = 'bg-red-500';
  let messageColor = 'text-red-700';
  let message = `Let's get to work! Label ${MIN_LABELS_FOR_EVALUATION - current} rows for evaluation mode! 💪`;

  if (current >= MIN_LABELS_FOR_OPTIMIZATION) {
    barColor = 'bg-blue-500';
    messageColor = 'text-blue-700';
    message = 'Amazing work! Optimization mode unlocked! 🎉';
  } else if (current >= midOptimizationPoint) {
    barColor = 'bg-gradient-to-r from-green-500 to-blue-400 transition duration-300 ease-in-out animate-pulse relative overflow-hidden';
    messageColor = 'text-blue-700';
    message = `Almost at optimization model! Just label ${MIN_LABELS_FOR_OPTIMIZATION - current} more! 🚀`;
  } else if (current >= MIN_LABELS_FOR_EVALUATION) {
    barColor = 'bg-green-500';
    messageColor = 'text-green-700';
    message = `Evaluation unlocked! ${MIN_LABELS_FOR_OPTIMIZATION - current} more for optimization mode! 🫡`;
  } else if (current >= MIN_LABELS_FOR_EVALUATION / 2) {
    barColor = 'bg-yellow-500';
    messageColor = 'text-yellow-700';
    message = `Almost to evaluation mode! Just label ${MIN_LABELS_FOR_EVALUATION - current} more! 🔥`;
  }

  return (
    <div className="w-full">
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
        <div 
          className={`h-full ${barColor} transition-all duration-500 ease-in-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className={`text-xs ${messageColor} font-semibold`}>
        {message}
      </p>
    </div>
  );
};

interface MetricsProps {
  sampleSize: number;
  recall: number;
  precision: number;
  f1: number;
  cohensKappa: number;
  truePositives: number;
  trueNegatives: number;
  falsePositives: number;
  falseNegatives: number;
  labeledRows: number;
}

export const FloatingMetrics = ({
  sampleSize,
  recall,
  precision,
  f1,
  cohensKappa,
  truePositives,
  trueNegatives,
  falsePositives,
  falseNegatives,
  labeledRows
}: MetricsProps) => {
  return (
    <div className="fixed top-4 right-4 bg-gray-100 p-3 rounded-lg shadow-md z-10 min-w-[300px]">
      <h3 className="text-lg font-semibold mb-2">
        Metrics <span className="font-normal">(sample size={sampleSize})</span>
      </h3>
      <p>Recall: {recall.toFixed(2)}, Precision: {precision.toFixed(2)}</p>
      <p>F1: {f1.toFixed(2)}, Cohen&apos;s κ: {cohensKappa.toFixed(2)}</p>
      <p>TP: {truePositives}, TN: {trueNegatives}, FP: {falsePositives}, FN: {falseNegatives}</p>
      
      {/* Progress bar section */}
      <div className="mt-3 pt-3 border-t border-gray-300">
        <div className="mb-2">
          <ProgressBar current={labeledRows} />
        </div>
      </div>
    </div>
  );
};

interface LabeledSamplesProps {
  labeledCount: number;
  minLabelsRequired: number;
}

export const FloatingLabeledSamples = ({
  labeledCount,
}: LabeledSamplesProps) => {
  return (
    <div className="fixed top-4 right-4 bg-gray-100 p-3 rounded-lg shadow-md z-10 min-w-[300px]">
      <h3 className="text-lg font-semibold mb-2">
        Labeled Samples ({labeledCount} / {MIN_LABELS_FOR_OPTIMIZATION})
      </h3>
      <div className="mb-2">
        <ProgressBar current={labeledCount} />
      </div>
    </div>
  );
};

interface SiteMetricsProps {
  uploadFileCount: number;
  uploadRowCount: number;
  labeledFileCount: number;
  labeledRowCount: number;
  evaluateFileCount: number;
  evaluateRowCount: number;
  optimizedFileCount: number;
  optimizedTrialCount: number;
}

export const FloatingSiteMetrics = ({
  uploadFileCount,
  uploadRowCount,
  labeledFileCount,
  labeledRowCount,
  evaluateFileCount,
  evaluateRowCount,
  optimizedFileCount,
  optimizedTrialCount
}: SiteMetricsProps) => {
  return (
    <div className="fixed top-4 right-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg shadow-md z-10">
      <h4 className="text-lg font-semibold mb-2">Usage Statistics</h4>
      <div className="text-sm">
        <div>
          <p><strong>Uploaded:</strong> {uploadFileCount} files, {uploadRowCount} rows</p>
          <p><strong>Labeled:</strong> {labeledFileCount} files, {labeledRowCount} rows</p>
          <p><strong>Evaluated:</strong> {evaluateFileCount} files, {evaluateRowCount} rows</p>
          <p><strong>Optimized:</strong> {optimizedFileCount} files, {optimizedTrialCount} trials</p>
        </div>
      </div>
    </div>
  );
};
