// Rute pentru activități (creare, listare, etc.).
// Le definim aici și le protejăm cu middleware când e nevoie.
import express from 'express'; 
const router = express.Router();

import { 
    createActivity, 
    getActiveActivity, 
    getActivityFeedback,
    endActivity,
    getActivityHistory,
    getActivityById,
    exportActivityReport
} from '../controllers/activityController.js'; 

import { protect as auth, professorGuard } from '../middleware/authMiddleware.js'; 

router.post('/', auth, professorGuard, createActivity);
router.get('/active', auth, professorGuard, getActiveActivity);
router.get('/history', auth, professorGuard, getActivityHistory);
router.get('/:id', auth, professorGuard, getActivityById);
router.post('/:id/end', auth, professorGuard, endActivity);
router.get('/:id/feedback', auth, professorGuard, getActivityFeedback);
router.get('/:id/export', auth, professorGuard, exportActivityReport);

export default router;