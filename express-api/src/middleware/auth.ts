import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AMR {
  method: string;
  timestamp: number;
}

interface AppMetaData {
  provider: string;
  providers: string[];
}

interface UserMetadata {
  email_verified: boolean;
}

export interface DecodedToken {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  email: string;
  phone: string;
  app_metadata: AppMetaData;
  user_metadata: UserMetadata;
  role: string;
  aal: string;
  amr: AMR[];
  session_id: string;
  is_anonymous: boolean;
  email_confirmed_at?: string;
  phone_confirmed_at?: string;
  new_email?: string;
  new_phone?: string;
}

declare global {
  namespace Express {
    interface Request {
      session?: DecodedToken;
    }
  }
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    req.session = decoded;
    next();
  } catch (error) {
    handleJWTError(error, res);
    return;
  }
};

const handleJWTError = (error: unknown, res: Response) => {
  if (error instanceof jwt.TokenExpiredError) {
    res.status(401).json({ message: 'Token has expired' });
  } else if (error instanceof jwt.JsonWebTokenError) {
    res.status(401).json({ message: 'Invalid token' });
  } else {
    res.status(500).json({ message: 'Authentication failed' });
  }
};
