import mysql from 'mysql2/promise';
import { env } from './env';

export const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true,
});

export async function verifyDatabaseConnection(): Promise<void> {
  const connection = await pool.getConnection();
  connection.release();
}
