import express from 'express'; 
const router = express.Router();

import { 
    createActivity, 
    getActiveActivity, 
    getActivityFeedback 
} from '../controllers/activityController.js'; 

import { protect as auth, professorGuard } from '../middleware/authMiddleware.js'; 



router.post('/', auth, professorGuard, createActivity);


router.get('/active', auth, professorGuard, getActiveActivity);


router.get('/:id/feedback', auth, professorGuard, getActivityFeedback);




export default router;