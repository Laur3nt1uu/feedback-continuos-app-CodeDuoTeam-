// backend/models/Activity.js
const mongoose = require('mongoose');

const activitySchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  uniqueCode: { type: String, required: true, unique: true }, 
  startTime: { type: Date, default: Date.now }, 
  durationMinutes: { type: Number, required: true }, 
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);