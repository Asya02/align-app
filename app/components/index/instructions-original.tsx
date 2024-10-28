const MIN_LABELS_FOR_EVALUATION = Number(process.env.NEXT_PUBLIC_MIN_LABELS_FOR_EVALUATION);
const MIN_LABELS_FOR_OPTIMIZATION = Number(process.env.NEXT_PUBLIC_MIN_LABELS_FOR_OPTIMIZATION);
const MAX_UPLOAD_ROWS = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_ROWS);

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal = ({ isOpen, onClose }: InfoModalProps) => {
  if (!isOpen) return null;

  // Handle click on the overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="prose">
          <p>
            ALIGN Eval is a prototype tool to help you build and optimize LLM-evaluators by <strong>aligning annotators to AI output</strong>, and <strong>aligning AI to annotator input</strong>.
          </p>
          <p className="mt-4">
            Here&apos;s how it works:
          </p>
          
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <strong>Upload:</strong> Start by uploading a dataset containing input-output pairs to evaluate.
            </li>
            <li>
              <strong>Label:</strong> Then, annotate a subset for ground truth data in <strong className="text-yellow-600">Labeling mode</strong>.
            </li>
            <li>
              <strong>Evaluate:</strong> Once {MIN_LABELS_FOR_EVALUATION} samples are labeled, we unlock <strong className="text-green-600">Evaluation mode</strong>! Write and evaluate your evaluation prompt and get classification metrics.
            </li>
            <li>
              <strong>Optimize:</strong> Once {MIN_LABELS_FOR_OPTIMIZATION} samples are labeled, we unlock <strong className="text-blue-600">Optimization mode</strong>! It tries to improve your evaluation prompt! (And no, it&apos;s not dspy.)
            </li>
          </ol>

          <p className="mt-4">
            ALIGN Eval provides real-time metrics and feedback to help you develop more accurate and reliable LLM-evaluators.
          </p>
          <p className="mt-4">
            And while it&apos;s framed as a tool to build LLM-evaluators, you can use it to <strong>craft and optimize any LLM prompt that does binary classification</strong>!
          </p>
        </div>
      </div>
    </div>
  );
};

export const CsvUploadInstructions = () => (
  <div className="mb-4 bg-gray-100 border-l-4 border-gray-500 text-gray-700 p-4 rounded-lg shadow-md">
    <h2 className="font-bold mb-2">To get started, upload a CSV file</h2>
    <ul className="list-disc pl-5">
      <li>The CSV file must include the following columns:
        <ul className="list-circle pl-5">
          <li><strong><code>id</code></strong>: Unique identifier for each row.</li>
          <li><strong><code>input</code></strong>: Context used during <code>output</code> generation.</li>
          <li><strong><code>output</code></strong>: Generated text to be evaluated.</li>
          <li><strong><code>label</code></strong>: Ground truth (optional; can be left empty).</li>
        </ul>
      </li>
      <li>The <strong><code>label</code></strong> column must only contain values of 1 or 0, ideally in equal ratios.</li>
      <ul className="list-circle pl-5">
        <li><strong><code>0</code></strong>: Output <strong className="text-green-600">passes</strong> your evaluation criteria.</li>
        <li><strong><code>1</code></strong>: Output <strong className="text-red-600">fails</strong> your evaluation criteria.</li>
      </ul>
      <li>Only the first {MAX_UPLOAD_ROWS} rows will be uploaded to the database.</li>
      <li>To try it out, <a href="/data/fib50.csv" download className="text-blue-600 hover:text-blue-800 underline">download a sample csv</a> based on Factual Inconsistency Benchmark (<a href="https://huggingface.co/datasets/r-three/fib" className="text-blue-600 hover:text-blue-800 underline"target="_blank">details</a>).</li>
    </ul>
  </div>
);

interface LabelingModeInstructionsProps {
  labeledCount: number;
  minLabelsRequired: number;
}

export const LabelingModeInstructions = ({ labeledCount, minLabelsRequired }: LabelingModeInstructionsProps) => (
  <div className="mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-md">
    <h2 className="font-bold mb-2">Labeling Mode</h2>
    <p>
      To unlock <strong>Evaluation mode</strong>, label at least {minLabelsRequired} rows.
      Current progress: {labeledCount} / {minLabelsRequired} rows labeled.
    </p>
  </div>
);

interface EvaluationModeInstructionsProps {
  labeledCount: number;
  minLabelsForOptimization: number;
}

export const EvaluationModeInstructions = ({ minLabelsForOptimization }: EvaluationModeInstructionsProps) => (
  <div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-md">
    <h2 className="font-bold mb-2">Evaluation Mode</h2>
    <ul className="list-disc pl-5">
      <li>Enter your evaluator prompt below</li>
      <li>Select the evaluation model: gpt-4o-mini, claude-3-haiku</li>
      <li>Select the evaluation fields: input and output, output only</li>
      <li>Click the &quot;Evaluate&quot; button to run the LLM-evaluator on the input-output pairs.</li>
    </ul>
    <br />
    <p>
      To unlock <strong>Optimization mode</strong>, label and run evaluation on at least {minLabelsForOptimization} rows.
    </p>    
  </div>
);

export const OptimizationModeInstructions = () => (
  <div className="mb-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg shadow-md">
    <h2 className="font-bold mb-2">Optimization Mode</h2>
    <p>
      You have unlocked <strong>Optimization mode</strong>! Click the &quot;Optimize Evaluation Prompt&quot; button to optimize your evaluator prompt.
    </p>
  </div>
);
