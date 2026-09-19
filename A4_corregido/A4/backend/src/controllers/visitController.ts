import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../config/database';
import { AuthenticatedRequest } from '../types';

interface VisitRow extends RowDataPacket {
  id: number;
  inspector_id: number;
  client_name: string;
  location_name: string;
  address: string | null;
  status: string;
  started_at: Date;
  ended_at: Date | null;
  steps_detected: number;
  distance_m: number;
  motion_summary: string | null;
  notes: string | null;
}

function inspectorId(request: AuthenticatedRequest): number {
  return request.inspector!.id;
}

export async function listVisits(request: AuthenticatedRequest, response: Response): Promise<void> {
  const { status, from, to } = request.query as Record<string, string | undefined>;
  const conditions = ['inspector_id = ?'];
  const values: (string | number)[] = [inspectorId(request)];

  if (status) {
    conditions.push('status = ?');
    values.push(status);
  }
  if (from) {
    conditions.push('started_at >= ?');
    values.push(from);
  }
  if (to) {
    conditions.push('started_at < DATE_ADD(?, INTERVAL 1 DAY)');
    values.push(to);
  }

  const [rows] = await pool.query<VisitRow[]>(
    `SELECT * FROM visits WHERE ${conditions.join(' AND ')} ORDER BY started_at DESC`,
    values,
  );
  response.json(rows);
}

export async function createVisit(request: AuthenticatedRequest, response: Response): Promise<void> {
  const { client_name: clientName, location_name: locationName, address } = request.body as Record<string, string>;
  if (!clientName || !locationName) {
    response.status(400).json({ message: 'client_name and location_name are required' });
    return;
  }

  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO visits (inspector_id, client_name, location_name, address, started_at) VALUES (?, ?, ?, ?, NOW())',
    [inspectorId(request), clientName.trim(), locationName.trim(), address?.trim() || null],
  );
  const [rows] = await pool.query<VisitRow[]>('SELECT * FROM visits WHERE id = ?', [result.insertId]);
  response.status(201).json(rows[0]);
}

async function getOwnedVisit(visitId: number, request: AuthenticatedRequest): Promise<VisitRow | undefined> {
  const [rows] = await pool.query<VisitRow[]>(
    'SELECT * FROM visits WHERE id = ? AND inspector_id = ?',
    [visitId, inspectorId(request)],
  );
  return rows[0];
}

export async function getVisit(request: AuthenticatedRequest, response: Response): Promise<void> {
  const visit = await getOwnedVisit(Number(request.params.id), request);
  if (!visit) {
    response.status(404).json({ message: 'Visit not found' });
    return;
  }

  const [evidence] = await pool.query<RowDataPacket[]>(
    'SELECT id, type, file_name, file_path, uploaded_at FROM evidence WHERE visit_id = ? ORDER BY uploaded_at DESC',
    [visit.id],
  );
  response.json({ ...visit, evidence });
}

export async function updateVisit(request: AuthenticatedRequest, response: Response): Promise<void> {
  const visitId = Number(request.params.id);
  const visit = await getOwnedVisit(visitId, request);
  if (!visit) {
    response.status(404).json({ message: 'Visit not found' });
    return;
  }

  const { status, steps_detected: stepsDetected, distance_m: distanceM, motion_summary: motionSummary, notes } = request.body;
  const nextStatus = status ?? 'completed';
  if (!['in_progress', 'completed', 'cancelled'].includes(nextStatus)) {
    response.status(400).json({ message: 'Invalid visit status' });
    return;
  }

  await pool.execute(
    `UPDATE visits SET status = ?, ended_at = ?, steps_detected = ?, distance_m = ?, motion_summary = ?, notes = ?
     WHERE id = ? AND inspector_id = ?`,
    [
      nextStatus,
      nextStatus === 'in_progress' ? null : new Date(),
      Number(stepsDetected ?? visit.steps_detected ?? 0),
      Number(distanceM ?? visit.distance_m ?? 0),
      motionSummary ?? visit.motion_summary,
      notes ?? visit.notes,
      visitId,
      inspectorId(request),
    ],
  );
  const updated = await getOwnedVisit(visitId, request);
  response.json(updated);
}

export async function deleteVisit(request: AuthenticatedRequest, response: Response): Promise<void> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM visits WHERE id = ? AND inspector_id = ?',
    [Number(request.params.id), inspectorId(request)],
  );
  if (result.affectedRows === 0) {
    response.status(404).json({ message: 'Visit not found' });
    return;
  }
  response.status(204).send();
}

export async function addEvidence(request: AuthenticatedRequest, response: Response): Promise<void> {
  const visitId = Number(request.params.id);
  const visit = await getOwnedVisit(visitId, request);
  if (!visit) {
    response.status(404).json({ message: 'Visit not found' });
    return;
  }
  const file = request.file;
  if (!file) {
    response.status(400).json({ message: 'A file is required in the evidence field' });
    return;
  }

  const type = file.mimetype.startsWith('image/')
    ? 'image'
    : file.mimetype.startsWith('video/')
      ? 'video'
      : 'document';
  const filePath = `/uploads/${file.filename}`;
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO evidence (visit_id, type, file_name, file_path) VALUES (?, ?, ?, ?)',
    [visitId, type, file.originalname, filePath],
  );
  response.status(201).json({ id: result.insertId, visit_id: visitId, type, file_name: file.originalname, file_path: filePath });
}
