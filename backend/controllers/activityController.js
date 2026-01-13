import Activity from '../models/Activity.js';
import User from '../models/User.js'; 
import Feedback from '../models/Feedback.js'; 
import { Op, literal } from 'sequelize';

const generateUniqueCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();
const createActivity = async (req, res) => {
    const professorId = req.user.id; 
    const { name, description, durationMinutes } = req.body;

    if (!name || !description || !durationMinutes) {
        return res.status(400).json({ message: 'Câmpuri obligatorii lipsă.' });
    }

    try {
        const currentTime = new Date();
        
        const existingActive = await Activity.findOne({
            where: {
                professorId: professorId,
              
                [Op.and]: [
                    literal(`"startTime" + ("durationMinutes" * interval '1 minute') > NOW()`)
                ]
            },
        });

        if (existingActive) {
            return res.status(400).json({ message: `Ai deja o activitate activă (${existingActive.name}). Oprește-o înainte de a crea alta.` });
        }
        
        let uniqueCode = generateUniqueCode();
        const activity = await Activity.create({
            name, 
            description, 
            durationMinutes, 
            uniqueCode,
            professorId: professorId, 
            startTime: currentTime,
        });
        
        
        res.status(201).json({ 
            id: activity.id, 
            uniqueCode: activity.uniqueCode, 
            startTime: activity.startTime,
            durationMinutes: activity.durationMinutes,
            name: activity.name 
        });
        
    } catch (error) {
        console.error("EROARE CRITICĂ la POST /activities:", error);
        if (error.name === 'SequelizeUniqueConstraintError') { 
            return res.status(409).json({ message: 'Codul unic generat a intrat in coliziune. Incearca din nou.' });
        }
        res.status(500).json({ message: 'Eroare la crearea activității.' });
    }
};



const getActiveActivity = async (req, res) => {
    const professorId = req.user.id; 

    try {
        const activity = await Activity.findOne({
            where: {
                professorId: professorId, 
                [Op.and]: [
                    literal(`"startTime" + ("durationMinutes" * interval '1 minute') > NOW()`)
                ]
            },
            order: [['startTime', 'DESC']] 
        });

        if (!activity) {
            return res.status(404).json({ message: 'Nici o activitate activă găsită.' });
        }
        
        res.status(200).json({ 
            id: activity.id, 
            uniqueCode: activity.uniqueCode, 
            startTime: activity.startTime,
            durationMinutes: activity.durationMinutes,
            name: activity.name
        });

    } catch (error) {
        console.error("Eroare la preluarea activitatii active:", error);
        res.status(500).json({ message: 'Eroare server la verificare activitate.' });
    }
};



const getActivityFeedback = async (req, res) => {
    const activityId = req.params.id;
    const professorId = req.user.id;
    
    try {
        const activity = await Activity.findByPk(activityId); 
        if (!activity) {
            return res.status(404).json({ message: "Activitatea nu a fost găsită." });
        }
        if (activity.professorId.toString() !== professorId.toString()) {
            return res.status(403).json({ message: "Nu aveți dreptul să vizualizați acest feedback." });
        }

        const feedbackList = await Feedback.findAll({ 
            where: { activityId: activityId },
            attributes: ['reactionType', 'timestamp'] 
        });
        
        res.status(200).json({ details: feedbackList });
    } catch (error) {
        console.error("EROARE LA GET /activities/:id/feedback:", error);
        if (error.name === 'SequelizeDatabaseError') {
             return res.status(404).json({ message: "ID de activitate invalid sau baza de date." });
        }
        res.status(500).json({ message: 'Eroare la preluarea feedback-ului.' }); 
    }
};


export {
    createActivity,
    getActiveActivity,
    getActivityFeedback,
};