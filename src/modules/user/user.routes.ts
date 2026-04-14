import express from 'express';
import { getUsers } from './user.controller';

const router = express.Router();

router.get('/', getUsers);

const userController = require('./user.controller');

// Authentication routes
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.post('/forgot-password', userController.forgotPassword);
router.post('/change-password', userController.changePassword);

export default router;
