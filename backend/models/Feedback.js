import mongoose from 'mongoose'; 

const feedbackSchema = mongoose.Schema({
  activityId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: 'Activity' 
    },
  reactionType: { 
        type: String, 
        required: true, 
        enum: ['SMILEY', 'FROWNY', 'SURPRISED', 'CONFUSED'] 
    },
  timestamp: { 
        type: Date, 
        default: Date.now 
    }, 
  isAnonymous: { 
        type: Boolean, 
        default: true 
    } 
}, { 
    timestamps: true 
});


export default mongoose.model('Feedback', feedbackSchema);