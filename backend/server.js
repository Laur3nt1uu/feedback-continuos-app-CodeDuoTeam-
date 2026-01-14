// Serverul pornește Express și leagă modelele la DB, ca să meargă API-ul.
// E entrypoint-ul backend-ului
import express from 'express'; 
import cors from 'cors';
import dotenv from 'dotenv'; 
import { connectDB, sequelize } from './config/db.js';
import User from './models/User.js';
import Activity from './models/Activity.js';
import Feedback from './models/Feedback.js';
import userRoutes from './routes/userRoutes.js'; 
import activityRoutes from './routes/activityRoutes.js'; 
import feedbackRoutes from './routes/feedbackRoutes.js';


dotenv.config(); 

const defineRelations = () => {
    User.hasMany(Activity, { foreignKey: 'professorId', as: 'Activities' });
    Activity.belongsTo(User, { foreignKey: 'professorId', as: 'Professor' });
    Activity.hasMany(Feedback, { foreignKey: 'activityId', as: 'Feedbacks' });
    Feedback.belongsTo(Activity, { foreignKey: 'activityId', as: 'Activity' });
    console.log("Relațiile Sequelize au fost definite.");
};

defineRelations();
const app = express();

const allowedOrigins = [
    'https://feedback-continuos-app-codeduoteam-1.onrender.com',
    'https://feedback-app-frontend.onrender.com',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});


app.use('/api/activities', activityRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/users', userRoutes);


const PORT = process.env.PORT || 5000; 
const startServer = async () => {
    try {
        await connectDB(); 
        await sequelize.sync({ alter: true });
        console.log('✅ Tabelele Sequelize sincronizate cu succes.');

        app.listen(PORT, () => console.log(`Server rulând pe portul ${PORT}`));

    } catch (error) {
        console.error('❌ Eroare la pornirea serverului și sincronizarea DB:', error.message);
        process.exit(1);
    }
};

startServer();