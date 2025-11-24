// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv'); 
const mongoose = require('mongoose');


dotenv.config(); 


const activityRoutes = require('./routes/activityRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');


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

const PORT = process.env.PORT || 5000; 

app.listen(PORT, () => console.log(`Server rulând pe portul ${PORT}`));