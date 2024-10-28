import sqlite3 from 'sqlite3'
import { open, Database as SQLiteDatabase } from 'sqlite'
import { Pool, QueryResult } from 'pg'

// Define a generic type for database rows
type DbRow = Record<string, string | number | boolean | null>;

export interface DbWrapper {
  all: (sql: string, params?: unknown[]) => Promise<DbRow[]>;
  get: (sql: string, params?: unknown[]) => Promise<DbRow | undefined>;
  run: (sql: string, params?: unknown[]) => Promise<void>;
  close: () => Promise<void>;
}

class SQLiteWrapper implements DbWrapper {
  private db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  async all(sql: string, params?: unknown[]): Promise<DbRow[]> {
    return this.db.all(sql, params);
  }

  async get(sql: string, params?: unknown[]): Promise<DbRow | undefined> {
    return this.db.get(sql, params);
  }

  async run(sql: string, params?: unknown[]): Promise<void> {
    await this.db.run(sql, params);
  }

  async close(): Promise<void> {
    await this.db.close();
  }
}

class PostgresWrapper implements DbWrapper {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async all(sql: string, params?: unknown[]): Promise<DbRow[]> {
    const client = await this.pool.connect();
    try {
      const result: QueryResult<DbRow> = await client.query(sql, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async get(sql: string, params?: unknown[]): Promise<DbRow | undefined> {
    const client = await this.pool.connect();
    try {
      const result: QueryResult<DbRow> = await client.query(sql, params);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async run(sql: string, params?: unknown[]): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(sql, params);
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export async function getDb(): Promise<DbWrapper> {
  if (process.env.RAILWAY_ENVIRONMENT) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    return new PostgresWrapper(pool);
  } else {
    const db = await open({
      filename: '../database.sqlite',
      driver: sqlite3.Database
    });
    return new SQLiteWrapper(db);
  }
}
