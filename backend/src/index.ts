import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';

dotenv.config();
const app = express();

// middleware
app.use(express.json());
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`URL: ${req.originalUrl}, Datetime: ${new Date()}`);
  next();
});

// routes
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
