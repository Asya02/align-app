import { getDb } from '@/app/lib/db';
import { getTableName } from '@/app/lib/utils';
import type { InputOutput } from '@/app/lib/definitions';

export async function fetchEvals(fileName: string) {
  const db = await getDb();
  const tableName = getTableName(fileName);

  try {
    const data = await db.all(`
      SELECT id, input, output, label, explanation, prediction 
      FROM "${tableName}" 
      ORDER BY row_number
    `);
    return data;
  } catch (error) {
    if (error instanceof Error && error.message.includes('relation') && error.message.includes('does not exist')) {   
      console.error(`Error fetching evals:, ${error.message.split('\n')[0]}`);
      return [];
    } else {
      console.error('Error fetching evals:', error);
      throw error;
    }
  } finally {
    await db.close();
  }
}

export async function fetchInputOutput(fileName: string): Promise<InputOutput[]> {
  const db = await getDb();
  const tableName = getTableName(fileName);

  try {
    const data = await db.all(`
      SELECT id, input, output 
      FROM "${tableName}" 
      WHERE COALESCE(explanation, '') = '' OR COALESCE(prediction, '') = ''
      ORDER BY row_number
    `) as InputOutput[];
    return data;
  } catch (error) {
    console.error('Error fetching input and output:', error);
    throw error;
  } finally {
    await db.close();
  }
}

export async function fetchExplanationPrediction(fileName: string) {
  const db = await getDb();
  const tableName = getTableName(fileName);

  try {
    const data = await db.all(`
      SELECT id, explanation, prediction 
      FROM "${tableName}"
      ORDER BY row_number
    `)
    return data;
  } catch (error) {
    console.error('Error fetching explanations and predictions:', error);
    throw error;
  } finally {
    await db.close();
  }
}

export async function fetchMetrics(tableName: string) {
  const db = await getDb();
  const metricsTable = `${tableName}_hpo_metrics`;

  try {
    const rows = await db.all(`
      SELECT
        id,
        run_number,
        -- substr(prompt, 1, 80) || '...' AS prompt,
        prompt,
        precision,
        recall,
        f1,
        cohens_kappa,
        true_positives,
        false_positives,
        true_negatives,
        false_negatives,
        split_type,
        evaluation_fields,
        evaluation_model
      FROM "${metricsTable}"
      ORDER BY run_number
    `);
    return rows;
  } catch (error) {
    if (error instanceof Error && error.message.includes('relation') && error.message.includes('does not exist')) {   
      console.error(`Error checking metrics table: ${error.message.split('\n')[0]}`);
      return [];
    } else {
      console.error('Error fetching metrics:', error);
      throw error;
    }
  } finally {
    await db.close();
  }
}

export async function fetchRunRowCount(tableName: string, runNumber: string): Promise<number | null> {
  const db = await getDb();
  const runTable = `${tableName}_hpo_run${runNumber}`;

  try {
    const result = await db.get(`SELECT COUNT(*) as count FROM "${runTable}"`);
    return result?.count as number | null;
  } catch (error) {
    if (error instanceof Error && error.message.includes('relation') && error.message.includes('does not exist')) {
      console.error(`Error checking run table: ${error.message.split('\n')[0]}`);
      return null;
    } else {
      console.error('Error checking run table:', error);
      throw error;
    }
  } finally {
    await db.close();
  }
}
