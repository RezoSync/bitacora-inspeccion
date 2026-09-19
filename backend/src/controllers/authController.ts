import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../config/database';
import { env } from '../config/env';

interface InspectorRow extends RowDataPacket {
  id: number;
  full_name: string;
  email: string;
  username: string;
  password_hash: string;
}

function createToken(inspector: Pick<InspectorRow, 'id' | 'username'>): string {
  return jwt.sign({ username: inspector.username }, env.jwtSecret, {
    subject: String(inspector.id),
    expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export async function register(request: Request, response: Response): Promise<void> {
  const { name, full_name: fullName, email, username, password } = request.body as Record<string, string>;
  const resolvedName = name ?? fullName;

  if (!resolvedName || !email || !username || !password) {
    response.status(400).json({ message: 'name, email, username and password are required' });
    return;
  }
  if (password.length < 8) {
    response.status(400).json({ message: 'Password must contain at least 8 characters' });
    return;
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO inspectors (full_name, email, username, password_hash) VALUES (?, ?, ?, ?)',
      [resolvedName, email.trim().toLowerCase(), username.trim(), passwordHash],
    );
    response.status(201).json({
      message: 'Inspector registered successfully',
      inspector: { id: result.insertId, full_name: resolvedName, email, username },
    });
  } catch (error: unknown) {
    const code = (error as { code?: string }).code;
    if (code === 'ER_DUP_ENTRY') {
      response.status(409).json({ message: 'Email or username is already registered' });
      return;
    }
    throw error;
  }
}

export async function login(request: Request, response: Response): Promise<void> {
  const { username, password } = request.body as Record<string, string>;
  if (!username || !password) {
    response.status(400).json({ message: 'username and password are required' });
    return;
  }

  const [rows] = await pool.execute<InspectorRow[]>(
    'SELECT id, full_name, email, username, password_hash FROM inspectors WHERE username = ? OR email = ? LIMIT 1',
    [username.trim(), username.trim().toLowerCase()],
  );
  const inspector = rows[0];
  if (!inspector || !(await bcrypt.compare(password, inspector.password_hash))) {
    response.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  response.json({
    token: createToken(inspector),
    inspector: {
      id: inspector.id,
      full_name: inspector.full_name,
      email: inspector.email,
      username: inspector.username,
    },
  });
}
