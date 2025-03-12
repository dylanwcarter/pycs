import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { auth } from 'express-oauth2-jwt-bearer';
import userRoutes from './routes/userRoutes.js';
import cors from 'cors';

dotenv.config();
const app = express();
const jwtCheck = auth({
  audience: 'https://predictyourcrops.com',
  issuerBaseURL: 'https://dev-70z0yvfe2suqrf7k.us.auth0.com/',
  tokenSigningAlg: 'RS256',
});

// middleware
app.use(express.json());
app.use(jwtCheck);
app.use(cors());
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`URL: ${req.originalUrl}, Datetime: ${new Date()}`);
  next();
});

// public routes
app.use('/api/users', userRoutes);

// protected routes

// listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
