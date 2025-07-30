'use client';

import { DeleteButton, DownloadButton, FileUploadButton } from '@/app/components/index/buttons';
import {
  ClearEvaluationsButton,
  EvaluateButton,
  EvaluationFieldsDropdown,
  ModelFieldsDropdown,
  OptimizeButton,
  PromptTextArea
} from '@/app/components/index/evalControls';
import { FloatingLabeledSamples, FloatingMetrics, FloatingSiteMetrics } from '@/app/components/index/floating';
import { CsvUploadInstructions, EvaluationModeInstructions, InfoModal, InfoModalMobile, LabelingModeInstructions, OptimizationModeInstructions } from '@/app/components/index/instructions';
import { Table } from '@/app/components/index/table';
import { MAX_TRIALS } from '@/app/lib/constants';
import type { Eval } from '@/app/lib/definitions';
import { computeMetrics } from '@/app/lib/metrics';
import { getTableName } from '@/app/lib/utils';
import { saveAs } from 'file-saver';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMediaQuery } from 'react-responsive';

// Add this with other constants at the top
const MAX_UPLOAD_ROWS = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_ROWS);

export default function Home() {
  const MIN_LABELS_FOR_EVALUATION = Number(process.env.NEXT_PUBLIC_MIN_LABELS_FOR_EVALUATION);
  const MIN_LABELS_FOR_OPTIMIZATION = Number(process.env.NEXT_PUBLIC_MIN_LABELS_FOR_OPTIMIZATION);
  const POLL_INTERVAL = 1000; // milliseconds
  const defaultPrompt = "Check if the output has hallucinations. If so, return the prediction of 1. Else, return 0."

  const router = useRouter();
  const searchParams = useSearchParams();

  const [fileName, setFileName] = useState<string | null>(null)
  const [data, setData] = useState<Eval[]>([])
  const [prompt, setPrompt] = useState(defaultPrompt)
  const [editingCell, setEditingCell] = useState<{ id: number, key: string, value: string } | null>(null)
  const editableRef = useRef<HTMLDivElement>(null)

  const [showEvaluationControls, setShowEvaluationControls] = useState(false);
  const [model, setModel] = useState<'gpt-4o-mini' | 'claude-3-5-haiku-20241022' | 'claude-3-haiku-20240307' | 'GigaChat-2-Max'>('GigaChat-2-Max');
  const [evaluationFields, setEvaluationFields] = useState<'inputAndOutput' | 'outputOnly'>('inputAndOutput');
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evaluationAlertShown, setEvaluationAlertShown] = useState(false);
  const [optimizationAlertShown, setOptimizationAlertShown] = useState(false);

  const [shouldFetchFromUrl, setShouldFetchFromUrl] = useState(true);
  const metrics = useMemo(() => computeMetrics(data), [data]);
  const [siteMetrics, setSiteMetrics] = useState<{ [key: string]: number }>({});
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(() => {
    // Check localStorage on initial render
    if (typeof window !== 'undefined') {
      const dontShow = localStorage.getItem('dontShowInfoModal');
      return dontShow !== 'true';
    }
    return true;
  });

  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Load data for the table
  const fetchData = useCallback(async (newFileName?: string) => {
    const fileNameToUse = newFileName || fileName
    if (!fileNameToUse) return
    try {
      const response = await fetch(`/api/upload?fileName=${encodeURIComponent(fileNameToUse)}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      if (result.error) {
        throw new Error(result.error)
      }
      setData(result)
      if (newFileName) {
        setFileName(newFileName)
        router.push(`/?fileName=${encodeURIComponent(newFileName)}`, undefined)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setData([])
      setFileName(null)
      router.push('/', undefined)
      if (error instanceof Error) {
        alert(`The data for the file "${fileNameToUse}" does not exist. Please upload a valid CSV file.`)
      }
    }
  }, [router, fileName]);

  // Reset the application state when deleting data or uploading a new file
  const handleReset = useCallback(() => {
    setData([]);
    setFileName(null);
    setShowEvaluationControls(false);
    setOptimizationAlertShown(false);
    setShouldFetchFromUrl(false);
    router.push('/', undefined);
  }, [router]);

  // Upload a file to the server
  const handleUpload = useCallback(async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (response.ok) {
      const result = await response.json()
      setFileName(file.name)

      if (result.tableExists) {
        alert(`File "${file.name}" already exists. Displaying existing data.`)
      } else {
        alert(`File processed successfully. ${result.insertedRows} rows inserted (maximum of ${MAX_UPLOAD_ROWS}).`)
      }

      await fetchData(file.name)
      router.push(`/?fileName=${encodeURIComponent(file.name)}`)
    } else {
      alert('Failed to upload file. Please try again.')
    }
  }, [fetchData, router]);

  // Reset the application state if new file is selected
  const handleFileSelect = useCallback((file: File | null) => {
    if (!file) return;

    if (file.name === fileName) {
      alert(`File "${file.name}" already exists. Displaying existing data.`);
      return;
    }

    handleReset();
    setFileName(file.name);
    handleUpload(file);
  }, [fileName, handleReset, handleUpload]);

  // Delete data for the current file
  const handleDeleteData = async () => {
    const confirmTruncate = window.confirm("Are you sure you want to delete all uploaded data? This action cannot be undone.");
    if (!confirmTruncate) return;

    if (!fileName) {
      alert("No file is currently loaded.");
      return;
    }

    try {
      const response = await fetch(`/api/update?fileName=${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        handleReset();
        router.push('/');
        alert(`${fileName} has been deleted.`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete "${fileName}"`);
      }
    } catch (error) {
      console.error(`Error deleting "${fileName}":`, error);
      alert(`Failed to delete "${fileName}". Please try again.`);
    }
  };

  // Start the evaluation process
  const handleEvaluate = async () => {
    if (!fileName) {
      alert("No file is currently loaded. Please upload a file first.");
      return;
    }

    // First, fetch the latest data to check the labels
    const response = await fetch(`/api/upload?fileName=${encodeURIComponent(fileName)}`);
    const latestData = await response.json();

    if (latestData.error) {
      alert(`Error fetching data: ${latestData.error}`);
      return;
    }

    // Count the number of non-empty labels
    const validLabelCount = latestData.filter((row: { label?: string }) => row.label && row.label.trim() !== '').length;
    if (validLabelCount < MIN_LABELS_FOR_EVALUATION) {
      alert(`Please label at least ${MIN_LABELS_FOR_EVALUATION} rows before evaluating.`);
      return;
    }

    setIsEvaluating(true)

    const evaluateResponse = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, evaluationFields, fileName, model }) // Add model here
    });

    if (evaluateResponse.ok) {
      pollEval()
    } else {
      setIsEvaluating(false)
      alert('Failed to start evaluation process')
    }
  }

  // Stop the evaluation process
  const handleStopEvaluation = async () => {
    const response = await fetch('/api/evaluate', {
      method: 'DELETE',
    });

    if (response.ok) {
      setIsEvaluating(false)
      alert('Evaluation process stopped')
    } else {
      alert('Failed to stop evaluation process')
    }
  }

  // Clear explanations and predictions
  const handleClearEvaluations = async () => {
    const confirmClear = window.confirm("Are you sure you want to clear all evaluations? This action cannot be undone.");
    if (!confirmClear) return;

    const response = await fetch('/api/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clearEvaluations', fileName })
    });

    if (response.ok) {
      await fetchData();
      alert("All evaluations have been cleared.");
    } else {
      alert("Failed to clear evaluations. Please try again.");
    }
  };

  // Poll the evaluation API to get the results
  const pollEval = useCallback(async () => {
    if (!isEvaluating || !fileName) return

    const response = await fetch(`/api/evaluate?fileName=${encodeURIComponent(fileName)}`)
    const { results: newResults, isEvaluationRunning } = await response.json()

    // Update the existing data with new results
    setData(prevData => prevData.map(row => {
      const newResult = newResults.find((result: Eval) => result.id === row.id)
      if (newResult) {
        return {
          ...row,
          explanation: newResult.explanation || row.explanation,
          prediction: newResult.prediction || row.prediction
        }
      }
      return row
    }))

    // Check if processing is complete
    if (!isEvaluationRunning) {
      setIsEvaluating(false)
    }
  }, [isEvaluating, fileName])

  // Edit a cell
  const handleCellEdit = async (id: number, key: string, value: string) => {
    // If it's a label button click, update immediately
    if (key === 'label') {
      try {
        const response = await fetch('/api/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            fileName,
            [key]: value
          })
        })

        if (!response.ok) {
          throw new Error('Failed to update cell')
        }

        await fetchData()
        checkLabelCount()
      } catch (error) {
        console.error('Error updating cell:', error)
        alert('Failed to update cell. Please try again.')
      }
      return
    }

    // For other cells, handle as before
    setEditingCell({ id, key, value })
  }

  // Update a cell
  const handleCellUpdate = async () => {
    console.log(`handleCellUpdate: ${editingCell}`)
    if (!editingCell || !fileName) return

    const { id, key } = editingCell
    // If we're using the contentEditable div, get its text content
    const newValue = editableRef.current
      ? editableRef.current.innerText
      : editingCell.value // Add this to the EditingCell type

    try {
      const response = await fetch('/api/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          fileName,
          [key]: newValue
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update cell')
      }

      await fetchData()
      setEditingCell(null)
      checkLabelCount()
    } catch (error) {
      console.error('Error updating cell:', error)
      alert('Failed to update cell. Please try again.')
    }
  }

  // Check count of labels and predictions to determine when to show evaluation and optimization controls
  const checkLabelCount = useCallback(() => {
    const validLabelCount = data.filter(row => row.label && row.label.trim() !== '').length;
    const validPredictionCount = data.filter(row => row.prediction && row.prediction.trim() !== '').length;

    // Show evaluation controls when there are enough labels
    if (validLabelCount >= MIN_LABELS_FOR_EVALUATION && !showEvaluationControls) {
      setShowEvaluationControls(true);
      if (!evaluationAlertShown && validLabelCount < MIN_LABELS_FOR_OPTIMIZATION) {
        alert("Evaluation mode unlocked! Scroll to the top to add your prompt and start evaluation.");
        setEvaluationAlertShown(true);
      }
    }

    // Show optimization alert when there are enough labels and predictions
    if (validLabelCount >= MIN_LABELS_FOR_OPTIMIZATION &&
      validPredictionCount >= MIN_LABELS_FOR_OPTIMIZATION &&
      showEvaluationControls &&
      !optimizationAlertShown) {
      alert('Optimization mode unlocked! Scroll to the top and click "Optimize Prompt" to start optimization.');
      setOptimizationAlertShown(true);
    }
  }, [data, showEvaluationControls, evaluationAlertShown, optimizationAlertShown, MIN_LABELS_FOR_EVALUATION, MIN_LABELS_FOR_OPTIMIZATION]);

  // Start the optimization process
  const handleOptimize = async () => {
    try {
      if (!fileName) {
        throw new Error('No file is currently loaded');
      }

      // First, check if optimization has already been completed
      const checkResponse = await fetch(`/api/optimize?tableName=${encodeURIComponent(getTableName(fileName))}`);

      if (checkResponse.ok) {
        const data = await checkResponse.json();
        if (data.results && data.results.length >= MAX_TRIALS) {
          alert(`Optimization has already been completed with ${MAX_TRIALS} trials!`);
          router.push(`/optimize?fileName=${encodeURIComponent(fileName)}`);
          return;
        }
      } else if (!checkResponse.ok) {
        // If optimization hasn't started, redirect and start the process
        router.push(`/optimize?fileName=${encodeURIComponent(fileName)}`);

        // Start the optimization process
        const startResponse = await fetch('/api/optimize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName, prompt, evaluationFields, model }), // Add model here
        });

        if (!startResponse.ok) {
          const errorData = await startResponse.json();
          throw new Error(errorData.error || 'Failed to start optimization process');
        }

        return;
      }

      // If we reach here, optimization is in progress
      router.push(`/optimize?fileName=${encodeURIComponent(fileName)}`);

    } catch (error) {
      console.error('Error handling optimization:', error);
      alert('Failed to handle optimization: ' + (error as Error).message);
    }
  };

  // Download the current table as a CSV file
  const handleDownload = async () => {
    try {
      if (!fileName) {
        throw new Error('No file is currently loaded');
      }
      const response = await fetch(`/api/upload?download=true&fileName=${encodeURIComponent(fileName)}`);
      if (!response.ok) {
        throw new Error('Failed to download data');
      }
      const blob = await response.blob();
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Error downloading data:', error);
      alert('Failed to download data. Please try again.');
    }
  };

  // Fetch data based on the URL
  useEffect(() => {
    if (shouldFetchFromUrl) {
      const fileNameFromUrl = searchParams.get('fileName');
      if (fileNameFromUrl && fileNameFromUrl !== fileName) {
        setFileName(fileNameFromUrl);
        fetchData(fileNameFromUrl);
      }
    }
  }, [searchParams, fetchData, fileName, shouldFetchFromUrl]);

  // Reset shouldFetchFromUrl after a delay after handleReset to prevent race condition
  useEffect(() => {
    if (!shouldFetchFromUrl) {
      const timer = setTimeout(() => {
        setShouldFetchFromUrl(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [shouldFetchFromUrl]);

  // Check count of labels and predictions to determine when to show evaluation and optimization controls
  useEffect(() => {
    checkLabelCount();
  }, [data, checkLabelCount]);

  // Poll the evaluation API to get the results every POLL_INTERVAL milliseconds
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (isEvaluating) {
      intervalId = setInterval(pollEval, POLL_INTERVAL);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isEvaluating, pollEval])

  // Add new useEffect after the other useEffects
  useEffect(() => {
    const fetchSiteMetrics = async () => {
      try {
        const response = await fetch('/api/site-metrics');
        if (response.ok) {
          const metrics = await response.json();
          const metricsObject = metrics.reduce((acc: { [key: string]: number }, metric: { metric_name: string; metric_value: number }) => {
            acc[metric.metric_name] = metric.metric_value;
            return acc;
          }, {});
          setSiteMetrics(metricsObject);
        }
      } catch (error) {
        console.error('Error fetching site metrics:', error);
      }
    };

    // Only fetch metrics when we're on the root page with no parameters
    if (!searchParams.toString()) {
      fetchSiteMetrics();
    }
  }, [searchParams]);

  // Don't show the info modal again if the user checks the checkbox
  const handleDontShowAgain = (dontShow: boolean) => {
    localStorage.setItem('dontShowInfoModal', dontShow.toString());
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="container-fluid p-4 bg-white text-gray-900">
        {!searchParams.toString() && (
          <FloatingSiteMetrics
            uploadFileCount={siteMetrics.upload_file_count || 0}
            uploadRowCount={siteMetrics.upload_row_count || 0}
            labeledFileCount={siteMetrics.labeled_file_count || 0}
            labeledRowCount={siteMetrics.labeled_row_count || 0}
            evaluateFileCount={siteMetrics.evaluate_file_count || 0}
            evaluateRowCount={siteMetrics.evaluate_row_count || 0}
            optimizedFileCount={siteMetrics.optimized_file_count || 0}
            optimizedTrialCount={siteMetrics.optimized_trial_count || 0}
          />
        )}

        <div className="flex items-center mb-4">
          <h1
            onClick={handleReset}
            className="text-3xl font-bold text-gray-900 flex items-center cursor-pointer hover:opacity-80"
          >
            <Image
              src="/favicon.svg"
              alt="ALIGN Eval Logo"
              width={28}
              height={28}
              className="mr-2"
            />
            AlignEval: Making Evals Easy, Fun, and Semi-Automated
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent the h1 click handler from firing
                setIsInfoModalOpen(true);
              }}
              className="ml-2 text-gray-500 hover:text-gray-700"
              aria-label="Information about ALIGN Eval"
            >
              <Image
                src="/info-icon.svg"
                alt="ALIGN Eval Logo"
                width={18}
                height={18}
                className="mr-2"
              />
            </button>
          </h1>
        </div>

        {isInfoModalOpen && (
          isMobile ? (
            <InfoModalMobile
              isOpen={isInfoModalOpen}
              onClose={() => setIsInfoModalOpen(false)}
              onDontShowAgain={handleDontShowAgain}
            />
          ) : (
            <InfoModal
              isOpen={isInfoModalOpen}
              onClose={() => setIsInfoModalOpen(false)}
              onDontShowAgain={handleDontShowAgain}
            />
          )
        )}

        {/* Floating components */}
        {metrics.sampleSize >= 1 && showEvaluationControls ? (
          <FloatingMetrics
            sampleSize={metrics.sampleSize}
            recall={metrics.recall}
            precision={metrics.precision}
            f1={metrics.f1}
            cohensKappa={metrics.cohensKappa}
            truePositives={metrics.truePositives}
            trueNegatives={metrics.trueNegatives}
            falsePositives={metrics.falsePositives}
            falseNegatives={metrics.falseNegatives}
            labeledRows={data.filter(row => row.label && row.label.trim() !== '').length}
          />
        ) : data.length > 0 ? (
          <FloatingLabeledSamples
            labeledCount={data.filter(row => row.label && row.label.trim() !== '').length}
            minLabelsRequired={MIN_LABELS_FOR_EVALUATION}
          />
        ) : null}

        {/* Instructions */}
        {data.length === 0 && <CsvUploadInstructions />}

        {data.length > 0 && data.filter(row => row.label && row.label.trim() !== '').length < MIN_LABELS_FOR_EVALUATION && !showEvaluationControls && (
          <LabelingModeInstructions
            labeledCount={data.filter(row => row.label && row.label.trim() !== '').length}
            minLabelsRequired={MIN_LABELS_FOR_EVALUATION}
          />
        )}

        {showEvaluationControls && !optimizationAlertShown && (
          <>
            {data.filter(row => row.label && row.label.trim() !== '').length >= MIN_LABELS_FOR_EVALUATION && (
              <EvaluationModeInstructions
                minLabelsForOptimization={MIN_LABELS_FOR_OPTIMIZATION}
              />
            )}
          </>
        )}

        {optimizationAlertShown && <OptimizationModeInstructions />}

        {/* Main content */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <FileUploadButton
            fileName={fileName}
            onFileSelect={handleFileSelect}
          />
          {data.length > 0 && (
            <>
              <DownloadButton onClick={handleDownload} />
              <DeleteButton onClick={handleDeleteData} />
            </>
          )}
        </div>

        {showEvaluationControls && (
          <div className="mb-4">
            <PromptTextArea prompt={prompt} setPrompt={setPrompt} />
            <div className="mt-3 flex gap-2 items-center">
              <ModelFieldsDropdown
                model={model}
                setModel={setModel}
              />
              <EvaluationFieldsDropdown
                evaluationFields={evaluationFields}
                setEvaluationFields={setEvaluationFields}
              />
              <EvaluateButton
                isEvaluating={isEvaluating}
                onClick={isEvaluating ? handleStopEvaluation : handleEvaluate}
              />
              {!isEvaluating && (
                <ClearEvaluationsButton onClick={handleClearEvaluations} />
              )}

              {showEvaluationControls &&
                data.filter(row => row.label && row.label.trim() !== '').length >= MIN_LABELS_FOR_OPTIMIZATION &&
                data.filter(row => row.prediction && row.prediction.trim() !== '').length >= MIN_LABELS_FOR_OPTIMIZATION && (
                  <OptimizeButton onClick={handleOptimize} />
                )}
            </div>
          </div>
        )}

        <Table
          data={data}
          handleCellEdit={handleCellEdit}
          handleCellUpdate={handleCellUpdate}
          editingCell={editingCell}
          editableRef={editableRef}
        />
      </div>
    </Suspense>
  )
}
