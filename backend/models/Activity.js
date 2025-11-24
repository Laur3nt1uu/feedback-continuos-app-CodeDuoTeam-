// backend/models/Activity.js
const mongoose = require('mongoose');

const activitySchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  uniqueCode: { type: String, required: true, unique: true }, // Codul unic de acces
  startTime: { type: Date, default: Date.now }, // Momentul când începe activitatea
  durationMinutes: { type: Number, required: true }, // Durata
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);