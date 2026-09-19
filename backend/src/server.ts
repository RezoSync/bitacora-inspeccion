import fs from 'fs';
import path from 'path';
import { app } from './app';
import { pool, verifyDatabaseConnection } from './config/database';
import { env } from './config/env';

fs.mkdirSync(path.resolve(env.uploadDir), { recursive: true });

app.listen(env.port, async () => {
  console.log(`API listening on http://localhost:${env.port}`);
  try {
    await verifyDatabaseConnection();
    console.log('MySQL connection verified');
  } catch (error) {
    console.error('MySQL connection failed. Check your .env values.', error);
  }
});

process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});
