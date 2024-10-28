import { getDb } from '@/app/lib/db';
import { getTableName } from '@/app/lib/utils';

// Add this at the top with other imports
const MAX_UPLOAD_ROWS = Number(process.env.MAX_UPLOAD_ROWS);

export async function createEvalTable(fileName: string, headers: string[]) {
  const db = await getDb();
  const tableName = getTableName(fileName);

  try {
    // Check if the table already exists
    const tableExistsResult = await db.get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = $1
      )`,
      [tableName]
    );
    const tableExists = tableExistsResult?.exists || false;

    if (tableExists) {
      return { tableExists: true, tableName };
    }

    // Check if 'explanation' and 'prediction' columns already exist
    const hasExplanation = headers.includes('explanation');
    const hasPrediction = headers.includes('prediction');

    // Prepare columns for table creation
    const tableColumns = [
      '"row_number" INTEGER',
      ...headers.map(header => `"${header}" TEXT`),
      ...(!hasExplanation ? ['"explanation" TEXT DEFAULT \'\''] : []),
      ...(!hasPrediction ? ['"prediction" TEXT DEFAULT \'\''] : [])
    ];

    // Create table dynamically based on CSV headers
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS "${tableName}" (
        ${tableColumns.join(',')}
      )
    `;

    await db.run(createTableQuery);

    return { tableExists: false, tableName };
  } finally {
    await db.close();
  }
}

export async function insertEvals(fileName: string, headers: string[], records: string[][]) {
  const db = await getDb();
  const tableName = getTableName(fileName);

  try {
    const placeholders = ['$1', ...headers.map((_, i) => `$${i + 2}`)];
    const columnsToInsert = ['row_number', ...headers];
    
    // Only add 'explanation' and 'prediction' to the columns and placeholders if they don't exist
    if (!headers.includes('explanation')) {
      columnsToInsert.push('explanation');
      placeholders.push('\'\'');
    }
    if (!headers.includes('prediction')) {
      columnsToInsert.push('prediction');
      placeholders.push('\'\'');
    }

    const insertQuery = `INSERT INTO "${tableName}" (${columnsToInsert.map(c => `"${c}"`).join(',')}) VALUES (${placeholders.join(',')})`;
    
    const dataToInsert = records.slice(0, MAX_UPLOAD_ROWS); // Take up to MAX_UPLOAD_ROWS rows

    for (let i = 0; i < dataToInsert.length; i++) {
      await db.run(insertQuery, [i + 1, ...dataToInsert[i]]);
    }

    return {
      insertedRowCount: dataToInsert.length,
      totalRowCount: records.length
    };
  } finally {
    await db.close();
  }
}

export async function dropEvalTable(fileName: string) {
  const db = await getDb();
  const tableName = getTableName(fileName);

  try {
    // Drop the specified table
    await db.run(`DROP TABLE IF EXISTS "${tableName}"`);
    return { success: true, message: 'Table dropped successfully' };
  } catch (error) {
    console.error('Error dropping table:', error);
    throw error;
  } finally {
    await db.close();
  }
}

export async function updateEvalRow(fileName: string, id: number, updates: Record<string, string>) {
  const db = await getDb();
  const tableName = getTableName(fileName);

  try {
    const updateFields = Object.keys(updates).map((key, index) => `"${key}" = $${index + 2}`).join(', ');
    const query = `UPDATE "${tableName}" SET ${updateFields} WHERE id = $1`;
    const values = [id, ...Object.values(updates)];

    await db.run(query, values);
    return { success: true, message: 'Row updated successfully' };
  } catch (error) {
    console.error('Error updating row:', error);
    throw error;
  } finally {
    await db.close();
  }
}

export async function clearEvals(fileName: string) {
  const db = await getDb();
  const tableName = getTableName(fileName);

  try {
    const clearQuery = `
      UPDATE "${tableName}" 
      SET explanation = '', prediction = ''
    `;

    await db.run(clearQuery);
    return { success: true, message: 'Evaluations cleared successfully' };
  } catch (error) {
    console.error('Error clearing evaluations:', error);
    throw error;
  } finally {
    await db.close();
  }
}

export async function insertExplanationPrediction(fileName: string, id: number, explanation: string, prediction: string) {
  const db = await getDb();
  const tableName = getTableName(fileName);

  const query = `
      UPDATE "${tableName}" 
      SET "explanation" = $1, "prediction" = $2 
      WHERE id = $3
  `;

  try {
    await db.run(query, [explanation, prediction, id]);
    return { success: true, message: 'Explanation and prediction inserted successfully' };
  } catch (error) {
    console.error('Error inserting explanation and prediction:', error);
    console.error('Query:', query);
    console.error('Values:', [explanation, prediction, id]);
    throw error;
  } finally {
    await db.close();
  }
}

export async function dropOptimizationData(tableName: string) {
  const db = await getDb();
  const maxTrials = parseInt(process.env.MAX_TRIALS || '5');

  try {
    // Drop the metrics table
    await db.run(`DROP TABLE IF EXISTS ${tableName}_hpo_metrics`);
    await db.run(`DROP TABLE IF EXISTS ${tableName}_hpo_run_test`);

    // Loop through and drop run tables
    for (let i = 1; i <= maxTrials; i++) {
      await db.run(`DROP TABLE IF EXISTS ${tableName}_hpo_run${i}`);
    }
  } catch (error) {
    console.error('Error deleting optimization data:', error);
    throw error;
  } finally {
    await db.close();
  }
}
