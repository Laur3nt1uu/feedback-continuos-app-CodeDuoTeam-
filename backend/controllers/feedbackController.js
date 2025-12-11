import Activity from '../models/Activity.js';
import Feedback from '../models/Feedback.js';
import { Op } from 'sequelize'; 


/**
 * @desc    Verifică expirarea activității
 * @param   {object} activity - Obiectul Sequelize Activity
 * @returns {boolean} - Returnează true dacă activitatea a expirat
 */
const checkExpiry = (activity) => {
    // În Sequelize, data este deja un obiect Date sau poate fi accesată direct
    // Trebuie să calculăm endTime = startTime + durationMinutes
    
    // Asigură-te că startTime este un obiect Date
    const startTime = activity.startTime instanceof Date ? activity.startTime : new Date(activity.startTime);
    
    // Calculăm timpul de sfârșit în milisecunde
    const endTime = startTime.getTime() + activity.durationMinutes * 60000;
    
    return new Date().getTime() > endTime;
};


/**
 * @desc    Alăturarea la o activitate folosind un cod unic
 * @route   POST /api/feedback/join
 * @access  Public
 */
const joinActivity = async (req, res) => {
    const { uniqueCode } = req.body;
    
    if (!uniqueCode) return res.status(400).json({ message: 'Codul unic este obligatoriu.' });

    // Normalize input: trim whitespace and uppercase to avoid mismatches
    const normalizedCode = uniqueCode.toString().trim().toUpperCase();
    if (!normalizedCode) return res.status(400).json({ message: 'Codul unic este invalid.' });
    try {
        // 🛑 SCHIMBARE: Sequelize findOne cu obiectul 'where'
        const activity = await Activity.findOne({ 
            where: { uniqueCode: normalizedCode } 
        });
        
        if (!activity) {
            return res.status(404).json({ message: 'Cod invalid sau activitate inexistentă.' });
        }
        
        // Verifică expirarea (logică mutată din rută)
        if (checkExpiry(activity)) {
            return res.status(403).json({ message: 'Activitatea a expirat.' });
        }
        
        // 🛑 SCHIMBARE: Folosim activity.id în loc de activity._id
        res.status(200).json({ 
            activityId: activity.id, 
            name: activity.name 
        });
        
    } catch (error) {
        console.error("Eroare la join activity:", error);
        res.status(500).json({ message: 'Eroare la server.' });
    }
};


/**
 * @desc    Înregistrarea feedback-ului pentru o activitate activă
 * @route   POST /api/feedback
 * @access  Public
 */
const submitFeedback = async (req, res) => {
    const { activityId, reactionType } = req.body;
    
    if (!activityId || !reactionType) {
        return res.status(400).json({ message: 'ID activitate și tip reacție sunt obligatorii.' });
    }
    
    try {
        // 🛑 SCHIMBARE: Sequelize findByPk în loc de findById
        const activity = await Activity.findByPk(activityId);

        if (!activity) {
            return res.status(404).json({ message: 'Activitatea nu a fost găsită.' });
        }

        // Verifică expirarea
        if (checkExpiry(activity)) {
            return res.status(403).json({ message: 'Nu se mai poate acorda feedback. Activitatea a expirat.' });
        }

        // 🛑 SCHIMBARE: Sequelize create
        await Feedback.create({
            activityId,
            reactionType: reactionType.toUpperCase(),
            // Sequelize va seta 'timestamp' și 'createdAt' automat (dacă modelul le include)
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