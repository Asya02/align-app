import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/app/lib/db'

// Initialize metrics table if it doesn't exist
async function initializeMetricsTable() {
  const db = await getDb()
  await db.run(`
    CREATE TABLE IF NOT EXISTS site_metrics (
      id SERIAL PRIMARY KEY,
      metric_name VARCHAR(50) NOT NULL,
      metric_value BIGINT DEFAULT 0,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(metric_name)
    )
  `)

  // Initialize metrics if they don't exist
  const metrics = [
    'upload_file_count',
    'upload_row_count',
    'labeled_file_count',
    'labeled_row_count',
    'evaluate_file_count',
    'evaluate_row_count',
    'optimized_file_count',
    'optimized_trial_count'
  ]

  for (const metric of metrics) {
    await db.run(`
      INSERT INTO site_metrics (metric_name, metric_value)
      VALUES ($1, 0)
      ON CONFLICT (metric_name) DO NOTHING
    `, [metric])
  }
}

// Increment a specific metric
async function incrementMetric(metricName: string, incrementBy: number = 1) {
  const db = await getDb()
  console.log(`INCREMENT ${metricName} +${incrementBy}`)
  await db.run(`
    UPDATE site_metrics 
    SET 
      metric_value = metric_value + $1,
      last_updated = CURRENT_TIMESTAMP
    WHERE metric_name = $2
  `, [incrementBy, metricName])
}

// Get all metrics
export async function GET() {
  try {
    await initializeMetricsTable()
    const db = await getDb()
    const metrics = await db.all('SELECT * FROM site_metrics')
    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json({ error: 'Error fetching metrics' }, { status: 500 })
  }
}

// Update metrics
export async function POST(req: NextRequest) {
  try {
    const { metric_name, increment_by = 1 } = await req.json()

    if (!metric_name) {
      return NextResponse.json({ error: 'metric_name is required' }, { status: 400 })
    }

    await initializeMetricsTable()
    await incrementMetric(metric_name, increment_by)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating metrics:', error)
    return NextResponse.json({ error: 'Error updating metrics' }, { status: 500 })
  }
}
