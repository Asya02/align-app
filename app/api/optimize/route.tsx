import { NextRequest, NextResponse } from 'next/server';
import { getTableName } from '@/app/lib/utils';
import { fetchMetrics, fetchRunRowCount } from '@/app/lib/data';
import { dropOptimizationData } from '@/app/lib/actions';

const BACKEND_URL = process.env.LABEL_HPO_URL
const MAX_TRIALS = parseInt(process.env.MAX_TRIALS || '5')
const FETCH_TIMEOUT = 300000; // 5 minutes in milliseconds

export async function POST(req: NextRequest) {
  const { fileName, prompt, evaluationFields, model } = await req.json();
  const tableName = getTableName(fileName);

  if (!tableName || !prompt || !evaluationFields || !model) {
    return NextResponse.json({ error: 'Table name, prompt, evaluation fields, and model are required' }, { status: 400 });
  }

  if (!BACKEND_URL) {
    console.error('LABEL_HPO_URL is not set');
    return NextResponse.json({ error: 'Backend URL is not configured' }, { status: 500 });
  }

  // Update metrics
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
  const host = req.headers.get('host') || 'localhost:3000'
  const baseUrl = `${protocol}://${host}`

  // Don't await these requests, but now use MAX_TRIALS constant
  fetch(`${baseUrl}/api/site-metrics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      metric_name: 'optimized_file_count',
      increment_by: 1
    })
  }).catch(error => console.error('Error updating file count metric:', error))

  fetch(`${baseUrl}/api/site-metrics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      metric_name: 'optimized_trial_count',
      increment_by: MAX_TRIALS // Use the constant here instead of directly accessing env var
    })
  }).catch(error => console.error('Error updating trial count metric:', error))

  try {
    const backendUrl = new URL('/optimize', BACKEND_URL);
    
    // Create AbortController with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    // Start optimization process
    console.log(`Starting optimization process with ${backendUrl}`);
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableName, prompt, evaluationFields, model }),
      signal: controller.signal,
    });

    // Clear the timeout
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to start optimization process: ${response.statusText}. Error: ${errorText}`);
    }

    const result = await response.json();
    return NextResponse.json({ message: 'Optimization process started', tableName, result });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`Request still running after ${FETCH_TIMEOUT / 60000} minutes: ${error.message.split('\n')[0]}`);
      return NextResponse.json({ 
        message: `Request still running after ${FETCH_TIMEOUT / 60000} minutes...`, 
      }, { status: 200 });
    } else {
      console.error('Error starting optimization:', error);
    }
    
    return NextResponse.json({ error: 'Failed to start optimization', details: (error as Error).message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const tableName = req.nextUrl.searchParams.get('tableName');

  if (!tableName) {
    return NextResponse.json({ error: 'Table name is required' }, { status: 400 });
  }

  try {
    let message = '';
    let rowCount = null;
    const rows = await fetchMetrics(tableName);

    if (rows.length === 0) {
      return NextResponse.json({ message: 'No optimization results found' }, { status: 404 });
    }

    // Get the largest run_number from the existing rows
    const largestRunNumber = Math.max(...rows.map(row => row.run_number as number));
    const largestF1 = Math.max(...rows.map(row => row.f1 as number));

    if (largestRunNumber === MAX_TRIALS) {
      rowCount = await fetchRunRowCount(tableName, '_test');
      // console.log(`table: ${tableName}_hpo_run_test, rowCount: ${rowCount}`);
      message = `Ran ${largestRunNumber} trials! Evaluating on test set...`
      return NextResponse.json({ results: rows, message, rowCount }, { status: 200 });
    } else if (largestF1 > 0.95) {
      message = `Optimization completed; dev F1 score > 0.95!`;
      rowCount = await fetchRunRowCount(tableName, '_test');
      // console.log(`table: ${tableName}_hpo_run_test, rowCount: ${rowCount}`);
      return NextResponse.json({ results: rows, message, rowCount }, { status: 200 });
    } else if (largestRunNumber === MAX_TRIALS + 1) {
      message = `Optimization completed! Check metrics on test.`;
      rowCount = await fetchRunRowCount(tableName, '_test');
      // console.log(`table: ${tableName}_hpo_run_test, rowCount: ${rowCount}`);
      return NextResponse.json({ results: rows, message, rowCount }, { status: 200 });
    }

    // Check if the next run table exists
    const nextRunNumber = largestRunNumber + 1;
    rowCount = await fetchRunRowCount(tableName, nextRunNumber.toString());

    if (rowCount !== null) {
      message = `Running trial ${nextRunNumber}...`;
    } else {
      if (largestRunNumber === 0) {
        message = `Starting optimization...`;
      } else {
        // If the next run table doesn't exist, use the current run table
        rowCount = await fetchRunRowCount(tableName, largestRunNumber.toString());
        message = rowCount !== null
          ? `Running trial ${largestRunNumber}...`
          : `Running trial ${nextRunNumber}...`;
      }
    }

    return NextResponse.json({
      results: rows,
      message,
      rowCount,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('relation') && error.message.includes('does not exist')) {
      console.error(`Error checking run table: ${error.message.split('\n')[0]}`);
      return NextResponse.json({ error: 'Run table does not exist' }, { status: 404 });
    } else {
      console.error('Error fetching optimization results:', error);
      return NextResponse.json({ error: 'Failed to fetch optimization results' }, { status: 500 });
    }
  }
}

export async function DELETE(req: NextRequest) {
  const { tableName } = await req.json();

  if (!tableName) {
    return NextResponse.json({ error: 'Table name is required' }, { status: 400 });
  }

  try {
    await dropOptimizationData(tableName);
    return NextResponse.json({ message: 'Optimization data deleted successfully' });
  } catch (error) {
    console.error('Error deleting optimization data:', error);
    return NextResponse.json({ error: 'Failed to delete optimization data' }, { status: 500 });
  }
}
