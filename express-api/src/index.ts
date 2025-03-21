import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { verifyToken } from './middleware/auth';
import mlRoutes from './routes/mlRoutes';

dotenv.config();
const app = express();

// middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  }),
);
app.use(express.json());
app.use('/ml', verifyToken, mlRoutes);

// listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
