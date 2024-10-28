'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getTableName } from '@/app/lib/utils';
import type { OptimizationResult } from '@/app/lib/definitions';
import { BackToMainButton, DeleteOptimizationsButton } from '@/app/components/optimize/buttons';
import { PasswordPrompt } from '@/app/components/optimize/passwordPrompt';
import { OptimizationTable } from '@/app/components/optimize/table';
import Image from 'next/image';
import { OptimizationInfoModal } from '@/app/components/optimize/instructions';
import { FloatingMessage } from '@/app/components/optimize/floating';

const DELETE_OPTIMIZATION_PASSWORD = process.env.NEXT_PUBLIC_DELETE_OPTIMIZATION_PASSWORD;

export default function OptimizePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [results, setResults] = useState<OptimizationResult[]>([]);
  const [message, setMessage] = useState<string>('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(() => {
    // Check localStorage on initial render
    if (typeof window !== 'undefined') {
      const dontShow = localStorage.getItem('dontShowOptimizationModal');
      return dontShow !== 'true';
    }
    return true;
  });
  const [rowCount, setRowCount] = useState<number | null>(null);

  const fetchResults = useCallback(async () => {
    try {
      const fileName = searchParams.get('fileName');
      if (!fileName) {
        throw new Error('No file name provided');
      }
      const tableName = getTableName(fileName);
      const response = await fetch(`/api/optimize?tableName=${tableName}`);
      if (!response.ok) {
        throw new Error('Fetching optimization results...');
      }
      const data = await response.json();
      setResults(data.results);
      setMessage(data.message || '');
      setRowCount(data.rowCount || 0);
    } catch (err) {
      console.error('Error fetching results:', err);
      setMessage((err as Error).message);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchResults();
    const intervalId = setInterval(fetchResults, 1000); // Poll every 5 seconds

    return () => clearInterval(intervalId);
  }, [fetchResults]);

  const handleBackToMain = () => {
    const fileName = searchParams.get('fileName');
    if (fileName) {
      router.push(`/?fileName=${encodeURIComponent(fileName)}`);
    } else {
      router.push('/');
    }
  };

  const handleDeleteOptimizations = () => {
    const fileName = searchParams.get('fileName');
    if (!fileName) {
      setMessage('No file name provided');
      return;
    }
    setShowPasswordPrompt(true);
  };

  const confirmDelete = async (password: string): Promise<boolean> => {
    if (password !== DELETE_OPTIMIZATION_PASSWORD) {
      return false; // Password is incorrect
    }

    try {
      const tableName = getTableName(searchParams.get('fileName')!);
      const response = await fetch('/api/optimize', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete optimization data');
      }

      alert('Optimization data deleted successfully');
      router.push(`/?fileName=${encodeURIComponent(searchParams.get('fileName')!)}`);
      return true;
    } catch (err) {
      console.error('Error deleting optimization data:', err);
      setMessage((err as Error).message);
      return false;
    }
  };

  // Add this handler function
  const handleDontShowAgain = (dontShow: boolean) => {
    localStorage.setItem('dontShowOptimizationModal', dontShow.toString());
  };

  return (
    <div className="container-fluid p-4 bg-white text-gray-900">
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center cursor-pointer hover:opacity-80">
          <Image
            src="/favicon.svg"
            alt="ALIGN Eval Logo"
            width={28}
            height={28}
            className="mr-2"
          />
          ALIGN Eval: Optimization Metrics
          <button
            onClick={() => setShowInfoModal(true)}
            className="ml-2 text-gray-500 hover:text-gray-700"
            aria-label="Information about optimization"
          >
            <Image
              src="/info-icon.svg"
              alt="Info Icon"
              width={18}
              height={18}
              className="mr-2"
            />
          </button>
        </h1>
      </div>
      <h2 className="text-gray-600 -mt-2 mb-4">
        ⚠️ Optimization mode is <strong>currently in beta</strong> and does not reliably improve the original LLM-evaluator. ⚠️
      </h2>

      <OptimizationInfoModal 
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        onDontShowAgain={handleDontShowAgain}
      />

      <FloatingMessage message={message} rowCount={rowCount ?? 0} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <BackToMainButton onClick={handleBackToMain} />
        <DeleteOptimizationsButton onClick={handleDeleteOptimizations} />
      </div>

      {showPasswordPrompt && (
        <PasswordPrompt
          onConfirm={async (password) => {
            const success = await confirmDelete(password);
            if (success) {
              setShowPasswordPrompt(false);
            }
            return success;
          }}
          onCancel={() => setShowPasswordPrompt(false)}
        />
      )}

      <div className="overflow-x-auto bg-white">
        <OptimizationTable results={results} />
      </div>
    </div>
  );
}
