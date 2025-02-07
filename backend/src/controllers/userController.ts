import { Request, Response, NextFunction } from 'express';
import db from '../db/config.js';
import bcrypt from 'bcrypt';

// GET /api/users
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const users = await db.any('SELECT * from users;');
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id
export const getUserByID = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params['id'];
    const user = await db.oneOrNone('SELECT * from users where id=($1);', id);
    if (!user) {
      res.status(400).json({ error: `User with id:${id} not found` });
    }
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

// POST /api/users
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    let passwordHash = await bcrypt.hash(password, 10);
    const user = await db.oneOrNone(
      `INSERT INTO USERS(email, password_hash, created_at, updated_at) 
      VALUES($1, $2, NOW(), NOW())
      ON CONFLICT(email) DO NOTHING
      RETURNING *;`,
      [email, passwordHash],
    );
    if (!user) {
      res.status(400).json({ error: 'Email aleady exists' });
      return;
    }
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};
