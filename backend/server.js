import express from 'express'; 
import cors from 'cors';
import dotenv from 'dotenv'; 
// 🛑 SCHIMBARE: Eliminăm Mongoose
// import mongoose from 'mongoose'; 

// 🛑 SCHIMBARE: Importăm logica de conexiune și instanța Sequelize
import { connectDB, sequelize } from './config/db.js';

// 🛑 SCHIMBARE: Importăm toate modelele pentru a le sincroniza și a defini relațiile
import User from './models/User.js';
import Activity from './models/Activity.js';
import Feedback from './models/Feedback.js';


import userRoutes from './routes/userRoutes.js'; 
import activityRoutes from './routes/activityRoutes.js'; 
import feedbackRoutes from './routes/feedbackRoutes.js';


dotenv.config(); 

// ---------------------------------------------------------------------
// 🛑 SCHIMBARE CRITICĂ: DEFINIREA RELAȚIILOR
// Acest pas este obligatoriu în Sequelize pentru a crea cheile străine

const defineRelations = () => {
    // 1. User (Profesor) <-> Activity (Unu la Mulți)
    User.hasMany(Activity, { foreignKey: 'professorId', as: 'Activities' });
    Activity.belongsTo(User, { foreignKey: 'professorId', as: 'Professor' });

    // 2. Activity <-> Feedback (Unu la Mulți)
    Activity.hasMany(Feedback, { foreignKey: 'activityId', as: 'Feedbacks' });
    Feedback.belongsTo(Activity, { foreignKey: 'activityId', as: 'Activity' });

    console.log("Relațiile Sequelize au fost definite.");
};

defineRelations();
// ---------------------------------------------------------------------


const app = express();


app.use(cors());
app.use(express.json());


app.use('/api/activities', activityRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/users', userRoutes);


const PORT = process.env.PORT || 5000; 

// 🛑 SCHIMBARE CRITICĂ: Conectarea și Pornirea Serverului cu Sequelize

// Funcție asincronă pentru a gestiona conexiunea și sincronizarea
const startServer = async () => {
    try {
        // 1. Testează Conexiunea la DB
        await connectDB(); 
        
        // 2. Sincronizează Modelele (creează/actualizează tabelele)
        // { alter: true } modifică tabelele existente fără a le șterge (recomandat pentru dezvoltare)
        await sequelize.sync({ alter: true });
        console.log('✅ Tabelele Sequelize sincronizate cu succes.');

        // 3. Pornește Serverul Express
        app.listen(PORT, () => console.log(`Server rulând pe portul ${PORT}`));

    } catch (error) {
        console.error('❌ Eroare la pornirea serverului și sincronizarea DB:', error.message);
        process.exit(1);
    }
};

startServer();