import { tektur } from '@/app/components/fonts';
import { useState } from 'react';

const MIN_LABELS_FOR_EVALUATION = Number(process.env.NEXT_PUBLIC_MIN_LABELS_FOR_EVALUATION);
const MIN_LABELS_FOR_OPTIMIZATION = Number(process.env.NEXT_PUBLIC_MIN_LABELS_FOR_OPTIMIZATION);
const MAX_UPLOAD_ROWS = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_ROWS);

// Add this at the top of the file with other constants
const STONE_COLORS = ['#7d7d7d', '#696969', '#808080', '#8b8b8b'];
const GRASS_COLORS = ['#3a8024', '#2d7118', '#458b2f', '#347321'];
const DIRT_COLORS = ['#8b4513', '#7a3b10', '#9c4e17', '#6d3411'];

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDontShowAgain: (dontShow: boolean) => void;
  showDontShowAgain?: boolean;
}

export const InfoModal = ({ isOpen, onClose, onDontShowAgain, showDontShowAgain = true }: InfoModalProps) => {
  // Add state to track checkbox
  const [isChecked, setIsChecked] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dontShowInfoModal') === 'true';
    }
    return false;
  });

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked;
    setIsChecked(newChecked);
    onDontShowAgain(newChecked);
  };

  // Generate pixelated border segments
  const generatePixels = (count: number) => {
    const allColors = [...STONE_COLORS, ...GRASS_COLORS, ...DIRT_COLORS];
    return Array(count).fill(0).map(() => ({
      color: allColors[Math.floor(Math.random() * allColors.length)],
      offset: Math.random() > 0.6 ? '0.4px' : '0px',
    }));
  };

  const topPixels = generatePixels(64);
  const leftPixels = generatePixels(64);
  const rightPixels = generatePixels(64);
  const bottomPixels = generatePixels(64);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative [image-rendering:pixelated] overflow-hidden">
        {/* Top border - pixelated stone */}
        <div className="absolute top-0 left-0 right-0 h-[8px] flex">
          {topPixels.map((pixel, i) => (
            <div
              key={`top-${i}`}
              className="flex-1 h-full"
              style={{
                backgroundColor: pixel.color,
                transform: `translateY(${pixel.offset})`
              }}
            />
          ))}
        </div>

        {/* Left border - pixelated stone */}
        <div className="absolute top-0 left-0 bottom-0 w-[8px] flex flex-col">
          {leftPixels.map((pixel, i) => (
            <div
              key={`left-${i}`}
              className="flex-1 w-full"
              style={{
                backgroundColor: pixel.color,
                transform: `translateX(${pixel.offset})`
              }}
            />
          ))}
        </div>

        {/* Right border - pixelated stone */}
        <div className="absolute top-0 right-0 bottom-0 w-[8px] flex flex-col">
          {rightPixels.map((pixel, i) => (
            <div
              key={`right-${i}`}
              className="flex-1 w-full"
              style={{
                backgroundColor: pixel.color,
                transform: `translateX(${pixel.offset})`
              }}
            />
          ))}
        </div>

        {/* Bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-[8px] flex">
          {bottomPixels.map((pixel, i) => (
            <div
              key={`bottom-${i}`}
              className="flex-1 h-full"
              style={{
                backgroundColor: pixel.color,
                transform: `translateY(${pixel.offset})`
              }}
            />
          ))}
        </div>

        {/* Shadow effect */}
        <div className="absolute -bottom-1 -right-1 w-full h-full bg-black opacity-30 translate-x-1 translate-y-1 -z-10"></div>

        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="prose">
          <p className="text-xl font-bold text-center" style={{ fontFamily: tektur.style.fontFamily }}>
            🎮 Welcome to AlignEval! 🎮
          </p>
          <br />
          <p>
            AlignEval is a <strong>game/tool</strong> to help you build and optimize LLM-evaluators. We do so by <span className="relative">
              <span className="relative">aligning annotators to AI output</span>
              <span className="absolute bottom-[-5px] left-0 w-full h-[4px]" style={{
                background: '#ff0000',
                transform: 'rotate(-0.5deg) skew(-30deg)',
                opacity: 0.9
              }}></span>
            </span>, and <span className="relative">
              <span className="relative">aligning AI to annotator input</span>
              <span className="absolute bottom-[-5px] left-0 w-full h-[4px]" style={{
                background: '#ff0000',
                transform: 'rotate(0.7deg) skew(45deg)',
                opacity: 0.9
              }}></span>
            </span>.
          </p>
          <p className="mt-4 mb-2">
            To progress, gain XP by adding labels while you <strong>look at your data</strong>.
          </p>

          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <strong>🐣 Upload:</strong> Initialize your character by uploading a csv containing input-output pairs. Having existing labels counts towards your XP!
            </li>
            <li>
              <strong>👀 Label:</strong> As a <strong className="text-yellow-600">Labeling Novice</strong>, <strong>look at your data and label it</strong>. Each labeled sample gets you 1 XP. Gain {MIN_LABELS_FOR_EVALUATION} XP to progress to the next character class!
            </li>
            <li>
              <strong>💥 Evaluate:</strong> At {MIN_LABELS_FOR_EVALUATION} XP, you&apos;re now an <strong className="text-green-600">Evaluation Adept</strong>! You can now craft evaluation prompts and cast the <strong>&quot;Evaluate&quot;</strong> spell on your data.
            </li>
            <li>
              <strong>🔮 Optimize:</strong> At {MIN_LABELS_FOR_OPTIMIZATION} XP, you&apos;re now an <strong className="text-blue-600">Optimization Master</strong>! Improve your LLM-evaluators with the unlocked <strong>&quot;Optimize&quot;</strong> spell. (No, it&apos;s not dspy.)
            </li>
          </ol>

          <p className="mt-4">
            <strong>New Game+:</strong> While we frame AlignEval as a game to build LLM-evaluators, you can use it to craft and optimize <strong>any prompt that does binary classification</strong>!
          </p>
          <p className="text-sm italic mt-4">
            AlignEval is currently a public beta. Read <a href="https://eugeneyan.com/writing/aligneval/" className="text-blue-600 hover:text-blue-800 underline" target="_blank">how it was built</a> or share feedback on <a href="https://github.com/eugeneyan/align-app" className="text-blue-600 hover:text-blue-800 underline" target="_blank">GitHub</a> or <a href="https://x.com/eugeneyan" className="text-blue-600 hover:text-blue-800 underline" target="_blank">X</a>.
          </p>
        </div>

        {showDontShowAgain && (
          <div className="mt-4 flex items-center">
            <input
              type="checkbox"
              id="dontShowAgain"
              checked={isChecked}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              onChange={handleCheckboxChange}
            />
            <label htmlFor="dontShowAgain" className="ml-2 text-sm text-gray-600">
              Don&apos;t show this again
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export const InfoModalMobile = ({ isOpen, onClose, onDontShowAgain, showDontShowAgain = true }: InfoModalProps) => {
  // Add state to track checkbox
  const [isChecked, setIsChecked] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dontShowInfoModal') === 'true';
    }
    return false;
  });

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked;
    setIsChecked(newChecked);
    onDontShowAgain(newChecked);
  };

  // Generate pixelated border segments
  const generatePixels = (count: number) => {
    const allColors = [...STONE_COLORS, ...GRASS_COLORS, ...DIRT_COLORS];
    return Array(count).fill(0).map(() => ({
      color: allColors[Math.floor(Math.random() * allColors.length)],
      offset: Math.random() > 0.6 ? '0.4px' : '0px',
    }));
  };

  const topPixels = generatePixels(64);
  const leftPixels = generatePixels(64);
  const rightPixels = generatePixels(64);
  const bottomPixels = generatePixels(64);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg w-full p-4 relative [image-rendering:pixelated] overflow-hidden">
        {/* Top border - pixelated stone */}
        <div className="absolute top-0 left-0 right-0 h-[8px] flex">
          {topPixels.map((pixel, i) => (
            <div
              key={`top-${i}`}
              className="flex-1 h-full"
              style={{
                backgroundColor: pixel.color,
                transform: `translateY(${pixel.offset})`
              }}
            />
          ))}
        </div>

        {/* Left border - pixelated stone */}
        <div className="absolute top-0 left-0 bottom-0 w-[8px] flex flex-col">
          {leftPixels.map((pixel, i) => (
            <div
              key={`left-${i}`}
              className="flex-1 w-full"
              style={{
                backgroundColor: pixel.color,
                transform: `translateX(${pixel.offset})`
              }}
            />
          ))}
        </div>

        {/* Right border - pixelated stone */}
        <div className="absolute top-0 right-0 bottom-0 w-[8px] flex flex-col">
          {rightPixels.map((pixel, i) => (
            <div
              key={`right-${i}`}
              className="flex-1 w-full"
              style={{
                backgroundColor: pixel.color,
                transform: `translateX(${pixel.offset})`
              }}
            />
          ))}
        </div>

        {/* Bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-[8px] flex">
          {bottomPixels.map((pixel, i) => (
            <div
              key={`bottom-${i}`}
              className="flex-1 h-full"
              style={{
                backgroundColor: pixel.color,
                transform: `translateY(${pixel.offset})`
              }}
            />
          ))}
        </div>

        {/* Shadow effect */}
        <div className="absolute -bottom-1 -right-1 w-full h-full bg-black opacity-30 translate-x-1 translate-y-1 -z-10"></div>

        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="prose prose-sm">
          <p className="text-lg font-bold text-center" style={{ fontFamily: tektur.style.fontFamily }}>
            🎮 Welcome to ALIGN Eval! 🎮
          </p>
          <br />
          <p className="text-sm">
            ALIGN Eval is a <strong>game</strong> to help you build and optimize LLM-evaluators. We do so by <span className="relative">
              <span className="relative">aligning annotators to AI output</span>
              <span className="absolute bottom-[-3px] left-0 w-full h-[3px]" style={{
                background: '#ff0000',
                transform: 'rotate(-0.5deg) skew(-30deg)',
                opacity: 0.9
              }}></span>
            </span>, and <span className="relative">
              <span className="relative">aligning AI to annotator input</span>
              <span className="absolute bottom-[-3px] left-0 w-full h-[3px]" style={{
                background: '#ff0000',
                transform: 'rotate(0.7deg) skew(45deg)',
                opacity: 0.9
              }}></span>
            </span>.
          </p>
          <p className="mt-3 mb-2 text-sm">
            To progress, gain XP by adding labels while you <strong>look at your data</strong>.
          </p>

          <ol className="list-decimal pl-4 space-y-1 text-sm">
            <li>
              <strong>🐣 Upload:</strong> Initialize your character by uploading a csv containing input-output pairs.
            </li>
            <li>
              <strong>👀 Label:</strong> As a <strong className="text-yellow-600">Labeling Novice</strong>, label your data. Each labeled sample gets you 1 XP. Gain {MIN_LABELS_FOR_EVALUATION} XP to progress!
            </li>
            <li>
              <strong>💥 Evaluate:</strong> At {MIN_LABELS_FOR_EVALUATION} XP, you become an <strong className="text-green-600">Evaluation Adept</strong> and unlock the <strong>&quot;Evaluate&quot;</strong> spell.
            </li>
            <li>
              <strong>🔮 Optimize:</strong> At {MIN_LABELS_FOR_OPTIMIZATION} XP, you become an <strong className="text-blue-600">Optimization Master</strong> and unlock the <strong>&quot;Optimize&quot;</strong> spell.
            </li>
          </ol>

          <p className="mt-3 text-sm">
            <strong>New Game+:</strong> While we frame ALIGN Eval as a game to build LLM-evaluators, you can use it to craft and optimize <strong>any prompt that does binary classification</strong>!
          </p>
          <p className="text-xs italic mt-3">
            ALIGN Eval is in beta. Share feedback on <a href="https://github.com/eugeneyan/align-app" className="text-blue-600 hover:text-blue-800 underline" target="_blank">GitHub</a> or <a href="https://x.com/eugeneyan" className="text-blue-600 hover:text-blue-800 underline" target="_blank">X</a>.
          </p>
        </div>

        {showDontShowAgain && (
          <div className="mt-3 flex items-center">
            <input
              type="checkbox"
              id="dontShowAgain"
              checked={isChecked}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              onChange={handleCheckboxChange}
            />
            <label htmlFor="dontShowAgain" className="ml-2 text-xs text-gray-600">
              Don&apos;t show this again
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export const CsvUploadInstructions = () => {

  const handleDownloadSample = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const fileName = prompt('Please name the sample csv for download:', '.csv');

    if (!fileName) return; // User cancelled

    // Create a temporary link and trigger the download with the custom filename
    const link = document.createElement('a');
    link.href = '/data/fib50.csv';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mb-4 bg-gray-100 border-l-4 border-gray-500 text-gray-700 p-4 rounded-lg shadow-md">
      <h2 className="font-bold mb-2 text-2xl" style={{ fontFamily: tektur.style.fontFamily }}>🎮 To begin, initialize your character with a CSV file!</h2>
      <ul className="list-disc pl-5">
        <li>📜 The CSV file must include the following columns:
          <ul className="pl-5">
            <li><strong><code>id</code></strong>: Unique identifier for each row</li>
            <li><strong><code>input</code></strong>: Context used to generate <code>output</code></li>
            <li><strong><code>output</code></strong>: Generated text to be evaluated</li>
            <li><strong><code>label</code></strong>: Ground truth (values optional but counts towards XP)</li>
          </ul>
        </li>
        <li>
          🚨 The <strong><code>label</code></strong> column only accepts binary labels, either <strong><code>0</code></strong> or <strong><code>1</code></strong>.
          <ul className="pl-5">
            <li><strong><code>0</code></strong>: Output <strong className="text-green-600">PASSES</strong> your evaluation</li>
            <li><strong><code>1</code></strong>: Output <strong className="text-red-600">FAILS</strong> your evaluation</li>
          </ul>
        </li>
        <li>🚫 <strong>Character XP limit</strong>: Only the first {MAX_UPLOAD_ROWS} rows will be uploaded and considered for XP.</li>
        <li>
          🎁 <strong>Starter pack</strong>: <a
            href="#"
            onClick={handleDownloadSample}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Download a partially labeled CSV
          </a> from the Factual Inconsistency Benchmark (<a
            href="https://huggingface.co/datasets/r-three/fib"
            className="text-blue-600 hover:text-blue-800 underline"
            target="_blank"
          >
            details
          </a>).
        </li>
        <li>
          📌 <strong>Pro tip</strong>: For maximum effectiveness on &quot;Evaluate&quot; and &quot;Optimize&quot;, have a balance of <strong><code>1</code></strong> and <strong><code>0</code></strong> labels.
        </li>
      </ul>
    </div>
  );
};

interface LabelingModeInstructionsProps {
  labeledCount: number;
  minLabelsRequired: number;
}

export const LabelingModeInstructions = ({ labeledCount, minLabelsRequired }: LabelingModeInstructionsProps) => (
  <div className="mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-md">
    <h2 className="font-bold mb-2 text-2xl" style={{ fontFamily: tektur.style.fontFamily }}>🐣 Labeling Novice - Training Grounds</h2>
    <div className="space-y-2">
      <p>
        <strong>Current XP:</strong> {labeledCount} / {minLabelsRequired}
      </p>
      <div className="w-full bg-yellow-200 rounded-full h-4 border border-yellow-300">
        <div
          className="bg-yellow-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min((labeledCount / minLabelsRequired) * 100, 100)}%` }}
        ></div>
      </div>
      <p>
        🧭 <strong>Quest:</strong> Label {minLabelsRequired} rows to level up and unlock the <strong>&quot;Evaluate&quot;</strong> spell
      </p>
      <p className="text-sm italic mt-2">
        📌 <strong>Beginner&apos;s hint:</strong> Each labeled row grants +1 XP. Keep going, young apprentice!
      </p>
    </div>
  </div>
);

interface EvaluationModeInstructionsProps {
  minLabelsForOptimization: number;
}

export const EvaluationModeInstructions = ({ minLabelsForOptimization }: EvaluationModeInstructionsProps) => (
  <div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-md">
    <h2 className="font-bold mb-2 text-2xl" style={{ fontFamily: tektur.style.fontFamily }}>🧝 Evaluation Adept - Study Halls</h2>
    <div className="space-y-3">
      <p>
        🎉 <strong>Achievement Unlocked:</strong> You can now cast the <strong>&quot;Evaluate&quot;</strong> spell!
      </p>

      <div className="bg-green-50 p-3 rounded-lg">
        <p className="font-bold mb-2">⚗️ Spell Preparation:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>📝 Write your evaluation prompt based on what you&apos;ve seen in the data</li>
          <li> ⚖️ The prompt should focus on a single aspect and return 0 (pass) or 1 (fail)</li>
          <li>🦉 Choose your magical companion: GigaChat-2-Max, gpt-4o-mini, or claude-3-haiku</li>
          <li>🍄 Choose your evaluation strategy: Input and Output, or Output Only</li>
          <li>💥 Cast <strong>&quot;Evaluate&quot;</strong> to begin assessing your spell!</li>
        </ul>
      </div>

      <div className="mt-4">
        <p>
          🔒 <strong>Next Level:</strong> Label and evaluate {minLabelsForOptimization} rows to unlock the legendary <strong>&quot;Optimize&quot;</strong> spell
        </p>
        <p className="text-sm italic mt-2">
          📌 <strong>Pro tip:</strong> The more data you evaluate, the more powerful your optimization spell becomes!
        </p>
      </div>
    </div>
  </div>
);

export const OptimizationModeInstructions = () => (
  <div className="mb-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg shadow-md">
    <h2 className="font-bold mb-2 text-2xl" style={{ fontFamily: tektur.style.fontFamily }}>🧙 Optimization Master - Arcane Sanctum</h2>
    <div className="space-y-3">
      <p>
        🎉 <strong>Legendary Achievement Unlocked:</strong> You can now cast the <strong>&quot;Optimize&quot;</strong> spell!
      </p>

      <div className="bg-blue-50 p-3 rounded-lg">
        <ul className="list-disc pl-5 space-y-2">
          <li>⚙️ Your evaluator prompt will be optimized by ancient AI wisdom</li>
          <li>📊 Battle-tested against your labeled samples; refined for accuracy</li>
          <li>🎲 Cast <strong>&quot;Optimize&quot;</strong> to begin the enhancement!</li>
        </ul>
      </div>

      <div className="mt-4">
        <p className="text-sm italic mt-2">
          📌 <strong>Archmage&apos;s advice:</strong> Optimization works best when you have a diverse set of samples. Keep expanding your data for better results!
        </p>
      </div>
    </div>
  </div>
);
