import { Router } from 'express';
import {
  getAllUsers,
  createUser,
  getUserByID,
} from '../controllers/userController.js';

const router = Router();

router.get('/', getAllUsers);
router.get('/:id', getUserByID);
router.post('/', createUser);

export default router;
