import { parse } from 'csv-parse'
import { stringify } from 'csv-stringify/sync'
import { NextRequest, NextResponse } from 'next/server'
import { createEvalTable, insertEvals } from '@/app/lib/actions'
import { fetchEvals } from '@/app/lib/data'

// Add this near the top of the file
const MAX_UPLOAD_ROWS = Number(process.env.MAX_UPLOAD_ROWS);

// Upload a CSV file to the database
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const content = Buffer.from(buffer)

    // Parse CSV
    const records = await new Promise<string[][]>((resolve, reject) => {
      parse(content, (err, records) => {
        if (err) reject(err)
        else resolve(records)
      })
    })

    if (records.length < 2) {
      return NextResponse.json({ error: 'CSV file must contain headers and at least one data row' }, { status: 400 })
    }

    const headers = records[0]
    const labelIndex = headers.indexOf('label')
    
    // Count labeled rows if label column exists
    let labeledRowCount = 0
    if (labelIndex !== -1) {
      labeledRowCount = records.slice(1).filter(row => 
        row[labelIndex] && row[labelIndex].trim() !== ''
      ).length
    }

    // Update metrics
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
    const host = req.headers.get('host') || 'localhost:3000'
    const baseUrl = `${protocol}://${host}`

    // Don't await these requests
    fetch(`${baseUrl}/api/site-metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric_name: 'upload_file_count',
        increment_by: 1
      })
    }).catch(error => console.error('Error updating file count metric:', error))

    fetch(`${baseUrl}/api/site-metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric_name: 'upload_row_count',
        increment_by: records.length - 1
      })
    }).catch(error => console.error('Error updating row count metric:', error))

    // Update labeled rows count if any exist
    if (labeledRowCount > 0) {
      fetch(`${baseUrl}/api/site-metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric_name: 'labeled_file_count',
          increment_by: 1
        })
      }).catch(error => console.error('Error updating labeled file count metric:', error))

      fetch(`${baseUrl}/api/site-metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric_name: 'labeled_row_count',
          increment_by: labeledRowCount
        })
      }).catch(error => console.error('Error updating labeled row count metric:', error))
    }

    // Create table
    const { tableExists, tableName } = await createEvalTable(file.name, headers)

    if (tableExists) {
      return NextResponse.json({ 
        message: 'Table already exists',
        tableName: tableName,
        tableExists: true
      }, { status: 200 })
    }

    // Insert data
    const { insertedRowCount, totalRowCount } = await insertEvals(file.name, headers, records.slice(1))

    return NextResponse.json({ 
      message: `File processed successfully. ${insertedRowCount} rows inserted (maximum of ${MAX_UPLOAD_ROWS}).`,
      totalRows: totalRowCount,
      insertedRows: insertedRowCount,
      tableName: tableName,
      tableExists: false
    }, { status: 200 })
  } catch (error) {
    console.error('Error processing upload:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Error processing upload', details: errorMessage }, { status: 500 })
  }
}

// Get data from database with option to download
export async function GET(req: NextRequest) {
  const fileName = req.nextUrl.searchParams.get('fileName')
  
  if (!fileName) {
    return NextResponse.json({ error: 'File name is required' }, { status: 400 })
  }

  if (req.nextUrl.searchParams.get('download') === 'true') {
    try {
      const data = await fetchEvals(fileName);

      // Convert data to CSV
      const csv = stringify(data, {
        header: true,
        columns: Object.keys(data[0] || {}),
      })

      // Create and return the CSV file
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=${fileName}`,
        },
      })
    } catch (error) {
      console.error('Error downloading data:', error)
      return NextResponse.json({ error: 'Error downloading data' }, { status: 500 })
    }
  } else {
    try {
      const data = await fetchEvals(fileName);
      return NextResponse.json(data)
    } catch (error) {
      if (error instanceof Error && error.message.includes('relation') && error.message.includes('does not exist')) {   
        console.error(`Error fetching data: ${error.message.split('\n')[0]}`)
        return NextResponse.json({ error: 'Error fetching data' }, { status: 404 })
      } else {
        console.error('Error fetching data:', error)
        return NextResponse.json({ error: 'Error fetching data' }, { status: 500 })
      }
    }
  }
}
