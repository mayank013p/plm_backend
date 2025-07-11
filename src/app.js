const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(cors({
  origin: ['http://localhost:3000'], // your frontend origin
  credentials: true                 // if you're sending cookies or auth headers
}));
// Import routes
const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/authRoutes');
const materialRoutes = require('./routes/materialRoutes');
const studyPlannerRoutes = require('./routes/studyPlannerRoutes');
const progressTrackerRoutes = require('./routes/progressTrackerRoutes');
// const mockTestsRoutes = require('./routes/mockTestsRoutes');
// const mentorshipRoutes = require('./routes/mentorshipRoutes');
const chatRoutes = require('./routes/chatRoutes');
// const careerRoutes = require('./routes/careerRoutes');
// const aiAssistantRoutes = require('./routes/aiAssistantRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

// Use routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/study-planner', studyPlannerRoutes);
app.use('/api/progress-tracker', progressTrackerRoutes);
// app.use('/api/mock-tests', mockTestsRoutes);
// app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/chat', chatRoutes);
// app.use('/api/career', careerRoutes);
// app.use('/api/ai-assistant', aiAssistantRoutes);
app.use('/api/settings', settingsRoutes);

module.exports = app;
