// backend/server.js
import express from 'express'; 
import cors from 'cors';
import dotenv from 'dotenv'; 
import mongoose from 'mongoose';


import userRoutes from './routes/userRoutes.js'; 


import activityRoutes from './routes/activityRoutes.js'; 
import feedbackRoutes from './routes/feedbackRoutes.js';


dotenv.config(); 


const connectDB = async () => {
  try {
    
    const conn = await mongoose.connect(process.env.MONGO_URI); 
    console.log(`MongoDB Conectat: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Eroare de Conexiune: ${error.message}`);
    process.exit(1); 
  }
};


connectDB(); 

const app = express();


app.use(cors());
app.use(express.json());


app.use('/api/activities', activityRoutes);
app.use('/api/feedback', feedbackRoutes);

app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000; 

app.listen(PORT, () => console.log(`Server rulând pe portul ${PORT}`));