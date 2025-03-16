import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { verifyToken } from './middleware/auth';

dotenv.config();
const app = express();

// middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  }),
);
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`URL: ${req.originalUrl}, Datetime: ${new Date()}`);
  next();
});

// protected routes
app.get('/test', verifyToken, (req, res) => {
  res.json({
    message: 'Protected data',
    data: req.session,
  });
});

// listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
