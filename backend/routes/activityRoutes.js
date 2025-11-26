import express from 'express'; 
const router = express.Router();
import Activity from '../models/Activity.js'; 
import Feedback from '../models/Feedback.js'; 


import { protect, professorGuard } from '../middleware/authMiddleware.js'; 


const generateUniqueCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();



router.post('/', protect, professorGuard, async (req, res) => {
  
    console.log(`CERERE PRIMITĂ: Creare Activitate de la Profesorul ID: ${req.user._id}`);
    
    const { name, description, durationMinutes } = req.body;
    if (!name || !description || !durationMinutes) return res.status(400).json({ message: 'Câmpuri obligatorii lipsă.' });

    try {
        const activity = await Activity.create({
            name, 
            description, 
            durationMinutes, 
            uniqueCode: generateUniqueCode(),
            startTime: Date.now(),
            professor: req.user._id,
        });
        
        res.status(201).json({ 
            id: activity._id, 
            uniqueCode: activity.uniqueCode, 
            startTime: activity.startTime,
            durationMinutes: activity.durationMinutes,
            name: activity.name 
        });
    } catch (error) {
        console.error("EROARE CRITICĂ la POST /activities:", error);
        if (error.code === 11000) { 
            return res.status(409).json({ message: 'Codul unic generat a intrat in coliziune. Incearca din nou.' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Eroare la crearea activității.' });
    }
});



router.get('/active', async (req, res) => {
    try {
       ă
        const activity = await Activity.findOne({
            $expr: { 
                $gt: [
                    { $add: ['$startTime', { $multiply: ['$durationMinutes', 60000] }] },
                    new Date() 
                ]
            }
        }).sort({ startTime: -1 }); 

        if (!activity) {
            return res.status(404).json({ message: 'Nicio activitate activă găsită.' });
        }
        
        res.status(200).json({ 
            id: activity._id, 
            uniqueCode: activity.uniqueCode, 
            startTime: activity.startTime,
            durationMinutes: activity.durationMinutes,
            name: activity.name
        });

    } catch (error) {
        console.error("Eroare la preluarea activitatii active:", error);
        res.status(500).json({ message: 'Eroare server la verificare activitate.' });
    }
});



router.get('/:id/feedback', protect, professorGuard, async (req, res) => {
    try {
        
        const activity = await Activity.findById(req.params.id);

        if (!activity) {
            return res.status(404).json({ message: "Activitatea nu a fost găsită." });
        }

        
        if (activity.professor.toString() !== req.user._id.toString()) {
             return res.status(403).json({ message: "Nu aveți dreptul să vizualizați acest feedback." });
        }
        
        const feedbackList = await Feedback.find({ activityId: req.params.id }).select('reactionType timestamp');
        res.status(200).json({ details: feedbackList });
    } catch (error) {
       console.error("EROARE LA GET /activities/:id/feedback:", error);
       if (error.name === 'CastError') {
           return res.status(404).json({ message: "ID de activitate invalid." });
       }
       res.status(500).json({ message: 'Eroare la preluarea feedback-ului.' }); 
    }
});



export default router;