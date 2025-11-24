// backend/routes/activityRoutes.js
const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const Feedback = require('../models/Feedback');

const generateUniqueCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();


router.post('/', async (req, res) => {
  console.log("CERERE PRIMITĂ: Creare Activitate."); // <-- ADĂUGAT AICI!
  
  const { name, description, durationMinutes } = req.body;
  if (!name || !description || !durationMinutes) return res.status(400).json({ message: 'Câmpuri obligatorii lipsă.' });

  try {
    const activity = await Activity.create({
      name, description, durationMinutes, 
      uniqueCode: generateUniqueCode(),
      startTime: Date.now(),
    });
   
    res.status(201).json({ id: activity._id, uniqueCode: activity.uniqueCode, startTime: activity.startTime });
  } catch (error) {
    res.status(500).json({ message: 'Eroare la crearea activității.' });
  }
});


router.get('/:id/feedback', async (req, res) => {
  try {
   
    const feedbackList = await Feedback.find({ activityId: req.params.id }).select('reactionType timestamp');
    res.status(200).json({ details: feedbackList });
  } catch (error) {
   console.error("EROARE LA API /activities:", error);s
    
   
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Eroare la crearea activității.' }); 
  }
});

module.exports = router;