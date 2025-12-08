import express from 'express';
const router = express.Router();

// 🛑 SCHIMBARE: Eliminăm logica și importăm Controlerul
import {
    joinActivity,
    submitFeedback,
} from '../controllers/feedbackController.js';

// 🛑 Eliminăm importurile Mongoose și logica de verificare a timpului


// RUTA: POST /join (Alăturare la activitate)
router.post('/join', joinActivity);



router.post('/', submitFeedback);


export default router;