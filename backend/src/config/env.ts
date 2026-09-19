import dotenv from 'dotenv';

dotenv.config();

const required = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'] as const;
for (const name of required) {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  db: {
    host: process.env.DB_HOST as string,
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME as string,
  },
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  uploadDir: process.env.UPLOAD_DIR ?? 'src/uploads',
};
