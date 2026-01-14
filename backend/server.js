
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * PRODUCTION MIDDLEWARE
 * Standard security and data handling
 */
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allows for large task lists

/**
 * MONGODB CONNECTION
 * Ensure you provide MONGODB_URI in your environment variables on Render/Heroku
 */
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("FATAL ERROR: MONGODB_URI is not defined in environment variables.");
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB Cluster'))
  .catch(err => {
    console.error('MongoDB connection error details:', err.message);
    process.exit(1);
  });

/**
 * DATA SCHEMA
 * Single-document storage strategy for high-performance state syncing
 */
const DataSchema = new mongoose.Schema({
  id: { type: String, default: 'main_storage', unique: true },
  tasks: { type: Array, default: [] },
  teamMembers: { type: [String], default: ['Akhilesh', 'Pravallika', 'Chandu', 'Sharanya'] }
}, { 
  timestamps: true,
  minimize: false 
});

const DataModel = mongoose.model('WorkspaceData', DataSchema);

/**
 * API ENDPOINTS
 */

// 1. FETCH ALL: Used on app load and polling
app.get('/api/data', async (req, res) => {
  try {
    let data = await DataModel.findOne({ id: 'main_storage' });
    if (!data) {
      // Initialize if first time
      data = await DataModel.create({ id: 'main_storage' });
    }
    res.status(200).json(data);
  } catch (err) {
    console.error('Fetch Error:', err);
    res.status(500).json({ error: 'Failed to retrieve data from database' });
  }
});

// 2. SYNC STATE: Handles all creates, updates, and deletes from the frontend
app.post('/api/sync', async (req, res) => {
  const { tasks, teamMembers, passcode } = req.body;

  // Security Check: Prevents unauthorized API calls
  if (passcode !== 'admin123' && passcode !== 'team2024') {
    return res.status(403).json({ error: 'Access Denied: Invalid Passcode' });
  }

  try {
    const updatedData = await DataModel.findOneAndUpdate(
      { id: 'main_storage' },
      { tasks, teamMembers },
      { new: true, upsert: true }
    );
    res.status(200).json({ 
      success: true, 
      message: 'State synchronized with MongoDB Atlas',
      lastUpdated: updatedData.updatedAt 
    });
  } catch (err) {
    console.error('Sync Error:', err);
    res.status(500).json({ error: 'Failed to synchronize state' });
  }
});

/**
 * SERVER LIFECYCLE
 */
app.get('/health', (req, res) => res.status(200).send('OK'));

app.listen(PORT, () => {
  console.log(`----------------------------------------`);
  console.log(`WORK SPACE API: RUNNING`);
  console.log(`PORT: ${PORT}`);
  console.log(`MONGODB: ${MONGODB_URI.split('@')[1] || 'Connected'}`);
  console.log(`----------------------------------------`);
});
