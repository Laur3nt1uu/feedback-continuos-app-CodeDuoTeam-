import express from 'express';
const router = express.Router();
import {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    validateResetToken,
} from '../controllers/userController.js';


router.post('/register', registerUser); 
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.get('/reset-password/:token', validateResetToken);
router.post('/reset-password/:token', resetPassword);

export default router;