import express from 'express';
const router = express.Router();

import {
    joinActivity,
    submitFeedback,
} from '../controllers/feedbackController.js';

router.post('/join', joinActivity);



router.post('/', submitFeedback);


export default router;