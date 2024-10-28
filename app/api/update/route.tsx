import { NextRequest, NextResponse } from 'next/server'
import { updateEvalRow, clearEvals, dropEvalTable } from '@/app/lib/actions'

// Update a row in the database
export async function PUT(req: NextRequest) {
  const { id, fileName, ...updates } = await req.json()

  if (!fileName) {
    return NextResponse.json({ error: 'File name is required' }, { status: 400 })
  }

    // Update metrics
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
    const host = req.headers.get('host') || 'localhost:3000'
    const baseUrl = `${protocol}://${host}`
  
    fetch(`${baseUrl}/api/site-metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
      metric_name: 'labeled_row_count',
      increment_by: 1
    })
  }).catch(error => console.error('Error updating row count metric:', error))

  try {
    const result = await updateEvalRow(fileName, id, updates);
    return NextResponse.json({ message: result.message })
  } catch (error) {
    console.error('Error updating row:', error)
    return NextResponse.json({ error: 'Failed to update row' }, { status: 500 })
  }
}

// Clear explanations and predictions column
export async function POST(req: NextRequest) {
  try {
    const { action, fileName } = await req.json()

    if (!fileName) {
      return NextResponse.json({ error: 'File name is required' }, { status: 400 })
    }

    if (action === 'clearEvaluations') {
      const result = await clearEvals(fileName);
      return NextResponse.json({ message: result.message }, { status: 200 })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error clearing evaluations:', error)
    return NextResponse.json({ error: 'Error clearing evaluations' }, { status: 500 })
  }
}

// Delete a table from the database
export async function DELETE(req: NextRequest) {
  const fileName = req.nextUrl.searchParams.get('fileName')
  
  if (!fileName) {
    return NextResponse.json({ error: 'File name is required' }, { status: 400 })
  }

  try {
    const result = await dropEvalTable(fileName);
    return NextResponse.json({ message: result.message }, { status: 200 })
  } catch (error) {
    console.error('Error deleting table:', error)
    return NextResponse.json({ error: 'Error deleting table' }, { status: 500 })
  }
}
