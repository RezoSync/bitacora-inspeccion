export type VisitStatus = 'in_progress' | 'completed' | 'cancelled';

export interface Inspector {
  id: number;
  full_name: string;
  email: string;
  username: string;
}

export interface Visit {
  id: number;
  client_name: string;
  location_name: string;
  address: string | null;
  status: VisitStatus;
  started_at: string;
  ended_at: string | null;
  steps_detected: number;
  distance_m: number;
  motion_summary: string | null;
  notes: string | null;
}

export interface VisitDetail extends Visit {
  evidence: Array<{ id: number; type: string; file_name: string; file_path: string; uploaded_at: string }>;
}
