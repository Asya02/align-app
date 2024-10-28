import { tektur } from "../fonts";
import { useState } from 'react';

// Add these color constants at the top of the file
const MAGIC_COLORS = [
  '#ff6933', // Orange-red
  '#c284e1', // Dark orchid
  '#ff80c3', // Deep pink
  '#b478ed', // Blue violet
  '#ffaf4d', // Dark orange
  '#e085dd', // Orchid
  '#66b3ff', // Light blue
];

interface OptimizationInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDontShowAgain: (dontShow: boolean) => void;
  showDontShowAgain?: boolean;
}

export const OptimizationInfoModal = ({ isOpen, onClose, onDontShowAgain, showDontShowAgain = true }: OptimizationInfoModalProps) => {
  // Add state to track checkbox
  const [isChecked, setIsChecked] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dontShowOptimizationModal') === 'true';
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
    return Array(count).fill(0).map(() => ({
      color: MAGIC_COLORS[Math.floor(Math.random() * MAGIC_COLORS.length)],
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
        {/* Top border */}
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

        {/* Left border */}
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

        {/* Right border */}
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
            🎮 Optimization Spell Guide 🎮
          </p>
          <br/>
          
          <div className="space-y-4">
            <section>
              <p className="mb-2">
                The optimization spell splits your labeled data into two sacred halves:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  🎲 <strong>Development (Dev Split):</strong> One half is sent to the arcane laboratory where optimization <strong>imbues</strong> your evaluation spell&apos;s with more power.
                </li>
                <li>
                  🎯 <strong>Test (Test Split):</strong> The other half is reserved for the proving grounds where your improved evaluation spell is <strong>tested</strong> against unseen challenges.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-semibold">⚠️ Beware, young mage!</h2>
              <p>
                Due to small sample sizes, your spell&apos;s power might vary between dev and test. A prompt that shows great power in the arcane laboratory might not maintain its strength in the proving grounds due to the <span className="relative">
                  <span className="relative">curse of overfitting</span>
                  <span className="absolute bottom-[-5px] left-0 w-full h-[4px]" style={{ 
                    background: '#ff0000',
                    transform: 'rotate(0.7deg) skew(45deg)',
                    opacity: 0.9
                  }}></span>
                </span>.
              </p>
              
              <p className="mt-4">
                🛠️ To craft a more powerful evaluation spell:
              </p>
              <ul className="list-disc pl-5">
                <li>💪 Look at and label more data to increase your XP to 100</li>
                <li>⚖️ Balance between <strong><code>1</code></strong> and <strong><code>0</code></strong> labels, and improve data diversity</li>
                <li> 🧪 Refine the optimized prompt based on your domain expertise</li>
              </ul>
            </section>

            <p className="text-sm italic mt-4">
              📌<strong>Alchemist&apos;s Tip:</strong> The true power of optimization comes from data quality and diversity!
            </p>
          </div>
        </div>

        {showDontShowAgain && (
          <div className="mt-4 flex items-center">
            <input
              type="checkbox"
              id="dontShowOptimizationAgain"
              checked={isChecked}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              onChange={handleCheckboxChange}
            />
            <label htmlFor="dontShowOptimizationAgain" className="ml-2 text-sm text-gray-600">
              Don&apos;t show this again
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
