import { Request } from 'express';

export interface JwtPayload {
  email: string;
  username: string;
  sub: number;
}

export interface JwtRequestUser {
  id: number;
  username: string;
  email: string;
} ///< i.e. req.user

// Extend the Express Request interface
export interface JwtAuthenticatedRequest extends Request {
  user: JwtRequestUser;
}
