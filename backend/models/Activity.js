import mongoose from 'mongoose';

const activitySchema = mongoose.Schema({
  name: { 
        type: String, 
        required: true 
    },
  description: { 
        type: String, 
        required: true 
    },
 
    professor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', 
    },
  uniqueCode: { 
        type: String, 
        required: true, 
        unique: true 
    }, 
  startTime: { 
        type: Date, 
        default: Date.now 
    }, 
  durationMinutes: { 
        type: Number, 
        required: true 
    }, 
}, { 
    timestamps: true 
});


export default mongoose.model('Activity', activitySchema);