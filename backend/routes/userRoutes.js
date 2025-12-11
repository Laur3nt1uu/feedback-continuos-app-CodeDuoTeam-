import express from 'express';
const router = express.Router();
import {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
} from '../controllers/userController.js';


router.post('/register', registerUser); 


router.post('/login', loginUser);

// Forgot password - trimite email cu link de resetare
router.post('/forgot-password', forgotPassword);

// Reset password cu token
router.post('/reset-password/:token', resetPassword);

export default router;