// backend/routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const Feedback = require('../models/Feedback');


const checkExpiry = (activity) => {
    const endTime = new Date(activity.startTime.getTime() + activity.durationMinutes * 60000);
    return new Date() > endTime;
};


router.post('/join', async (req, res) => {
  const { uniqueCode } = req.body;
  const activity = await Activity.findOne({ uniqueCode: uniqueCode.toUpperCase() });
  
  if (!activity) return res.status(404).json({ message: 'Cod invalid.' });
  
  if (checkExpiry(activity)) return res.status(403).json({ message: 'Activitatea a expirat.' });
  
 
  res.status(200).json({ activityId: activity._id, name: activity.name });
});


router.post('/', async (req, res) => {
  const { activityId, reactionType } = req.body;
  
  try {
    const activity = await Activity.findById(activityId);
    if (!activity) return res.status(404).json({ message: 'Activitatea nu a fost găsită.' });

    if (checkExpiry(activity)) return res.status(403).json({ message: 'Nu se mai poate acorda feedback. Activitatea a expirat.' });

   
    await Feedback.create({
      activityId,
      reactionType: reactionType.toUpperCase(),
      timestamp: Date.now(),
    });
    res.status(201).json({ message: 'Feedback înregistrat anonim.' });
  } catch (error) {
    res.status(500).json({ message: 'Eroare la salvare feedback.' });
  }
});

module.exports = router;