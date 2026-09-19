import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  inspector?: {
    id: number;
    username: string;
  };
}
