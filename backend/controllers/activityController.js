//Controller pentru activități — creez, listez și administrez activități.
// Majoritatea funcțiilor sunt apelate din rute când profesorul vrea să gestioneze activitățile.
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
                endTime: null, 
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
                endTime: null, 
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
            name: activity.name,
            endTime: activity.endTime
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

const endActivity = async (req, res) => {
    const activityId = req.params.id;
    const professorId = req.user.id;

    try {
        const activity = await Activity.findByPk(activityId);
        if (!activity) {
            return res.status(404).json({ message: "Activitatea nu a fost găsită." });
        }
        if (activity.professorId.toString() !== professorId.toString()) {
            return res.status(403).json({ message: "Nu aveți dreptul să opriți această activitate." });
        }

        activity.endTime = new Date();
        await activity.save();

        res.status(200).json({ message: "Activitate oprită cu succes.", activity });
    } catch (error) {
        console.error("Eroare la oprire activitate:", error);
        res.status(500).json({ message: 'Eroare la oprire activitate.' });
    }
};

const getActivityHistory = async (req, res) => {
    const professorId = req.user.id;

    try {
        const activities = await Activity.findAll({
            where: { professorId: professorId },
            attributes: ['id', 'name', 'startTime', 'endTime', 'durationMinutes', 'uniqueCode'],
            order: [['startTime', 'DESC']]
        });

        res.status(200).json(activities);
    } catch (error) {
        console.error("Eroare la preluare istoric:", error);
        res.status(500).json({ message: 'Eroare la preluare istoric.' });
    }
};

const getActivityById = async (req, res) => {
    const activityId = req.params.id;
    const professorId = req.user.id;

    try {
        const activity = await Activity.findOne({
            where: { 
                id: activityId,
                professorId: professorId
            }
        });

        if (!activity) {
            return res.status(404).json({ message: 'Activitatea nu a fost găsită.' });
        }

        res.status(200).json(activity);
    } catch (error) {
        console.error("Eroare la preluare activitate:", error);
        res.status(500).json({ message: 'Eroare la preluare activitate.' });
    }
};

const exportActivityReport = async (req, res) => {
    const activityId = req.params.id;
    const format = req.query.format || 'json';
    const professorId = req.user.id;

    try {
        const activity = await Activity.findByPk(activityId);
        if (!activity) {
            return res.status(404).json({ message: "Activitatea nu a fost găsită." });
        }
        if (activity.professorId.toString() !== professorId.toString()) {
            return res.status(403).json({ message: "Nu aveți dreptul să exportați acest raport." });
        }

        const feedbackList = await Feedback.findAll({
            where: { activityId: activityId },
            attributes: ['reactionType', 'timestamp'],
            raw: true
        });

        const report = {
            activity: {
                name: activity.name,
                startTime: activity.startTime,
                endTime: activity.endTime,
                duration: activity.durationMinutes
            },
            feedbackCount: feedbackList.length,
            feedback: feedbackList
        };

        if (format === 'json') {
            res.json(report);
        } else if (format === 'csv') {
            let csv = 'Tip Reacție,Timp\n';
            feedbackList.forEach(fb => {
                csv += `${fb.reactionType},"${new Date(fb.timestamp).toLocaleString()}"\n`;
            });
            res.header('Content-Type', 'text/csv');
            res.header('Content-Disposition', `attachment; filename="raport_${activityId}.csv"`);
            res.send(csv);
        }
    } catch (error) {
        console.error("Eroare la export raport:", error);
        res.status(500).json({ message: 'Eroare la export raport.' });
    }
};


export {
    createActivity,
    getActiveActivity,
    getActivityFeedback,
    endActivity,
    getActivityHistory,
    getActivityById,
    exportActivityReport,
};