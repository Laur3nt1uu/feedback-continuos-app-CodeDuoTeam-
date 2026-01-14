// Controller pentru feedback — aici se scrie logica când se primește feedback.
// Conține funcții care citesc/scriu feedback în DB
import Activity from '../models/Activity.js';
import Feedback from '../models/Feedback.js';
import { Op } from 'sequelize'; 
 


const checkExpiry = (activity) => {

    const startTime = activity.startTime instanceof Date ? activity.startTime : new Date(activity.startTime);
    const endTime = startTime.getTime() + activity.durationMinutes * 60000;
    
    return new Date().getTime() > endTime;
};


const joinActivity = async (req, res) => {
    const { uniqueCode } = req.body;
    
    if (!uniqueCode)
         return res.status(400).json({ message: 'Codul unic este obligatoriu.' });
    const normalizedCode = uniqueCode.toString().trim().toUpperCase();
    if (!normalizedCode) 
        return res.status(400).json({ message: 'Codul unic este invalid.' });
    try {
        
        const activity = await Activity.findOne({ 
            where: { uniqueCode: normalizedCode } 
        });
        
        if (!activity) {
            return res.status(404).json({ message: 'Cod invalid sau activitate inexistentă.' });
        }
        
        if (checkExpiry(activity)) {
            return res.status(403).json({ message: 'Activitatea a expirat.' });
        }
        
        res.status(200).json({ 
            activityId: activity.id, 
            name: activity.name 
        });
        
    } catch (error) {
        console.error("Eroare la join activity:", error);
        res.status(500).json({ message: 'Eroare la server.' });
    }
};



const submitFeedback = async (req, res) => {
    const { activityId, reactionType } = req.body;
    
    if (!activityId || !reactionType) {
        return res.status(400).json({ message: 'ID activitate și tip reacție sunt obligatorii.' });
    }
    
    try {
        const activity = await Activity.findByPk(activityId);

        if (!activity) {
            return res.status(404).json({ message: 'Activitatea nu a fost găsită.' });
        }

        
        if (checkExpiry(activity)) {
            return res.status(403).json({ message: 'Nu se mai poate acorda feedback. Activitatea a expirat.' });
        }

        await Feedback.create({
            activityId,
            reactionType: reactionType.toUpperCase(),
        });
        
        res.status(201).json({ message: 'Feedback înregistrat anonim.' });
        
    } catch (error) {
        console.error("Eroare la salvare feedback:", error);
        res.status(500).json({ message: 'Eroare la salvare feedback.' });
    }
};


export {
    joinActivity,
    submitFeedback,
};